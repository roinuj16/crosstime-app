"""Gera os sons do CrossTimer (WAV mono 16 bits, 44,1 kHz) em assets/sounds/.

Todos os sons são sintetizados aqui — nenhum arquivo de terceiros.
Rodar de novo: python3 scripts/make-sounds.py   (precisa de numpy e scipy)

Pensados para o alto-falante do celular num box barulhento:
- o celular quase não toca abaixo de ~400 Hz, então a energia fica entre 0,8 e 5 kHz
  (os graves são cortados: assim sobra volume para o que se ouve);
- ataque rápido e bem definido, para marcar o tempo com precisão;
- todos com volume parecido e um limitador suave: altos, sem distorcer.
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt

RATE = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'sounds')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


# ---------- blocos ----------
def t_axis(dur):
    return np.arange(int(dur * RATE)) / RATE


def adsr(n, a, d, s=0.0, r=0.02, hold=None):
    """ataque linear de a s, queda exponencial (constante d s) até o nível s, soltura de r s no fim."""
    t = np.arange(n) / RATE
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    if hold is not None:  # corta depois de `hold` s com soltura
        k = int(hold * RATE)
        if k < n:
            e[k:] *= np.exp(-(t[k:] - t[k]) / max(r, 1e-6))
    rn = int(r * RATE)
    if rn and n > rn:
        e[-rn:] *= np.linspace(1, 0, rn)
    return e


def tone(dur, f, partials=((1, 1.0),), a=0.003, d=10.0, s=0.0, r=0.02, hold=None, detune=0.0):
    """soma de parciais (razão, ganho) sobre a frequência f, com envelope."""
    t = t_axis(dur)
    x = np.zeros_like(t)
    for ratio, g in partials:
        ph = rng.uniform(0, 2 * np.pi)
        x += g * np.sin(2 * np.pi * f * ratio * (1 + detune) * t + ph)
    return x * adsr(len(t), a, d, s, r, hold)


def bell_partial(t, f, g, decay):
    return g * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) * np.exp(-t / decay)


def noise_burst(dur, lo, hi, decay):
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    sos = butter(4, [lo, hi], btype='band', fs=RATE, output='sos')
    return sosfilt(sos, n) * np.exp(-t / decay)


def fade_out(x, dur):
    """rampa no fim, para um som que ainda está soando não terminar com estalo."""
    n = min(len(x), int(dur * RATE))
    x = x.copy()
    x[-n:] *= np.linspace(1, 0, n) ** 2
    return x


def place(*parts):
    """mistura trechos em posições (início em s): place((0, x), (0.2, y))."""
    end = max(int(st * RATE) + len(x) for st, x in parts)
    out = np.zeros(end)
    for st, x in parts:
        i = int(st * RATE)
        out[i:i + len(x)] += x
    return out


def master(x, drive_db=1.5, hp=380, ceiling_db=-0.8, tail=0.012):
    """corta graves que o celular não toca e deixa o som o mais alto possível sem distorcer:
    o pico é empurrado `drive_db` acima do teto e o limitador suave (tanh) arredonda o excesso."""
    x = sosfilt(butter(4, hp, btype='high', fs=RATE, output='sos'), x)
    c = 10 ** (ceiling_db / 20)
    x = x * (c * 10 ** (drive_db / 20) / max(np.abs(x).max(), 1e-9))
    x = c * np.tanh(x / c)  # limitador suave
    n = int(tail * RATE)
    if n and len(x) > n:
        x[-n:] *= np.linspace(1, 0, n)
    x[:32] *= np.linspace(0, 1, 32)
    return x


def save(name, x):
    import wave
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm)


# ---------- troca de fase (um por estilo) ----------
# Bipe: dois tons limpos subindo (mi → lá), como um timer profissional de academia.
BEEP = ((1, 1.0), (2, 0.18), (3, 0.08))
save('phase_beep', master(place(
    (0.00, tone(0.13, 1318.5, BEEP, a=0.002, d=10, s=1, r=0.03, hold=0.1)),
    (0.17, tone(0.24, 1760.0, BEEP, a=0.002, d=10, s=1, r=0.05, hold=0.19)),
)))

# Ringue: sino de luta (parciais inarmônicas de sino), batido duas vezes.
def ring_bell(dur=1.6, f=780):
    t = t_axis(dur)
    x = sum(bell_partial(t, f * r, g, dcy) for r, g, dcy in
            [(1, 1.0, 0.9), (2.32, 0.7, 0.55), (2.97, 0.45, 0.45), (4.07, 0.35, 0.3), (5.43, 0.22, 0.2), (6.8, 0.12, 0.12)])
    strike = noise_burst(0.02, 2500, 7000, 0.004)
    x[:len(strike)] += 0.6 * strike
    return fade_out(x, 0.35)
save('phase_bell', master(place((0, ring_bell()), (0.26, 0.85 * ring_bell()))))

# Gongo: metal grave com brilho, afinado alto o bastante para o celular tocar.
def gong(dur=2.4, f=330):
    t = t_axis(dur)
    x = np.zeros_like(t)
    for r, g, dcy in [(1, 0.6, 1.4), (1.52, 1.0, 1.1), (2.08, 0.8, 0.9), (2.76, 0.6, 0.7), (3.6, 0.45, 0.5), (4.9, 0.3, 0.35), (6.3, 0.15, 0.25)]:
        wob = 1 + 0.004 * np.sin(2 * np.pi * 4.5 * t)  # leve ondulação do metal
        x += g * np.sin(2 * np.pi * f * r * t * wob + rng.uniform(0, 6.28)) * np.exp(-t / dcy)
    x *= np.minimum(1, t / 0.012)
    hit = noise_burst(0.02, 1500, 6000, 0.006)
    x[:len(hit)] += 0.5 * hit
    return fade_out(x, 0.4)
save('phase_gong', master(gong(), hp=450))

# Buzina de placar: o "BZZZ" de fim de período — rico em harmônicos, áspero e alto.
def buzzer(dur=0.85, f=345):
    t = t_axis(dur)
    x = np.zeros_like(t)
    for layer, det in ((1.0, 0.0), (0.7, 0.006)):  # duas camadas levemente desafinadas = mais "gordo"
        for n in range(1, 18):
            if n % 2 == 1 or n < 4:
                x += layer * np.sin(2 * np.pi * f * (1 + det) * n * t) / n
    x *= 1 + 0.25 * np.sin(2 * np.pi * 55 * t)  # aspereza
    x = np.tanh(2.2 * x)                        # saturação
    x = sosfilt(butter(2, [500, 5200], btype='band', fs=RATE, output='sos'), x)
    return x * adsr(len(t), 0.008, 10, 1, 0.07, hold=dur - 0.08)
save('phase_horn', master(buzzer(), hp=450, drive_db=4))

# Apito de árbitro: tom agudo com o "trinado" da bolinha e um pouco de sopro.
def whistle(dur=0.62, f=3050):
    t = t_axis(dur)
    trill = 1 + 0.55 * np.sin(2 * np.pi * 31 * t)
    fm = f * (1 + 0.012 * np.sin(2 * np.pi * 31 * t + 1))
    x = np.sin(2 * np.pi * np.cumsum(fm) / RATE) * trill
    x += 0.15 * np.sin(2 * np.pi * np.cumsum(2 * fm) / RATE) * trill
    breath = sosfilt(butter(2, [2200, 4200], btype='band', fs=RATE, output='sos'), rng.standard_normal(len(t)))
    x += 0.35 * breath * trill / max(np.abs(breath).max(), 1e-9)
    return x * adsr(len(t), 0.015, 10, 1, 0.06, hold=dur - 0.07)
save('phase_whistle', master(whistle()))

# ---------- contagem 3-2-1 ----------
PIP = ((1, 1.0), (2, 0.12), (3, 0.05))
save('count', master(tone(0.12, 1046.5, PIP, a=0.002, d=10, s=1, r=0.03, hold=0.085)))
save('count_last', master(tone(0.2, 1568.0, PIP, a=0.002, d=10, s=1, r=0.05, hold=0.14)))

# ---------- tique-taque: bloco de madeira curtinho ----------
wood = tone(0.05, 1850, ((1, 1.0), (2.7, 0.35)), a=0.0008, d=0.012, r=0.005)
wood[:len(n := noise_burst(0.01, 2500, 6000, 0.0015))] += 0.5 * n
save('tick', master(wood, hp=600, tail=0.004, drive_db=0))

# ---------- volta do cronômetro: duas notas rápidas (sol → dó) ----------
save('lap', master(place(
    (0.00, tone(0.12, 1568.0, PIP, a=0.002, d=10, s=1, r=0.03, hold=0.09)),
    (0.13, tone(0.3, 2093.0, PIP, a=0.002, d=0.12, s=0.25, r=0.06)),
)))

# ---------- fim do treino: arpejo subindo + acorde final com brilho ----------
NOTE = ((1, 1.0), (2, 0.25), (3, 0.1), (4, 0.05))
arp = [(i * 0.14, tone(0.16, f, NOTE, a=0.003, d=10, s=1, r=0.04, hold=0.12)) for i, f in enumerate([1046.5, 1318.5, 1568.0])]
chord = sum(tone(1.1, f, NOTE, a=0.004, d=0.45, s=0.0, r=0.15) for f in [1046.5, 1318.5, 1568.0, 2093.0]) / 2.2
save('done', master(place(*arp, (0.44, chord)), drive_db=3))

# ---------- silêncio de 1 s: tocado em loop no treino para o iPhone manter o app ativo ----------
save('silence', np.zeros(RATE))
print('ok:', sorted(f for f in os.listdir(OUT) if f.endswith('.wav')))
