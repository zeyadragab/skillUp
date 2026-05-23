import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

FONTS = r"c:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply\.claude\skills\canvas-design\canvas-fonts"
OUT   = r"c:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply\.claude\skills\canvas-design\serpent_logic.png"

W, H = 2400, 2400

# ─── Background ───────────────────────────────────────────────────────────────
BG = (10, 14, 24)
canvas = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(canvas)

# Faint graph-paper grid
GC = (16, 23, 38)
STEP = 160
for x in range(0, W + 1, STEP):
    draw.line([(x, 0), (x, H)], fill=GC, width=1)
for y in range(0, H + 1, STEP):
    draw.line([(0, y), (W, y)], fill=GC, width=1)

# Subtle dot scatter in background (fibonacci-positioned)
np.random.seed(7)
phi = (1 + math.sqrt(5)) / 2
dot_color = (20, 30, 50)
for i in range(1, 320):
    angle = 2 * math.pi * i / phi
    r = math.sqrt(i) * 38
    bx = int(W / 2 + r * math.cos(angle))
    by = int(H / 2 + r * math.sin(angle))
    if 60 < bx < W - 60 and 60 < by < H - 60:
        draw.ellipse([bx - 1, by - 1, bx + 1, by + 1], fill=dot_color)

# ─── Serpentine density field ──────────────────────────────────────────────────
print("Building density field…")
n_path = 700
t_vals = np.linspace(0, 1, n_path)

# Path: sinuous snake, 4.5 oscillations, slight taper
cx = W / 2
amplitude = 460 * np.exp(-t_vals * 0.25)
path_x = cx + amplitude * np.sin(t_vals * np.pi * 4.5)
path_y = H * 0.055 + t_vals * H * 0.89

density  = np.zeros((H, W), dtype=np.float64)
t_weight = np.zeros((H, W), dtype=np.float64)

xg = np.arange(W, dtype=np.float64)
yg = np.arange(H, dtype=np.float64)

for i in range(n_path):
    t  = t_vals[i]
    ix = float(path_x[i])
    iy = float(path_y[i])

    # Width pulses — thicker at bends, thinner at inflections
    bend = abs(math.cos(t * math.pi * 4.5))
    sigma = 28 + 22 * bend + 8 * abs(math.sin(t * math.pi * 18))

    margin = int(sigma * 3.8)
    x1, x2 = max(0, int(ix) - margin), min(W, int(ix) + margin + 1)
    y1, y2 = max(0, int(iy) - margin), min(H, int(iy) + margin + 1)

    gx = np.exp(-(xg[x1:x2] - ix) ** 2 / (2 * sigma ** 2))
    gy = np.exp(-(yg[y1:y2] - iy) ** 2 / (2 * sigma ** 2))
    contrib = np.outer(gy, gx)

    density[y1:y2, x1:x2]  += contrib
    t_weight[y1:y2, x1:x2] += contrib * t

# Normalise
d_max = density.max()
dn = density / d_max                                   # 0-1 density
t_field = np.where(density > 1e-9, t_weight / density, 0.0)  # weighted avg t

# ─── Colour mapping ─────────────────────────────────────────────────────────
# Python blue  #3776AB → Python yellow #FFD343
BLUE   = np.array([55,  118, 171], dtype=np.float64)
YELLOW = np.array([255, 211,  67], dtype=np.float64)
BG_f   = np.array([BG[0], BG[1], BG[2]], dtype=np.float64)

tf3 = t_field[:, :, np.newaxis]
serpent_col = BLUE + (YELLOW - BLUE) * tf3            # (H,W,3)

# Alpha: tighter non-linear ramp for a crisper, more luminous core
alpha = np.clip(dn ** 0.42, 0, 1)[:, :, np.newaxis]

result = BG_f + (serpent_col - BG_f) * alpha
result = np.clip(result, 0, 255).astype(np.uint8)

canvas = Image.fromarray(result, "RGB")

# Micro-blur to smooth pixel noise
canvas = canvas.filter(ImageFilter.GaussianBlur(radius=1.2))

# Second light-glow pass: wider, dimmer blue halo
glow_dn = np.clip(dn ** 0.3, 0, 1)
glow_col = np.array([30, 70, 130], dtype=np.float64)
glow_alpha = (glow_dn * 0.18)[:, :, np.newaxis]
canvas_arr = np.array(canvas, dtype=np.float64)
canvas_arr = canvas_arr + (glow_col - canvas_arr) * glow_alpha
canvas_arr = np.clip(canvas_arr, 0, 255).astype(np.uint8)
canvas = Image.fromarray(canvas_arr, "RGB")

# ─── Luminous spine: razor-thin bright core along path ──────────────────────
spine_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
spine_draw  = ImageDraw.Draw(spine_layer)
for i in range(n_path - 1):
    t  = float(t_vals[i])
    c  = (int(55 + (255-55)*t), int(118 + (211-118)*t), int(171 + (67-171)*t), 90)
    spine_draw.line([
        (int(path_x[i]), int(path_y[i])),
        (int(path_x[i+1]), int(path_y[i+1]))
    ], fill=c, width=2)
# Soften spine so it blends
spine_layer = spine_layer.filter(ImageFilter.GaussianBlur(radius=1.5))
canvas = canvas.convert("RGBA")
canvas = Image.alpha_composite(canvas, spine_layer)
canvas = canvas.convert("RGB")

# Unsharp mask to recover crispness after all the blurring
canvas = canvas.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=3))

# ─── Vignette overlay ────────────────────────────────────────────────────────
vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vig_draw = ImageDraw.Draw(vig)
n_rings = 28
for r in range(n_rings):
    frac   = r / n_rings
    alpha_v = int((frac ** 1.6) * 210)
    margin  = int(frac * min(W, H) / 2)
    vig_draw.rectangle([margin, margin, W - margin, H - margin],
                       outline=(0, 0, 0, 0))
inset = 0
for r in range(n_rings):
    frac    = (n_rings - r) / n_rings
    alpha_v = int(((1 - frac) ** 1.8) * 200)
    m       = int((1 - frac) * 340)
    vig_draw.rectangle([m, m, W - m, H - m], outline=(BG[0], BG[1], BG[2], alpha_v), width=1)
# True radial vignette via numpy
xv = np.linspace(-1, 1, W)
yv = np.linspace(-1, 1, H)
XX, YY = np.meshgrid(xv, yv)
dist = np.sqrt(XX**2 + YY**2)
vig_alpha = np.clip((dist - 0.55) / 0.55, 0, 1) ** 1.6 * 210
vig_arr = np.zeros((H, W, 4), dtype=np.uint8)
vig_arr[:,:,3] = vig_alpha.astype(np.uint8)
vig_img = Image.fromarray(vig_arr, "RGBA")
canvas = canvas.convert("RGBA")
canvas = Image.alpha_composite(canvas, vig_img)
canvas = canvas.convert("RGB")

# ─── Scale markers along path ────────────────────────────────────────────────
# Thin tick marks every 10th path point = diagnostic / scientific feel
draw = ImageDraw.Draw(canvas)
TICK_COLOR = (45, 68, 105)
for i in range(0, n_path, 10):
    px, py = float(path_x[i]), float(path_y[i])
    # Perpendicular tick
    if i < n_path - 1:
        dx = path_x[i + 1] - path_x[i]
        dy = path_y[i + 1] - path_y[i]
        length = math.hypot(dx, dy) + 1e-9
        nx, ny = -dy / length, dx / length
    tick_len = 12
    draw.line([
        (int(px + nx * tick_len), int(py + ny * tick_len)),
        (int(px - nx * tick_len), int(py - ny * tick_len))
    ], fill=TICK_COLOR, width=1)

# ─── Typography ───────────────────────────────────────────────────────────────
print("Adding typography…")

f_mono_xs  = ImageFont.truetype(os.path.join(FONTS, "JetBrainsMono-Regular.ttf"), 15)
f_mono_sm  = ImageFont.truetype(os.path.join(FONTS, "JetBrainsMono-Regular.ttf"), 22)
f_serif    = ImageFont.truetype(os.path.join(FONTS, "Gloock-Regular.ttf"), 148)
f_italic   = ImageFont.truetype(os.path.join(FONTS, "CrimsonPro-Italic.ttf"), 30)

# --- Watermark: enormous "PYTHON" in Gloock, barely visible
wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
wm_draw = ImageDraw.Draw(wm)
wm_text = "PYTHON"
bb = wm_draw.textbbox((0, 0), wm_text, font=f_serif)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
wm_draw.text(((W - tw) // 2, (H - th) // 2 - 40), wm_text,
             font=f_serif, fill=(55, 118, 171, 22))
canvas = canvas.convert("RGBA")
canvas = Image.alpha_composite(canvas, wm)
canvas = canvas.convert("RGB")
draw = ImageDraw.Draw(canvas)

# --- Grid coordinate labels (every 2nd node, very dark)
coord_col = (22, 34, 56)
for xi in range(0, W + 1, STEP * 2):
    for yi in range(0, H + 1, STEP * 2):
        draw.text((xi + 4, yi + 3), f"{xi//STEP},{yi//STEP}",
                  font=f_mono_xs, fill=coord_col)

# --- Bottom-right reference tag
ref_col = (65, 92, 132)
draw.text((W - 420, H - 56),
          "recursive descent  ·  fig. 01  ·  2026",
          font=f_mono_sm, fill=ref_col)

# --- Top-right: subtle datum
draw.text((W - 160, 36), "σ·field·map", font=f_mono_xs, fill=coord_col)

# --- Vertical title: "SERPENT LOGIC" on left margin
vert_src = Image.new("RGBA", (900, 48), (0, 0, 0, 0))
vert_draw = ImageDraw.Draw(vert_src)
vert_draw.text((0, 4), "SERPENT  LOGIC", font=f_mono_sm,
               fill=(55, 118, 171, 72))
vert_rotated = vert_src.rotate(90, expand=True)
canvas = canvas.convert("RGBA")
canvas.paste(vert_rotated, (28, H // 2 - 450), vert_rotated)
canvas = canvas.convert("RGB")
draw = ImageDraw.Draw(canvas)

# --- Italic phrase — bottom centre
phrase = "where logic becomes form"
bb = draw.textbbox((0, 0), phrase, font=f_italic)
tw2 = bb[2] - bb[0]

phrase_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
p_draw = ImageDraw.Draw(phrase_layer)
p_draw.text(((W - tw2) // 2, H - 72), phrase,
            font=f_italic, fill=(140, 170, 210, 160))
canvas = canvas.convert("RGBA")
canvas = Image.alpha_composite(canvas, phrase_layer)
canvas = canvas.convert("RGB")

# ─── Save ────────────────────────────────────────────────────────────────────
print("Saving…")
canvas.save(OUT, "PNG", dpi=(200, 200))
print(f"✅  Saved → {OUT}")
