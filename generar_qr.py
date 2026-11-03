#!/usr/bin/env python3
"""
Genera el código QR de la campaña con el estilo del sitio.

Uso:
    python generar_qr.py
    python generar_qr.py https://tu-url-definitiva.com

Salidas:
    assets/qr-codigo.svg  (para pantalla / impresión vectorial)
    assets/qr-codigo.png  (para imprimir en cartel o pegatina)
"""

import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw
from qrcode.constants import ERROR_CORRECT_H

DEFAULT_URL = "https://piensa-antes-de-publicar.netlify.app"
BASE = Path(__file__).resolve().parent
ASSETS = BASE / "assets"

INK = "#12110F"
CREAM = "#F7F2E8"
LIME = "#D9F45C"
QUIET = 4


def build_matrix(url: str):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=0)
    qr.add_data(url)
    qr.make(fit=True)
    return [[bool(value) for value in row] for row in qr.get_matrix()]


def in_finder(row: int, col: int, n: int) -> bool:
    return (
        (row < 8 and col < 8)
        or (row < 8 and col >= n - 8)
        or (row >= n - 8 and col < 8)
    )


def badge_rect(n: int):
    size = max(7, round(n * 0.21))
    if size % 2 != n % 2:
        size += 1
    start = (n - size) // 2
    return start, start, size


def in_badge(row: int, col: int, n: int, pad: int = 1) -> bool:
    x, y, size = badge_rect(n)
    return (x - pad) <= col < (x + size + pad) and (y - pad) <= row < (y + size + pad)


def generate_svg(matrix, path: Path):
    n = len(matrix)
    total = n + QUIET * 2
    bx, by, bs = badge_rect(n)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total} {total}" '
        f'width="{total * 24}" height="{total * 24}" role="img" '
        f'aria-label="Código QR de la campaña Piensa antes de publicar">',
        f'<rect width="{total}" height="{total}" fill="{CREAM}"/>',
    ]

    # Módulos
    for row in range(n):
        for col in range(n):
            if not matrix[row][col]:
                continue
            if in_finder(row, col, n) or in_badge(row, col, n):
                continue
            parts.append(
                f'<rect x="{col + QUIET}" y="{row + QUIET}" width="1" height="1" '
                f'fill="{INK}"/>'
            )

    # Ojos del QR
    for fx, fy in (
        (QUIET, QUIET),
        (QUIET + n - 7, QUIET),
        (QUIET, QUIET + n - 7),
    ):
        parts.append(f'<rect x="{fx}" y="{fy}" width="7" height="7" rx="1" fill="{INK}"/>')
        parts.append(f'<rect x="{fx + 1}" y="{fy + 1}" width="5" height="5" rx="1" fill="{CREAM}"/>')
        parts.append(f'<rect x="{fx + 2}" y="{fy + 2}" width="3" height="3" rx="0.6" fill="{INK}"/>')

    # Insignia central con "!"
    x = bx + QUIET
    y = by + QUIET
    parts.append(
        f'<rect x="{x - 1.2}" y="{y - 1.2}" width="{bs + 2.4}" height="{bs + 2.4}" '
        f'rx="2.2" fill="{CREAM}"/>'
    )
    parts.append(
        f'<rect x="{x}" y="{y}" width="{bs}" height="{bs}" rx="1.7" fill="{LIME}" '
        f'stroke="{INK}" stroke-width="0.35"/>'
    )
    bar_w = bs * 0.16
    bar_h = bs * 0.45
    bar_x = x + (bs - bar_w) / 2
    bar_y = y + bs * 0.16
    parts.append(
        f'<rect x="{bar_x}" y="{bar_y}" width="{bar_w}" height="{bar_h}" '
        f'rx="{bar_w / 2}" fill="{INK}"/>'
    )
    dot_r = bs * 0.095
    parts.append(
        f'<circle cx="{x + bs / 2}" cy="{y + bs * 0.78}" r="{dot_r}" fill="{INK}"/>'
    )

    parts.append("</svg>")
    path.write_text("\n".join(parts), encoding="utf-8")


def generate_png(matrix, path: Path, scale: int = 28):
    n = len(matrix)
    total = n + QUIET * 2
    side = total * scale
    image = Image.new("RGB", (side, side), CREAM)
    draw = ImageDraw.Draw(image)
    bx, by, bs = badge_rect(n)

    def rect(x, y, w, h, color, radius=0):
        draw.rounded_rectangle(
            [x * scale, y * scale, (x + w) * scale - 1, (y + h) * scale - 1],
            radius=max(0, radius * scale),
            fill=color,
        )

    for row in range(n):
        for col in range(n):
            if not matrix[row][col]:
                continue
            if in_finder(row, col, n) or in_badge(row, col, n):
                continue
            rect(col + QUIET, row + QUIET, 1, 1, INK, radius=0)

    for fx, fy in (
        (QUIET, QUIET),
        (QUIET + n - 7, QUIET),
        (QUIET, QUIET + n - 7),
    ):
        rect(fx, fy, 7, 7, INK, radius=1)
        rect(fx + 1, fy + 1, 5, 5, CREAM, radius=1)
        rect(fx + 2, fy + 2, 3, 3, INK, radius=0.6)

    x = bx + QUIET
    y = by + QUIET
    rect(x - 1.2, y - 1.2, bs + 2.4, bs + 2.4, CREAM, radius=2.2)
    rect(x, y, bs, bs, LIME, radius=1.7)
    draw.rounded_rectangle(
        [x * scale, y * scale, (x + bs) * scale, (y + bs) * scale],
        radius=1.7 * scale,
        outline=INK,
        width=max(2, scale // 6),
    )

    bar_w = bs * 0.16
    bar_h = bs * 0.45
    bar_x = x + (bs - bar_w) / 2
    bar_y = y + bs * 0.16
    rect(bar_x, bar_y, bar_w, bar_h, INK, radius=bar_w / 2)
    dot_r = bs * 0.095
    draw.ellipse(
        [
            (x + bs / 2 - dot_r) * scale,
            (y + bs * 0.78 - dot_r) * scale,
            (x + bs / 2 + dot_r) * scale,
            (y + bs * 0.78 + dot_r) * scale,
        ],
        fill=INK,
    )

    # Borde decorativo interior
    margin = QUIET * scale // 2
    draw.rectangle(
        [margin, margin, side - margin, side - margin],
        outline=CREAM,
        width=max(2, scale // 3),
    )

    image.save(path, "PNG", optimize=True)


def main():
    url = sys.argv[1].strip() if len(sys.argv) > 1 else DEFAULT_URL
    if not url.startswith(("http://", "https://")):
        raise SystemExit("La URL debe empezar con http:// o https://")

    ASSETS.mkdir(parents=True, exist_ok=True)
    matrix = build_matrix(url)

    generate_svg(matrix, ASSETS / "qr-codigo.svg")
    generate_png(matrix, ASSETS / "qr-codigo.png")

    print(f"URL codificada: {url}")
    print(f"Módulos: {len(matrix)} x {len(matrix)}")
    print(f"SVG: {ASSETS / 'qr-codigo.svg'}")
    print(f"PNG: {ASSETS / 'qr-codigo.png'}")
    print("\nSi cambias de dominio, vuelve a ejecutar:")
    print(f"  python generar_qr.py {url}")


if __name__ == "__main__":
    main()
