"""Ícones provisórios do CronoBox no estilo placar de LED (app, web app e favicon).

Rodar de novo: python3 scripts/make-icons.py   (precisa de Pillow)
O ícone final entra na fase de publicação; este serve para instalar e testar.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FONT = os.path.join(ROOT, 'node_modules/@expo-google-fonts/teko/600SemiBold/Teko_600SemiBold.ttf')
BG, GREEN, AMBER = (11, 11, 11), (49, 242, 107), (255, 176, 0)


def art(size, scale=1.0, bg=True, color=GREEN):
    """Desenha 'CB' (CronoBox) em LED verde com brilho e uma barra âmbar; scale < 1 deixa margem (ícone adaptável)."""
    img = Image.new('RGBA', (size, size), BG + (255,) if bg else (0, 0, 0, 0))
    s = size * scale
    font = ImageFont.truetype(FONT, int(s * 0.62))
    text = 'CB'
    box = font.getbbox(text)
    w, h = box[2] - box[0], box[3] - box[1]
    x = (size - w) / 2 - box[0]
    y = (size - h) / 2 - box[1] - s * 0.05
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(glow).text((x, y), text, font=font, fill=color + (255,))
    glow = glow.filter(ImageFilter.GaussianBlur(s * 0.035))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.text((x, y), text, font=font, fill=color + (255,))
    bw, bh = s * 0.42, s * 0.045
    by = (size + h) / 2 + s * 0.02
    d.rounded_rectangle(((size - bw) / 2, by, (size + bw) / 2, by + bh), radius=bh / 2, fill=AMBER + (255,))
    return img


def save(img, path, size=None):
    if size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(os.path.join(ROOT, path))


big = art(1024)
save(big, 'assets/icon.png')
save(art(1024, scale=0.62, bg=False), 'assets/android-icon-foreground.png')
Image.new('RGBA', (1024, 1024), BG + (255,)).save(os.path.join(ROOT, 'assets/android-icon-background.png'))
save(art(1024, scale=0.62, bg=False, color=(255, 255, 255)), 'assets/android-icon-monochrome.png')
save(art(1024, scale=0.5), 'assets/splash-icon.png')
save(big, 'assets/favicon.png', 48)
save(big, 'public/icons/icon-192.png', 192)
save(big, 'public/icons/icon-512.png', 512)
save(art(512, scale=0.72), 'public/icons/maskable-512.png')  # área segura do ícone mascarável
save(big, 'public/icons/apple-touch-icon.png', 180)
print('ok')
