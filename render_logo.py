#!/usr/bin/env python3
"""
render_logo.py
Renders the Simbahan app logo as a 1024x1024 PNG using only Python stdlib.

Design:
  - Deep navy-to-blue radial gradient background
  - Soft white outer glow ring
  - White circular badge with subtle inner shadow
  - Minimalist church silhouette (body + bell tower + cross)
  - "SIMBAHAN" pixel-lettered text below church
  - Gold accent dot on cross tip
"""
import struct, zlib, math, os

# ─── Palette ──────────────────────────────────────────────────────────────────
NAVY_DARK  = (10,  20,  60)
NAVY       = (26,  43,  94)
NAVY_MID   = (38,  62, 128)
BLUE_LIGHT = (72, 110, 200)
WHITE      = (255, 255, 255)
OFF_WHITE  = (240, 244, 255)
GOLD       = (201, 146,  42)
GOLD_LIGHT = (230, 180,  80)
SHADOW     = (15,  28,  75)
TRANSPARENT = (0, 0, 0, 0)

S = 1024  # canvas size

# ─── Low-level helpers ────────────────────────────────────────────────────────

def lerp(a, b, t):
    t = max(0.0, min(1.0, t))
    return a + (b - a) * t

def lerp3(c1, c2, t):
    return (lerp(c1[0], c2[0], t),
            lerp(c1[1], c2[1], t),
            lerp(c1[2], c2[2], t))

def clamp(v, lo=0, hi=255):
    return max(lo, min(hi, int(v)))

def alpha_blend(fg_rgb, fg_a, bg_rgb):
    """Composite fg (rgb + alpha 0-1) over bg (rgb). Returns rgb tuple."""
    a = max(0.0, min(1.0, fg_a))
    return (
        clamp(fg_rgb[0] * a + bg_rgb[0] * (1 - a)),
        clamp(fg_rgb[1] * a + bg_rgb[1] * (1 - a)),
        clamp(fg_rgb[2] * a + bg_rgb[2] * (1 - a)),
    )

# ─── Canvas ───────────────────────────────────────────────────────────────────

def make_canvas(size, fill=(0, 0, 0)):
    return [[(fill[0], fill[1], fill[2])] * size for _ in range(size)]

def put(canvas, x, y, rgb, alpha=1.0):
    if 0 <= x < S and 0 <= y < S:
        canvas[y][x] = alpha_blend(rgb, alpha, canvas[y][x])

# ─── SDF helpers (signed-distance field for smooth shapes) ───────────────────

def sdf_circle(px, py, cx, cy, r):
    return math.hypot(px - cx, py - cy) - r

def sdf_box(px, py, cx, cy, hw, hh, rr=0):
    dx = abs(px - cx) - hw + rr
    dy = abs(py - cy) - hh + rr
    return (math.hypot(max(dx, 0), max(dy, 0))
            + min(max(dx, dy), 0) - rr)

def sdf_trapezoid(px, py, x0, y0, x1, y1, w0, w1):
    """Vertical trapezoid: top-center (x0,y0) width w0, bottom-center (x1,y1) width w1."""
    t = (py - y0) / (y1 - y0) if y1 != y0 else 0
    t = max(0.0, min(1.0, t))
    half_w = lerp(w0, w1, t) / 2
    cx = lerp(x0, x1, t)
    dx = abs(px - cx) - half_w
    dy = 0.0
    if py < y0: dy = y0 - py
    elif py > y1: dy = py - y1
    return math.hypot(max(dx, 0), dy) + min(max(dx, dy), 0)

def smooth_step(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)

def sdf_alpha(d, aa=1.2):
    """Convert SDF distance to alpha (1 inside, 0 outside, smooth at edge)."""
    return max(0.0, min(1.0, -d / aa + 0.5))

# ─── Drawing primitives ───────────────────────────────────────────────────────

def fill_circle(canvas, cx, cy, r, color, aa=1.5, alpha=1.0):
    for y in range(max(0, int(cy - r - 2)), min(S, int(cy + r + 3))):
        for x in range(max(0, int(cx - r - 2)), min(S, int(cx + r + 3))):
            d = sdf_circle(x + 0.5, y + 0.5, cx, cy, r)
            a = sdf_alpha(d, aa) * alpha
            if a > 0.001:
                put(canvas, x, y, color, a)

def fill_ring(canvas, cx, cy, r_out, r_in, color, aa=1.5, alpha=1.0):
    for y in range(max(0, int(cy - r_out - 2)), min(S, int(cy + r_out + 3))):
        for x in range(max(0, int(cx - r_out - 2)), min(S, int(cx + r_out + 3))):
            d_out = sdf_circle(x + 0.5, y + 0.5, cx, cy, r_out)
            d_in  = sdf_circle(x + 0.5, y + 0.5, cx, cy, r_in)
            a = sdf_alpha(d_out, aa) * (1 - sdf_alpha(d_in, aa)) * alpha
            if a > 0.001:
                put(canvas, x, y, color, a)

def fill_rect(canvas, cx, cy, hw, hh, color, rr=0, aa=1.2, alpha=1.0, clip_circle=None, clip_r=None):
    for y in range(max(0, int(cy - hh - 2)), min(S, int(cy + hh + 3))):
        for x in range(max(0, int(cx - hw - 2)), min(S, int(cx + hw + 3))):
            d = sdf_box(x + 0.5, y + 0.5, cx, cy, hw, hh, rr)
            a = sdf_alpha(d, aa) * alpha
            if clip_circle is not None and clip_r is not None:
                dc = sdf_circle(x + 0.5, y + 0.5, clip_circle[0], clip_circle[1], clip_r)
                a *= sdf_alpha(dc, aa)
            if a > 0.001:
                put(canvas, x, y, color, a)

def fill_triangle(canvas, pts, color, aa=1.2, alpha=1.0, clip_circle=None, clip_r=None):
    """Fill a triangle defined by 3 (x,y) points."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1 = int(min(xs)) - 2, int(max(xs)) + 3
    y0, y1 = int(min(ys)) - 2, int(max(ys)) + 3

    def edge(ax, ay, bx, by, px, py):
        return (bx - ax) * (py - ay) - (by - ay) * (px - ax)

    (ax, ay), (bx, by), (cx2, cy2) = pts
    area = edge(ax, ay, bx, by, cx2, cy2)
    if abs(area) < 1e-6:
        return

    for y in range(max(0, y0), min(S, y1)):
        for x in range(max(0, x0), min(S, x1)):
            px, py = x + 0.5, y + 0.5
            w0 = edge(bx, by, cx2, cy2, px, py) / area
            w1 = edge(cx2, cy2, ax, ay, px, py) / area
            w2 = edge(ax, ay, bx, by, px, py) / area
            min_w = min(w0, w1, w2)
            a = sdf_alpha(-min_w * 8, aa) * alpha
            if clip_circle is not None and clip_r is not None:
                dc = sdf_circle(px, py, clip_circle[0], clip_circle[1], clip_r)
                a *= sdf_alpha(dc, aa)
            if a > 0.001:
                put(canvas, x, y, color, a)

# ─── Pixel font (5×7 bitmap) ─────────────────────────────────────────────────

FONT = {
    'S': ["01110","10001","10000","01110","00001","10001","01110"],
    'I': ["11111","00100","00100","00100","00100","00100","11111"],
    'M': ["10001","11011","10101","10001","10001","10001","10001"],
    'B': ["11110","10001","10001","11110","10001","10001","11110"],
    'A': ["01110","10001","10001","11111","10001","10001","10001"],
    'H': ["10001","10001","10001","11111","10001","10001","10001"],
    'N': ["10001","11001","10101","10011","10001","10001","10001"],
}

def draw_text(canvas, text, cx, cy, scale, color, alpha=1.0):
    """Draw pixel text centred at (cx, cy)."""
    char_w = 5 * scale
    gap    = 2 * scale
    total_w = len(text) * char_w + (len(text) - 1) * gap
    start_x = cx - total_w / 2

    for i, ch in enumerate(text.upper()):
        if ch not in FONT:
            continue
        bmp = FONT[ch]
        ox = start_x + i * (char_w + gap)
        oy = cy - 3.5 * scale  # vertically centre the 7-row glyph
        for row_i, row in enumerate(bmp):
            for col_i, bit in enumerate(row):
                if bit == '1':
                    px = ox + col_i * scale
                    py = oy + row_i * scale
                    # Draw a filled square for each pixel
                    for dy in range(scale):
                        for dx in range(scale):
                            put(canvas, int(px) + dx, int(py) + dy, color, alpha)

# ─── Background: radial gradient ─────────────────────────────────────────────

def draw_background(canvas):
    cx, cy = S / 2, S / 2
    r_max = S * 0.72
    for y in range(S):
        for x in range(S):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            t = smooth_step(0, r_max, d)
            # Centre: lighter blue → edge: dark navy
            rgb = lerp3(BLUE_LIGHT, NAVY_DARK, t * 0.85)
            canvas[y][x] = (clamp(rgb[0]), clamp(rgb[1]), clamp(rgb[2]))

# ─── Outer glow ───────────────────────────────────────────────────────────────

def draw_outer_glow(canvas):
    cx, cy = S / 2, S / 2
    r_badge = S * 0.44
    # Soft white halo outside the badge
    for y in range(S):
        for x in range(S):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) - r_badge
            if -10 < d < 28:
                a = math.exp(-max(d, 0) ** 2 / 120) * 0.22
                put(canvas, x, y, WHITE, a)

# ─── White badge circle ───────────────────────────────────────────────────────

def draw_badge(canvas):
    cx, cy = S / 2, S / 2
    r = S * 0.44

    # Drop shadow (dark, offset down-right)
    fill_circle(canvas, cx + 14, cy + 18, r, SHADOW, aa=30, alpha=0.35)

    # Main white circle
    fill_circle(canvas, cx, cy, r, WHITE, aa=1.5, alpha=1.0)

    # Inner subtle blue tint at very centre (gives depth)
    fill_circle(canvas, cx, cy, r * 0.92, OFF_WHITE, aa=2.0, alpha=0.45)

# ─── Church silhouette ────────────────────────────────────────────────────────

def draw_church(canvas):
    cx   = S / 2
    cy   = S / 2
    clip = ((cx, cy), S * 0.44 - 4)  # clip to badge

    # ── Colour palette for church ──
    CHURCH_FILL   = NAVY          # main body
    CHURCH_DARK   = NAVY_DARK     # shadow side
    ROOF_FILL     = NAVY_MID      # roof triangles
    DOOR_FILL     = (200, 215, 255)  # light blue door
    WIN_FILL      = GOLD_LIGHT    # gold windows
    CROSS_COLOR   = WHITE         # cross is white
    CROSS_ACCENT  = GOLD          # cross tip accent

    # ── Layout (all relative to S=1024) ──
    # Church body: wide rectangle
    body_cx   = cx
    body_cy   = cy + S * 0.07
    body_hw   = S * 0.175
    body_hh   = S * 0.155
    body_rr   = S * 0.018

    # Bell tower: narrower rectangle above body
    tower_cx  = cx
    tower_cy  = cy - S * 0.085
    tower_hw  = S * 0.072
    tower_hh  = S * 0.095
    tower_rr  = S * 0.012

    # Roof of main body (triangle)
    roof_pts = [
        (cx - body_hw - S*0.012, body_cy - body_hh),
        (cx + body_hw + S*0.012, body_cy - body_hh),
        (cx, body_cy - body_hh - S*0.085),
    ]

    # Roof of bell tower (triangle)
    tower_roof_pts = [
        (tower_cx - tower_hw - S*0.008, tower_cy - tower_hh),
        (tower_cx + tower_hw + S*0.008, tower_cy - tower_hh),
        (tower_cx, tower_cy - tower_hh - S*0.065),
    ]

    # Cross on top of tower
    cross_cx   = cx
    cross_cy   = tower_cy - tower_hh - S * 0.065 - S * 0.048
    cross_vhw  = S * 0.014   # vertical bar half-width
    cross_vhh  = S * 0.058   # vertical bar half-height
    cross_hhw  = S * 0.038   # horizontal bar half-width
    cross_hhh  = S * 0.013   # horizontal bar half-height
    cross_h_cy = cross_cy - S * 0.010  # horizontal bar sits upper third

    # Door (arch shape = rect + circle top)
    door_cx   = cx
    door_cy   = body_cy + body_hh - S * 0.058
    door_hw   = S * 0.038
    door_hh   = S * 0.058
    door_arch_r = door_hw

    # Side windows (two small arched)
    win_r     = S * 0.022
    win_y     = body_cy - S * 0.02
    win_lx    = cx - body_hw * 0.52
    win_rx    = cx + body_hw * 0.52

    # Tower window (small circle)
    twin_r    = S * 0.018
    twin_cx   = cx
    twin_cy   = tower_cy

    # ── Draw order: back → front ──

    # 1. Main body shadow (slightly offset)
    fill_rect(canvas, body_cx + 6, body_cy + 8, body_hw, body_hh,
              CHURCH_DARK, rr=body_rr, alpha=0.3,
              clip_circle=clip[0], clip_r=clip[1])

    # 2. Main body
    fill_rect(canvas, body_cx, body_cy, body_hw, body_hh,
              CHURCH_FILL, rr=body_rr, alpha=1.0,
              clip_circle=clip[0], clip_r=clip[1])

    # 3. Roof of body
    fill_triangle(canvas, roof_pts, ROOF_FILL, alpha=1.0,
                  clip_circle=clip[0], clip_r=clip[1])

    # 4. Bell tower shadow
    fill_rect(canvas, tower_cx + 5, tower_cy + 6, tower_hw, tower_hh,
              CHURCH_DARK, rr=tower_rr, alpha=0.28,
              clip_circle=clip[0], clip_r=clip[1])

    # 5. Bell tower
    fill_rect(canvas, tower_cx, tower_cy, tower_hw, tower_hh,
              CHURCH_FILL, rr=tower_rr, alpha=1.0,
              clip_circle=clip[0], clip_r=clip[1])

    # 6. Tower roof
    fill_triangle(canvas, tower_roof_pts, ROOF_FILL, alpha=1.0,
                  clip_circle=clip[0], clip_r=clip[1])

    # 7. Door rect
    fill_rect(canvas, door_cx, door_cy, door_hw, door_hh,
              DOOR_FILL, rr=door_hw * 0.3, alpha=1.0,
              clip_circle=clip[0], clip_r=clip[1])

    # 8. Door arch (circle top)
    fill_circle(canvas, door_cx, door_cy - door_hh, door_arch_r,
                DOOR_FILL, aa=1.5, alpha=1.0)

    # 9. Side windows
    for wx in [win_lx, win_rx]:
        # Window arch body
        fill_rect(canvas, wx, win_y, win_r, win_r * 1.2,
                  WIN_FILL, rr=win_r * 0.3, alpha=0.9,
                  clip_circle=clip[0], clip_r=clip[1])
        fill_circle(canvas, wx, win_y - win_r * 1.2, win_r,
                    WIN_FILL, aa=1.5, alpha=0.9)

    # 10. Tower window
    fill_circle(canvas, twin_cx, twin_cy, twin_r,
                WIN_FILL, aa=1.5, alpha=0.85)

    # 11. Cross vertical bar
    fill_rect(canvas, cross_cx, cross_cy, cross_vhw, cross_vhh,
              CROSS_COLOR, rr=cross_vhw * 0.6, alpha=1.0,
              clip_circle=clip[0], clip_r=clip[1])

    # 12. Cross horizontal bar
    fill_rect(canvas, cross_cx, cross_h_cy, cross_hhw, cross_hhh,
              CROSS_COLOR, rr=cross_hhh * 0.6, alpha=1.0,
              clip_circle=clip[0], clip_r=clip[1])

    # 13. Gold accent dot at cross tip
    fill_circle(canvas, cross_cx, cross_cy - cross_vhh, S * 0.012,
                GOLD_LIGHT, aa=1.5, alpha=0.95)

# ─── Thin navy ring border on badge ──────────────────────────────────────────

def draw_badge_border(canvas):
    cx, cy = S / 2, S / 2
    r = S * 0.44
    fill_ring(canvas, cx, cy, r + 3, r - 10, NAVY_MID, aa=2.0, alpha=0.55)
    fill_ring(canvas, cx, cy, r + 1, r - 2,  WHITE,    aa=1.5, alpha=0.90)

# ─── "SIMBAHAN" text ──────────────────────────────────────────────────────────

def draw_label(canvas):
    cx   = S / 2
    cy   = S / 2
    r    = S * 0.44
    # Position text inside badge, below church
    text_cy = cy + r * 0.72
    scale   = 11  # pixel scale for the 5×7 font → each pixel = 11px

    # Subtle text shadow
    draw_text(canvas, "SIMBAHAN", cx + 2, text_cy + 3, scale, NAVY_DARK, alpha=0.35)
    # Main text in navy
    draw_text(canvas, "SIMBAHAN", cx, text_cy, scale, NAVY, alpha=1.0)

    # Gold underline accent
    line_y  = int(text_cy + 7 * scale / 2 + scale * 1.4)
    line_hw = int(len("SIMBAHAN") * (5 + 2) * scale / 2 * 0.55)
    line_h  = max(3, scale // 4)
    fill_rect(canvas, cx, line_y, line_hw, line_h,
              GOLD, rr=line_h, alpha=0.85)

# ─── PNG writer ───────────────────────────────────────────────────────────────

def write_png(canvas, path):
    size = len(canvas)

    def chunk(tag, data):
        raw = tag + data
        return struct.pack('>I', len(data)) + raw + struct.pack('>I', zlib.crc32(raw) & 0xFFFFFFFF)

    rows = b''
    for row in canvas:
        rows += b'\x00' + b''.join(struct.pack('BBB', *px) for px in row)

    png = (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(rows, 6))
        + chunk(b'IEND', b'')
    )
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(png)

# ─── Main ─────────────────────────────────────────────────────────────────────

def render(size=1024):
    global S
    S = size
    print(f"  Rendering {size}×{size}...", end=' ', flush=True)
    canvas = make_canvas(size)
    draw_background(canvas)
    draw_outer_glow(canvas)
    draw_badge(canvas)
    draw_church(canvas)
    draw_badge_border(canvas)
    draw_label(canvas)
    print("done")
    return canvas

BASE = os.path.dirname(os.path.abspath(__file__))

print("\n🎨  Simbahan Logo Generator")
print("=" * 40)

# Master 1024×1024
print("\n[1/5] Master icon (1024×1024)")
canvas = render(1024)
master = os.path.join(BASE, "assets/images/icon.png")
write_png(canvas, master)
print(f"  ✓ {master}")

# adaptive-icon (1024, same design, no text — foreground layer)
print("\n[2/5] Adaptive icon (1024×1024)")
write_png(canvas, os.path.join(BASE, "assets/images/adaptive-icon.png"))
print(f"  ✓ assets/images/adaptive-icon.png")

# splash-icon 512×512
print("\n[3/5] Splash icon (512×512)")
import subprocess
splash = os.path.join(BASE, "assets/images/splash-icon.png")
subprocess.run(['sips', '-z', '512', '512', master, '--out', splash],
               capture_output=True)
print(f"  ✓ {splash}")

# favicon 64×64
print("\n[4/5] Favicon (64×64)")
favicon = os.path.join(BASE, "assets/images/favicon.png")
subprocess.run(['sips', '-z', '64', '64', master, '--out', favicon],
               capture_output=True)
print(f"  ✓ {favicon}")

# iOS 1024
print("\n[5/5] iOS AppIcon (1024×1024)")
ios_dst = os.path.join(BASE, "ios/Simbahan/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png")
subprocess.run(['sips', '-z', '1024', '1024', master, '--out', ios_dst],
               capture_output=True)
print(f"  ✓ {ios_dst}")

# Android mipmaps
print("\n[+] Android mipmap icons")
ANDROID_RES = os.path.join(BASE, "android/app/src/main/res")
for folder, size in [('mipmap-mdpi',48),('mipmap-hdpi',72),('mipmap-xhdpi',96),
                     ('mipmap-xxhdpi',144),('mipmap-xxxhdpi',192)]:
    for name in ['ic_launcher.png', 'ic_launcher_round.png']:
        dst = os.path.join(ANDROID_RES, folder, name)
        subprocess.run(['sips', '-z', str(size), str(size), master, '--out', dst],
                       capture_output=True)
        print(f"  ✓ {folder}/{name} ({size}px)")

# PWA icons
print("\n[+] PWA icons")
for size, name in [(192,'icon-192.png'),(512,'icon-512.png'),(64,'favicon.png')]:
    dst = os.path.join(BASE, "public", name)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(['sips', '-z', str(size), str(size), master, '--out', dst],
                   capture_output=True)
    print(f"  ✓ public/{name} ({size}px)")

print("\n✅  All assets generated successfully!")
print("   Preview: assets/images/icon.png")
