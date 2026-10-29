"""Acabamento da voz gravada (assets/voice/<idioma>/*.mp3), depois do `npm run voices`.

- acelera a fala sem mudar o tom da voz (TEMPO);
- corta o silêncio do começo e do fim (a voz entra na hora certa do bipe);
- tira o grave que o alto-falante do celular não toca (sobra volume para o resto);
- deixa todas as frases com o mesmo volume, sem distorcer;
- salva em mp3 mono 64 kbps (voz não precisa de mais; o app fica menor).

Precisa de python3 com numpy e do ffmpeg. Uso: python3 scripts/polish-voices.py [--tempo 1.15] [arquivos...]
Os originais da ElevenLabs ficam em voice-src/ (fora do app), para refazer se precisar.
"""
import os, shutil, subprocess, sys
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
VOICE = os.path.join(ROOT, 'assets', 'voice')
RAW = os.path.join(ROOT, 'voice-src')  # originais, fora de assets/ (não vão para o app)
RATE = 44100
TEMPO = 1.15           # 1.0 = velocidade original da ElevenLabs; 1.15 = 15% mais rápida
TARGET_RMS_DB = -16.0   # volume médio da fala
PEAK_DB = -1.0          # teto
GATE_DB = -40.0         # abaixo disso (em relação ao pico da frase) é silêncio
PRE, POST = 0.012, 0.06  # respiro mantido antes e depois da fala (s)


def decode(path, tempo=TEMPO):
    # atempo muda a velocidade mantendo o tom (não fica voz de esquilo)
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(RATE),
                          '-af', f'highpass=f=110:poles=2,atempo={tempo}', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)


def encode(x, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(RATE), '-ac', '1', '-i', '-',
                    '-codec:a', 'libmp3lame', '-b:a', '64k', path], input=pcm, check=True)


def envelope(x, win=0.01):
    n = max(1, int(win * RATE))
    return np.sqrt(np.convolve(x * x, np.ones(n) / n, mode='same'))


def polish(x):
    env = envelope(x)
    gate = env.max() * 10 ** (GATE_DB / 20)
    on = np.where(env > gate)[0]
    if len(on) == 0:
        return x
    a = max(0, on[0] - int(PRE * RATE))
    b = min(len(x), on[-1] + int(POST * RATE))
    x = x[a:b].copy()
    # volume: RMS só das partes com fala
    env = envelope(x)
    speech = x[env > env.max() * 10 ** ((GATE_DB + 20) / 20)]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else np.sqrt(np.mean(x ** 2))
    x *= 10 ** (TARGET_RMS_DB / 20) / max(rms, 1e-6)
    # limitador suave: picos acima do teto são arredondados, não cortados
    ceil = 10 ** (PEAK_DB / 20)
    knee = ceil * 0.7
    over = np.abs(x) > knee
    x[over] = np.sign(x[over]) * (knee + (ceil - knee) * np.tanh((np.abs(x[over]) - knee) / (ceil - knee)))
    # rampas curtas nas pontas, sem estalo
    f = min(len(x) // 4, int(0.006 * RATE))
    if f > 0:
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
    return x


def main(args):
    tempo = TEMPO
    if '--tempo' in args:
        i = args.index('--tempo')
        tempo = float(args[i + 1])
        args = args[:i] + args[i + 2:]
    files = args
    if not shutil.which('ffmpeg'):
        sys.exit('Precisa do ffmpeg (no Mac: brew install ffmpeg).')
    if not files:
        files = [os.path.join(VOICE, l, f) for l in ('en', 'pt') if os.path.isdir(os.path.join(VOICE, l))
                 for f in sorted(os.listdir(os.path.join(VOICE, l))) if f.endswith('.mp3')]
    for path in files:
        rel = os.path.relpath(path, VOICE)
        raw = os.path.join(RAW, rel)
        if not os.path.exists(raw):  # guarda o original uma vez só
            os.makedirs(os.path.dirname(raw), exist_ok=True)
            shutil.copy2(path, raw)
        x = polish(decode(raw, tempo))
        encode(x, path)
        print(f'  ✔ {rel}  {len(x) / RATE:.2f}s')
    print(f'Pronto: {len(files)} áudios (velocidade {tempo}x).')


if __name__ == '__main__':
    main(sys.argv[1:])
