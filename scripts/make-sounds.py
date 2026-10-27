"""Gera os sons do CrossTimer (WAV mono 16 bits, 22,05 kHz) em assets/sounds/.

Todos os sons são sintetizados aqui — nenhum arquivo de terceiros.
Rodar de novo: python3 scripts/make-sounds.py
"""
import math, os, random, struct, wave

RATE = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
os.makedirs(OUT, exist_ok=True)

def env(t, a, d):
    """envelope: ataque linear de a s, queda exponencial com constante d s"""
    return (t / a if t < a else math.exp(-(t - a) / d))

def osc(kind, f, t):
    ph = (f * t) % 1.0
    if kind == 'sine': return math.sin(2 * math.pi * ph)
    if kind == 'square': return 1.0 if ph < 0.5 else -1.0
    if kind == 'saw': return 2 * ph - 1
    if kind == 'tri': return 4 * abs(ph - 0.5) - 1
    raise ValueError(kind)

def render(dur, voices):
    """voices: lista de (início, tipo, freq, ganho, ataque, queda, vibrato_hz, vibrato_prof)"""
    n = int(dur * RATE)
    buf = [0.0] * n
    for (st, kind, f, g, a, d, vh, vd) in voices:
        s0 = int(st * RATE)
        for i in range(s0, n):
            t = (i - s0) / RATE
            ff = f + (vd * math.sin(2 * math.pi * vh * t) if vh else 0)
            e = env(t, a, d)
            if e < 1e-4 and t > a: break
            buf[i] += g * e * osc(kind, ff, t)
    return buf

def save(name, buf, fade=0.01):
    peak = max(abs(x) for x in buf)
    k = 0.85 / peak if peak > 0 else 0
    nf = max(1, int(fade * RATE))
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        frames = bytearray()
        for i, x in enumerate(buf):
            if i >= len(buf) - nf: x *= (len(buf) - i) / nf
            frames += struct.pack('<h', int(max(-1, min(1, x * k)) * 32767))
        w.writeframes(bytes(frames))

# sons de troca de fase (um por estilo)
save('phase-beep', render(0.45, [(0, 'square', 880, 0.5, 0.004, 0.09, 0, 0), (0.22, 'square', 880, 0.5, 0.004, 0.09, 0, 0)]))
save('phase-bell', render(1.8, [(0, 'sine', 660 * r, 0.6 / (i + 1), 0.003, 0.9 / (i + 1), 0, 0) for i, r in enumerate([1, 2.76, 5.4, 8.93])]))
save('phase-gong', render(2.6, [(0, 'sine', 150 * r, 0.7 / (i + 1), 0.01, 1.4 / (i * 0.6 + 1), 0.6 if i == 0 else 0, 1.5) for i, r in enumerate([1, 1.48, 2.1, 2.9, 3.7])]))
save('phase-horn', render(0.75, [(0, 'saw', 233, 0.45, 0.02, 0.5, 0, 0), (0, 'saw', 311, 0.35, 0.02, 0.5, 0, 0), (0, 'saw', 466, 0.15, 0.02, 0.4, 0, 0)]))
save('phase-whistle', render(0.6, [(0, 'sine', 2600, 0.6, 0.01, 0.35, 28, 140), (0, 'sine', 5200, 0.08, 0.01, 0.2, 28, 280)]))
# contagem 3-2-1 e o "1" mais agudo
save('count', render(0.18, [(0, 'sine', 880, 0.8, 0.003, 0.05, 0, 0)]))
save('count-last', render(0.3, [(0, 'sine', 1320, 0.8, 0.003, 0.09, 0, 0), (0, 'sine', 2640, 0.12, 0.003, 0.05, 0, 0)]))
# tique-taque: clique curto
random.seed(7)
tick = render(0.05, [(0, 'tri', 1800, 0.5, 0.001, 0.008, 0, 0)])
tick = [x + 0.15 * (random.random() * 2 - 1) * math.exp(-i / 60) for i, x in enumerate(tick)]
save('tick', tick, fade=0.005)
# volta do cronômetro: duas notas
save('lap', render(0.9, [(0, 'sine', 1046, 0.6, 0.004, 0.25, 0, 0), (0.12, 'sine', 1568, 0.5, 0.004, 0.3, 0, 0)]))
# fim do treino: três notas subindo
save('done', render(1.2, [(i * 0.18, 'square', f, 0.35, 0.005, 0.12 if i < 2 else 0.35, 0, 0) for i, f in enumerate([660, 880, 1320])]))
# silêncio de 1 s: tocado em loop durante o treino para o iPhone manter o app ativo em segundo plano
save('silence', [0.0] * RATE, fade=0)
print('ok:', sorted(os.listdir(OUT)))
