#!/usr/bin/env python3
"""
generate_icons.py
Generates the Simbahan app icon (1024x1024) using only Python stdlib,
then uses macOS `sips` to resize all required variants.
"""
import struct, zlib, os, subprocess, sys

# ── Colours (navy bg, gold cross, white ring) ─────────────────────────────
NAVY   = (26,  43,  94, 255)   # #1A2B5E
GOLD   = (201, 146,  42, 255)  # #C9922A
WHITE  = (255, 255, 255, 255)
CREAM  = (250, 250, 245, 255)  # #FAFAF5

SIZE = 1024

def lerp(a, b, t):
    return int(a + (b - a) * t)

def blend(fg, bg):
    """Alpha-composite fg over bg."""
    a = fg[3] / 255.0
    return (
        int(fg[0]*a + bg[0]*(1-a)),
        int(fg[1]*a + bg[1]*(1-a)),
        int(fg[2]*a + bg[2]*(1-a)),
        255,
    )

def circle_aa(cx, cy, r, px, py):
    """Returns alpha 0-255 for a filled circle with 1-px AA."""
    d = ((px - cx)**2 + (py - cy)**2) ** 0.5
    if d < r - 1: return 255
    if d > r:     return 0
    return int((r - d) * 255)

def rect_alpha(x0, y0, x1, y1, px, py, aa=1):
    """Returns alpha 0-255 for a filled rect with AA on edges."""
    ax = min(max(px - x0, 0), aa) / aa if px < x0 + aa else (min(max(x1 - px, 0), aa) / aa if px > x1 - aa else 1)
    ay = min(max(py - y0, 0), aa) / aa if py < y0 + aa else (min(max(y1 - py, 0), aa) / aa if py > y1 - aa else 1)
    return int(ax * ay * 255)

def make_icon(size):
    s = size
    cx = cy = s / 2
    r_outer = s * 0.46   # outer circle
    r_inner = s * 0.38   # inner circle (ring width = 8% of size)

    # Cross dimensions (centred)
    cw = s * 0.10   # cross arm width
    ch = s * 0.58   # cross vertical height
    hw = s * 0.42   # cross horizontal width
    hh = s * 0.10   # cross horizontal height
    # Horizontal bar sits at 38% from top
    hbar_y0 = cy - s * 0.19
    hbar_y1 = hbar_y0 + hh

    pixels = []
    for y in range(s):
        row = []
        for x in range(s):
            # Start with navy background
            px = list(NAVY)

            # ── Outer white ring ──────────────────────────────────────────
            a_out = circle_aa(cx, cy, r_outer, x, y)
            a_in  = circle_aa(cx, cy, r_inner, x, y)
            ring_a = max(0, a_out - a_in)
            if ring_a > 0:
                px = list(blend((WHITE[0], WHITE[1], WHITE[2], ring_a), tuple(px)))

            # ── Gold cross (vertical bar) ─────────────────────────────────
            vx0, vx1 = cx - cw/2, cx + cw/2
            vy0, vy1 = cy - ch/2, cy + ch/2
            va = rect_alpha(vx0, vy0, vx1, vy1, x, y)
            # clip to inner circle
            ci = circle_aa(cx, cy, r_inner - 2, x, y)
            va = int(va * ci / 255)
            if va > 0:
                px = list(blend((GOLD[0], GOLD[1], GOLD[2], va), tuple(px)))

            # ── Gold cross (horizontal bar) ───────────────────────────────
            hx0, hx1 = cx - hw/2, cx + hw/2
            ha = rect_alpha(hx0, hbar_y0, hx1, hbar_y1, x, y)
            ha = int(ha * ci / 255)
            if ha > 0:
                px = list(blend((GOLD[0], GOLD[1], GOLD[2], ha), tuple(px)))

            row.append(bytes(px))
        pixels.append(row)
    return pixels

def write_png(pixels, path):
    s = len(pixels)
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(c[4:]) & 0xFFFFFFFF)

    raw = b''
    for row in pixels:
        raw += b'\x00' + b''.join(row)

    png = (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', s, s, 8, 2, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(raw, 9))
        + chunk(b'IEND', b'')
    )
    with open(path, 'wb') as f:
        f.write(png)
    print(f'  ✓ wrote {path} ({s}x{s})')

def sips_resize(src, dst, size):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    r = subprocess.run(
        ['sips', '-z', str(size), str(size), src, '--out', dst],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        print(f'  ✗ sips error: {r.stderr.strip()}')
    else:
        print(f'  ✓ {dst} ({size}x{size})')

BASE = os.path.dirname(os.path.abspath(__file__))

# ── 1. Generate master 1024x1024 icon ────────────────────────────────────
print('\n[1/4] Generating master 1024×1024 icon...')
master = os.path.join(BASE, 'assets/images/icon.png')
os.makedirs(os.path.dirname(master), exist_ok=True)
pixels = make_icon(SIZE)
write_png(pixels, master)

# ── 2. Derive other base assets from master ───────────────────────────────
print('\n[2/4] Deriving adaptive-icon, splash-icon, favicon...')
sips_resize(master, os.path.join(BASE, 'assets/images/adaptive-icon.png'), 1024)
sips_resize(master, os.path.join(BASE, 'assets/images/splash-icon.png'),   512)
sips_resize(master, os.path.join(BASE, 'assets/images/favicon.png'),        64)

# ── 3. Android mipmap icons ───────────────────────────────────────────────
print('\n[3/4] Generating Android mipmap icons...')
ANDROID_RES = os.path.join(BASE, 'android/app/src/main/res')
ANDROID_SIZES = {
    'mipmap-mdpi':    48,
    'mipmap-hdpi':    72,
    'mipmap-xhdpi':   96,
    'mipmap-xxhdpi':  144,
    'mipmap-xxxhdpi': 192,
}
for folder, size in ANDROID_SIZES.items():
    for name in ['ic_launcher.png', 'ic_launcher_round.png']:
        dst = os.path.join(ANDROID_RES, folder, name)
        sips_resize(master, dst, size)

# Notification icon (white on transparent — use a simple white version)
NOTIF_SIZES = {
    'drawable-mdpi':    24,
    'drawable-hdpi':    36,
    'drawable-xhdpi':   48,
    'drawable-xxhdpi':  72,
    'drawable-xxxhdpi': 96,
}
for folder, size in NOTIF_SIZES.items():
    dst = os.path.join(ANDROID_RES, folder, 'notification_icon.png')
    sips_resize(master, dst, size)

# ── 4. iOS AppIcon ────────────────────────────────────────────────────────
print('\n[4/4] Generating iOS AppIcon (1024×1024 universal)...')
ios_icon_dir = os.path.join(BASE, 'ios/Simbahan/Images.xcassets/AppIcon.appiconset')
ios_dst = os.path.join(ios_icon_dir, 'App-Icon-1024x1024@1x.png')
sips_resize(master, ios_dst, 1024)

print('\n✅ All icons generated successfully.')
print('   Run `npx expo prebuild --clean` to sync into native projects.')
