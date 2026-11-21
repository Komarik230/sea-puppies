"""
Sprite lab for SEA PUPPIES.
Builds LCD sprites from simple shapes (ellipses / polygons / lines), adds outlines,
writes them as editable text grids (js/sprites.gen.js) and renders a preview sheet.

Tones:  '.' transparent  '0' LCD paper  '1' light  '2' mid  '3' ink  'o' rescue-orange
"""
import json, math, sys
from PIL import Image, ImageDraw

LCD = {'0': (167, 179, 148), '1': (135, 148, 116), '2': (91, 102, 79), '3': (33, 42, 30), 'o': (255, 122, 26)}

# ---------------------------------------------------------------- rasterizer
class Spr:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.g = [['.'] * w for _ in range(h)]

    def put(self, x, y, t):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = t

    def get(self, x, y):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.g[y][x]
        return '.'

    # --- masks
    def mask_ellipse(self, cx, cy, rx, ry, rot=0.0):
        m = set()
        c, s = math.cos(-rot), math.sin(-rot)
        for y in range(self.h):
            for x in range(self.w):
                hits = 0
                for sy in (0.25, 0.75):
                    for sx in (0.25, 0.75):
                        dx, dy = x + sx - cx, y + sy - cy
                        ux, uy = dx * c - dy * s, dx * s + dy * c
                        if (ux / rx) ** 2 + (uy / ry) ** 2 <= 1.0:
                            hits += 1
                if hits >= 2:
                    m.add((x, y))
        return m

    def mask_poly(self, pts):
        m = set()
        n = len(pts)
        for y in range(self.h):
            for x in range(self.w):
                hits = 0
                for sy in (0.25, 0.75):
                    for sx in (0.25, 0.75):
                        px, py = x + sx, y + sy
                        inside = False
                        j = n - 1
                        for i in range(n):
                            xi, yi = pts[i]; xj, yj = pts[j]
                            if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi):
                                inside = not inside
                            j = i
                        if inside:
                            hits += 1
                if hits >= 2:
                    m.add((x, y))
        return m

    def fill(self, mask, t):
        for (x, y) in mask:
            self.put(x, y, t)

    def outline_mask(self, mask, t='3', diag=False):
        """paint the boundary pixels of a mask (pixels of the mask that touch outside)"""
        nb = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        if diag:
            nb += [(1, 1), (-1, -1), (1, -1), (-1, 1)]
        for (x, y) in mask:
            for dx, dy in nb:
                if (x + dx, y + dy) not in mask:
                    self.put(x, y, t)
                    break

    def part(self, mask, fill='2', outline='3'):
        self.fill(mask, fill)
        if outline:
            self.outline_mask(mask, outline)

    def line(self, x0, y0, x1, y1, t='3'):
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.put(x0, y0, t)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    def silhouette_outline(self, t='3'):
        """outline the whole sprite against transparency"""
        filled = {(x, y) for y in range(self.h) for x in range(self.w) if self.g[y][x] != '.'}
        self.outline_mask(filled, t)

    def rows(self):
        return [''.join(r) for r in self.g]

    def flip(self):
        out = Spr(self.w, self.h)
        for y in range(self.h):
            out.g[y] = list(reversed(self.g[y]))
        return out


def union(*ms):
    out = set()
    for m in ms:
        out |= m
    return out


def rot(pts, ang, px, py):
    c, s = math.cos(ang), math.sin(ang)
    return [((x - px) * c - (y - py) * s + px, (x - px) * s + (y - py) * c + py) for x, y in pts]


def rp(x, y, ang, px, py):
    c, s = math.cos(ang), math.sin(ang)
    return ((x - px) * c - (y - py) * s + px, (x - px) * s + (y - py) * c + py)


# ---------------------------------------------------------------- the pup
def pup(head_dy=0, head_rot=0.0, mouth='closed', eye='open', flipper='down', hind='rest', gulp=False,
        body_dy=0, tilt=0.0, W=36, H=30, ear=True, extra=None):
    """Sitting California sea lion pup, facing right.
    head_rot: radians, positive = nose up (around the neck pivot)."""
    s = Spr(W, H)
    by = body_dy
    piv = (21.0, 13.0 + by)  # neck pivot for head rotation

    def H_(x, y):
        # head-space -> sprite (rotate around neck pivot, then head bob)
        X, Y = rp(x, y + by, -head_rot, *piv)
        return X, Y + head_dy

    # body masses
    hip = s.mask_ellipse(8.5, 23.6 + by, 6.2, 4.4)
    belly = s.mask_ellipse(15.0, 21.6 + by, 8.0, 5.6)
    chest = s.mask_ellipse(20.6, 17.0 + by, 5.6, 6.0)
    neck = s.mask_ellipse(21.0, 12.6 + by + head_dy * 0.5, 4.2, 4.6)
    body = union(hip, belly, chest, neck)

    # hind flippers (behind body, drawn first)
    if hind == 'rest':
        hf1 = s.mask_poly([(6, 23 + by), (1.0, 26.4 + by), (0.2, 28.6 + by), (5.5, 28.6 + by), (9.5, 26 + by)])
        hf2 = s.mask_poly([(9, 25.5 + by), (6.0, 28.4 + by), (12.6, 28.8 + by), (13.6, 26.6 + by)])
    elif hind == 'scratch':
        # one hind flipper swung up to the neck, the other resting
        hf1 = s.mask_poly([(10, 21 + by), (13.2, 14.6 + by), (16.4, 11.2 + by), (17.8, 12.4 + by), (15.6, 16.8 + by), (12.6, 22.6 + by)])
        hf2 = s.mask_poly([(6, 24 + by), (1.0, 26.8 + by), (0.4, 28.6 + by), (6.0, 28.6 + by), (10.0, 26.4 + by)])
    else:  # 'walk2' alt foot
        hf1 = s.mask_poly([(7, 23 + by), (2.6, 26.0 + by), (2.0, 28.6 + by), (7.0, 28.6 + by), (10.0, 26 + by)])
        hf2 = s.mask_poly([(10, 25.0 + by), (8.0, 28.4 + by), (14.0, 28.8 + by), (14.6, 26.2 + by)])
    s.part(hf2, '3', '3')
    s.part(hf1, '3', '3')
    # toes highlight
    s.part(body, '2', '3')

    # belly / throat light
    light = s.mask_ellipse(19.5, 21.5 + by, 6.6, 6.0) & body
    for (x, y) in light:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    # back shading band (dither) for grit
    for (x, y) in body:
        if s.get(x, y) == '2' and (x + y) % 2 == 0 and (x, y - 2) not in body:
            s.put(x, y, '3')

    # head
    head_pts = []
    hc = H_(22.6, 7.6)
    head = s.mask_ellipse(hc[0], hc[1], 6.3, 5.6, rot=-head_rot)
    sc = H_(28.6, 9.2)
    snout = s.mask_ellipse(sc[0], sc[1], 3.9, 2.6, rot=-head_rot)
    headm = union(head, snout)
    s.part(headm, '2', '3')
    # face light (muzzle + cheek)
    face = (s.mask_ellipse(*H_(27.0, 10.0), 4.6, 2.4, rot=-head_rot)) & headm
    for (x, y) in face:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    # re-outline head over body seam
    s.outline_mask(headm, '3')

    # ear (tiny pinna)
    if ear:
        ex, ey = H_(19.0, 6.4)
        s.put(ex, ey, '3'); s.put(ex, ey + 1, '3'); s.put(ex - 1, ey + 1, '3')

    # eye
    exx, eyy = H_(24.4, 6.6)
    exx, eyy = int(round(exx)), int(round(eyy))
    if eye == 'open':
        for dx in (0, 1):
            for dy in (0, 1, 2):
                s.put(exx + dx, eyy + dy, '3')
        s.put(exx, eyy, '0')
    elif eye == 'closed':
        s.put(exx - 1, eyy + 1, '3'); s.put(exx, eyy + 2, '3'); s.put(exx + 1, eyy + 2, '3'); s.put(exx + 2, eyy + 1, '3')
    elif eye == 'happy':
        s.put(exx - 1, eyy + 2, '3'); s.put(exx, eyy + 1, '3'); s.put(exx + 1, eyy + 1, '3'); s.put(exx + 2, eyy + 2, '3')
    elif eye == 'sad':
        s.put(exx - 1, eyy, '3'); s.put(exx, eyy + 1, '3'); s.put(exx + 1, eyy + 1, '3'); s.put(exx, eyy + 2, '3'); s.put(exx + 1, eyy + 2, '3')
    elif eye == 'wide':
        for dx in (0, 1):
            for dy in (0, 1, 2):
                s.put(exx + dx, eyy + dy, '3')
        s.put(exx, eyy, '0'); s.put(exx + 1, eyy + 2, '0')

    # nose
    nx, ny = H_(32.0, 8.4)
    s.put(nx, ny, '3'); s.put(nx, ny + 1, '3'); s.put(nx - 1, ny, '3')
    # mouth
    if mouth == 'closed':
        a = H_(27.6, 11.0); b = H_(31.0, 10.6)
        s.line(a[0], a[1], b[0], b[1], '3')
    else:
        # open mouth: dark wedge
        p = [H_(27.0, 10.6), H_(32.6, 10.0), H_(31.8, 13.4), H_(28.4, 12.4)]
        m = s.mask_poly(p)
        s.fill(m, '3')
        # tongue/teeth hint
        tx, ty = H_(30.4, 11.6)
        s.put(tx, ty, '1')
    # whiskers
    for wx, wy in ((28.6, 10.0), (30.0, 9.8)):
        X, Y = H_(wx, wy)
        if s.get(X, Y) in '12':
            s.put(X, Y, '0')

    # gulp bulge
    if gulp:
        g = s.mask_ellipse(23.6, 13.6 + by, 2.4, 2.2)
        s.part(g, '1', '3')

    # front flipper (in front of body)
    if flipper == 'down':
        ff = s.mask_poly([(18.6, 16.0 + by), (23.4, 15.2 + by), (28.0, 23.6 + by), (31.2, 28.6 + by), (25.2, 28.8 + by), (20.4, 22.4 + by)])
    elif flipper == 'up':
        ff = s.mask_poly([(19.0, 16.0 + by), (22.8, 14.6 + by), (28.6, 8.6 + by), (31.4, 4.6 + by), (32.4, 6.6 + by), (24.0, 18.6 + by)])
    elif flipper == 'fwd':
        ff = s.mask_poly([(19.0, 16.0 + by), (23.4, 15.0 + by), (32.6, 19.6 + by), (34.6, 22.0 + by), (29.0, 22.0 + by), (21.0, 20.6 + by)])
    else:  # 'back' (walking stride)
        ff = s.mask_poly([(18.4, 16.0 + by), (23.0, 15.4 + by), (24.4, 22.6 + by), (24.0, 28.6 + by), (18.4, 28.8 + by), (18.8, 22.4 + by)])
    s.part(ff, '3', '3')
    # flipper highlight edge
    for (x, y) in ff:
        if (x - 1, y) not in ff and (x, y - 1) in ff and (x + 1, y) in ff:
            s.put(x + 1, y, '2')

    if extra:
        extra(s)
    return s


def handstand(frame=0):
    """front-flipper handstand: body vertical, tail and hind flippers up"""
    s = Spr(30, 34)
    sway = (-1, 0, 1, 0)[frame % 4]
    # body column
    body = union(s.mask_ellipse(15 + sway, 12.0, 5.0, 8.4), s.mask_ellipse(15.5 + sway * 0.5, 20.0, 6.0, 5.6))
    # hind flippers up top
    hf1 = s.mask_poly([(13 + sway, 5), (8 + sway * 2, 0.5), (11 + sway * 2, 0.2), (16 + sway, 4)])
    hf2 = s.mask_poly([(16 + sway, 4.5), (21 + sway * 2, 0.4), (22.6 + sway * 2, 2.0), (18 + sway, 6)])
    s.part(hf1, '3', '3'); s.part(hf2, '3', '3')
    s.part(body, '2', '3')
    lt = s.mask_ellipse(17.6 + sway * 0.5, 17.0, 3.0, 6.0) & body
    for (x, y) in lt:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    # head at the bottom, looking right & up at the viewer
    head = union(s.mask_ellipse(17.6, 24.6, 5.4, 4.6), s.mask_ellipse(22.8, 25.8, 3.4, 2.4))
    s.part(head, '2', '3')
    face = s.mask_ellipse(21.4, 26.6, 3.6, 2.0) & head
    for (x, y) in face:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    s.outline_mask(head, '3')
    for dx in (0, 1):
        for dy in (0, 1):
            s.put(19 + dx, 23 + dy, '3')
    s.put(19, 23, '0')
    s.put(26, 25, '3'); s.put(26, 26, '3')
    s.line(23, 27, 25, 27, '3')
    s.put(15, 22, '3')  # ear
    # front flippers planted, splayed like arms
    f1 = s.mask_poly([(12, 22), (14.6, 23), (12.6, 30), (9.4, 33.6), (6.0, 33.6), (9.6, 29.0)])
    f2 = s.mask_poly([(18, 28), (20.8, 28.6), (22.6, 31.0), (25.6, 33.6), (19.4, 33.6), (18.0, 31.0)])
    s.part(f1, '3', '3'); s.part(f2, '3', '3')
    return s


def lying(eye='closed', breathe=0):
    """pup asleep, lying on its belly, chin on the ground, facing right"""
    s = Spr(40, 20)
    b = breathe
    hf = s.mask_poly([(6, 13 - b), (0.6, 15.2), (0.2, 18.6), (6.0, 18.6), (9, 16)])
    s.part(hf, '3', '3')
    body = union(s.mask_ellipse(15.0, 13.4 - b * 0.5, 11.0, 5.4 + b * 0.4), s.mask_ellipse(25.0, 13.8, 6.4, 4.8))
    s.part(body, '2', '3')
    for (x, y) in body:
        if s.get(x, y) == '2' and (x + y) % 2 == 0 and (x, y - 2) not in body:
            s.put(x, y, '3')
    lt = s.mask_ellipse(20.0, 18.2, 9.0, 2.6) & body
    for (x, y) in lt:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    head = union(s.mask_ellipse(31.0, 13.6, 5.4, 4.4), s.mask_ellipse(36.0, 15.6, 3.6, 2.4))
    s.part(head, '2', '3')
    face = s.mask_ellipse(35.0, 16.6, 4.0, 1.8) & head
    for (x, y) in face:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    s.outline_mask(head, '3')
    if eye == 'closed':
        s.line(31, 13, 33, 13, '3'); s.put(30, 12, '3')
    elif eye == 'open':
        s.put(32, 12, '3'); s.put(33, 12, '3'); s.put(32, 13, '3'); s.put(33, 13, '3'); s.put(32, 12, '0')
    s.put(29, 10, '3')
    s.put(39, 14, '3'); s.put(39, 15, '3')
    s.line(36, 17, 38, 17, '3')
    ff = s.mask_poly([(22, 15), (26, 15), (30, 18.6), (21, 18.6)])
    s.part(ff, '3', '3')
    return s


def swim(frame=0):
    """streamlined swimming pup facing right (for diving / exit)"""
    s = Spr(40, 16)
    k = (0, 1, 0, -1)[frame % 4]
    body = union(s.mask_ellipse(18.0, 8.0, 12.0, 4.2), s.mask_ellipse(30.0, 7.6, 5.4, 3.8), s.mask_ellipse(35.0, 8.4, 3.2, 2.0))
    hf = s.mask_poly([(7, 7), (0.4, 4.0 + k), (0.0, 7.0 + k), (1.0, 11.0 - k), (7, 9.6)])
    s.part(hf, '3', '3')
    s.part(body, '2', '3')
    lt = s.mask_ellipse(22.0, 11.0, 10.0, 1.8) & body
    for (x, y) in lt:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    s.outline_mask(body, '3')
    s.put(31, 6, '3'); s.put(32, 6, '3'); s.put(31, 6, '0'); s.put(31, 7, '3'); s.put(32, 7, '3')
    s.put(38, 7, '3'); s.put(38, 8, '3')
    ff = s.mask_poly([(19, 10), (23, 10), (17.0 + k * 2, 15.4), (13.0 + k * 2, 15.4)])
    s.part(ff, '3', '3')
    return s


def float_flipper(frame=0, eye='open', both=False):
    """pup floating at the surface with a fore flipper raised ('jughandling' / sailing)"""
    s = Spr(40, 26)
    k = (0, 1, 0, -1)[frame % 4]
    body = union(s.mask_ellipse(18.0, 19.0, 12.0, 4.4), s.mask_ellipse(30.0, 18.0, 5.4, 4.0), s.mask_ellipse(35.4, 18.8, 3.2, 2.0))
    s.part(body, '2', '3')
    lt = s.mask_ellipse(30.0, 19.6, 6.0, 2.2) & body
    for (x, y) in lt:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    s.outline_mask(body, '3')
    if eye == 'open':
        s.put(31, 16, '3'); s.put(32, 16, '3'); s.put(31, 17, '3'); s.put(32, 17, '3'); s.put(31, 16, '0')
    else:
        s.line(30, 17, 32, 17, '3')
    s.put(38, 18, '3'); s.put(38, 19, '3')
    # raised flipper (sail)
    fl = s.mask_poly([(20, 16), (24, 16), (23.0 + k * 0.5, 6.0), (21.4 + k * 0.5, 0.6), (18.6 + k * 0.5, 3.0), (18.6, 10.0)])
    s.part(fl, '3', '3')
    for y in range(2, 14):
        if s.get(20, y) == '3' and s.get(21, y) == '3':
            s.put(21, y, '2')
    if both:
        hf = s.mask_poly([(7, 17), (3.0, 7.0 + k), (5.6, 6.0 + k), (9.0, 15.6)])
        s.part(hf, '3', '3')
    # cut off below the waterline (rows >= 21 transparent → water drawn by scene)
    for y in range(21, 26):
        for x in range(40):
            s.put(x, y, '.')
    return s


def mom_head(mouth='closed', eye='open', W=26, H=24):
    """adult female, big head + neck, facing LEFT (enters from the right edge)"""
    s = Spr(W, H)
    neck = s.mask_poly([(10, 12), (20, 9), (26, 14), (26, 24), (12, 24)])
    s.part(neck, '2', '3')
    for (x, y) in neck:
        if s.get(x, y) == '2' and (x + y) % 2 == 0 and y % 2 == 0 and x > 21:
            s.put(x, y, '3')
    head = union(s.mask_ellipse(12.0, 9.0, 7.4, 6.4), s.mask_ellipse(5.0, 11.0, 4.6, 3.0))
    s.part(head, '2', '3')
    face = s.mask_ellipse(6.0, 12.0, 5.4, 2.6) & head
    for (x, y) in face:
        if s.get(x, y) == '2':
            s.put(x, y, '1')
    s.outline_mask(head, '3')
    if eye == 'open':
        for dx in (0, 1):
            for dy in (0, 1, 2):
                s.put(9 + dx, 7 + dy, '3')
        s.put(10, 7, '0')
    else:
        s.line(8, 9, 11, 9, '3')
    s.put(15, 6, '3'); s.put(15, 7, '3'); s.put(16, 7, '3')  # ear
    s.put(1, 10, '3'); s.put(1, 11, '3'); s.put(2, 10, '3')  # nose
    if mouth == 'closed':
        s.line(2, 13, 6, 13, '3')
    else:
        m = s.mask_poly([(0.4, 12.6), (6.4, 12.6), (5.4, 16.0), (1.4, 15.2)])
        s.fill(m, '3')
        s.put(3, 14, '1')
    for wx, wy in ((4, 12), (5, 12)):
        if s.get(wx, wy) in '12':
            s.put(wx, wy, '0')
    return s


def furseal(frame=0):
    """northern fur seal sleeping at the surface: one fore flipper paddling below,
    the other fore flipper + both hind flippers held up in the air, one eye open"""
    s = Spr(40, 24)
    k = (0, 1, 0, -1)[frame % 4]
    body = union(s.mask_ellipse(18.0, 15.6, 11.6, 4.2), s.mask_ellipse(29.0, 15.0, 5.0, 3.6), s.mask_ellipse(34.0, 15.6, 2.8, 1.8))
    hf = s.mask_poly([(8, 14), (4.0, 5.0), (6.6, 4.2), (10.6, 12.4)])
    hf2 = s.mask_poly([(10, 14), (8.6, 4.6), (11.4, 4.4), (12.6, 12.6)])
    ff = s.mask_poly([(20, 13), (23, 13), (21.6, 3.4), (19.2, 3.8)])
    for m in (hf, hf2, ff):
        s.part(m, '3', '3')
    s.part(body, '2', '3')
    # fur: dither all over (fur seals look fluffier)
    for (x, y) in body:
        if s.get(x, y) == '2' and (x * 3 + y) % 4 == 0:
            s.put(x, y, '1')
    s.outline_mask(body, '3')
    # long ear flap
    s.put(26, 12, '3'); s.put(25, 11, '3')
    # one eye open (towards the water), one closed (towards the sky) -> show the open one
    s.put(30, 14, '3'); s.put(31, 14, '3'); s.put(30, 14, '0'); s.put(31, 15, '3'); s.put(30, 15, '3')
    s.put(36, 15, '3')
    # paddling flipper under water (drawn dashed below the surface line)
    for i, (x, y) in enumerate(((22, 19), (23, 20), (24 + k, 21), (25 + k, 22))):
        s.put(x, y, '3')
    return s


# ---------------------------------------------------------------- items
def fish(big=False, frame=0):
    if not big:
        s = Spr(9, 5)
        b = s.mask_ellipse(3.6, 2.5, 3.4, 1.8)
        s.part(b, '1', '3')
        t = s.mask_poly([(6, 2.5), (8.8, 0.4 + frame % 2), (8.8, 4.6 - frame % 2)])
        s.part(t, '3', '3')
        s.put(1, 2, '3')
        return s
    s = Spr(16, 8)
    b = s.mask_ellipse(6.6, 4.0, 6.2, 3.2)
    s.part(b, '1', '3')
    for (x, y) in b:
        if y <= 2 and s.get(x, y) == '1':
            s.put(x, y, '2')
    t = s.mask_poly([(11.6, 4.0), (15.8, 0.4 + frame % 2), (15.8, 7.6 - frame % 2)])
    s.part(t, '3', '3')
    s.put(2, 3, '3'); s.put(2, 4, '0')
    s.line(5, 6, 9, 6, '2')
    return s


def ball():
    s = Spr(7, 7)
    b = s.mask_ellipse(3.5, 3.5, 3.4, 3.4)
    s.part(b, '1', '3')
    for x in range(1, 6):
        s.put(x, 3, '3')
    s.put(2, 2, '0')
    return s


def scissors(open_=True):
    s = Spr(9, 9)
    if open_:
        s.line(0, 0, 6, 6, '3'); s.line(0, 6, 6, 0, '3')
    else:
        s.line(0, 2, 6, 4, '3'); s.line(0, 4, 6, 2, '3')
    for (cx, cy) in ((7, 7), (7, 1)) if open_ else ((7, 6), (7, 0)):
        s.put(cx, cy, '3'); s.put(cx + 1, cy, '3'); s.put(cx, cy + 1, '3'); s.put(cx + 1, cy + 1, '3')
    return s


def sun():
    s = Spr(11, 11)
    b = s.mask_ellipse(5.5, 5.5, 3.0, 3.0)
    s.part(b, '1', '3')
    for (x, y) in ((5, 0), (5, 10), (0, 5), (10, 5), (1, 1), (9, 9), (1, 9), (9, 1)):
        s.put(x, y, '3')
    return s


def heart(full=True):
    rows = [".33.33.",
            "3113113",
            "3111113",
            ".31113.",
            "..313..",
            "...3..."] if full else [
            ".33.33.",
            "3..3..3",
            "3.....3",
            ".3...3.",
            "..3.3..",
            "...3..."]
    s = Spr(7, 6)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            s.put(x, y, c)
    if full:
        for y, r in enumerate(rows):
            for x, c in enumerate(r):
                if c == '1':
                    s.put(x, y, '2')
        s.put(1, 1, '1')
    return s


def from_rows(rows):
    s = Spr(max(len(r) for r in rows), len(rows))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            s.put(x, y, c)
    return s


HATS = {
    'hat_beanie': ["...333...", "..32223..", ".3222223.", "322222223", "333333333", "313131313", "333333333"],
    'hat_top':    ["..33333..", "..32223..", "..32223..", "..32223..", "..33333..", "..31113..", "333333333", "322222223", "333333333"],
    'hat_prop':   ["33.....33", ".3333333.", "....3....", "...333...", "..32123..", ".3222223.", "333333333", "322222223"],
    'hat_party':  ["....3....", "...313...", "...323...", "..31213..", "..32123..", ".3121213.", ".3212123.", "333333333"],
}

MISC = {
    'zz':      ["3333", "..3.", ".3..", "3333"],
    'note':    ["..33", "..3.", "..3.", "333.", "333."],
    'bang':    ["33", "33", "33", "33", "..", "33", "33"],
    'quest':   [".333.", "3...3", "...3.", "..3..", ".....", "..3..", "..3.."],
    'drop':    ["..3..", ".313.", "31113", ".333."],
    'speck':   ["3"],
    'bubble':  [".33.", "3..3", "3..3", ".33."],
    'sat_tag': ["...3.", "...3.", "3333.", "3oo3.", "3333."],
    'tag':     ["oo", "oo", "o3"],
    'check':   ["......3", ".....33", "3...33.", "33.33..", ".333...", "..3...."],
    'cross':   ["3....3", ".3..3.", "..33..", "..33..", ".3..3.", "3....3"],
    'dog':     ["33.....33", "323333323", "322222223", "32322232.", ".3222223.", ".3220223.", "..32223..", "...333..."],
    'cursor_down': ["33333", ".333.", "..3.."],
    'strap_loose': ["33333333333", "3.........3", "33333333333"],
    'chunk': ["33", "31"],
    'wave1': ["..33....33..", "33..3333..33"],
    'arrow_r': ["3...", "33..", "333.", "3333", "333.", "33..", "3..."],
    # pixel item icons for the entanglement chart (each 7x6)
    'ico_strap':  ["3333333", "3.....3", "3.333.3", "3.....3", "3333333", "......."],
    'ico_rubber': [".33333.", "3.....3", "3.....3", "3.....3", ".33333.", "......."],
    'ico_net':    ["3.3.3.3", ".3.3.3.", "3.3.3.3", ".3.3.3.", "3.3.3.3", "......."],
    'ico_rope':   ["33....3", "..3..3.", "...33..", "..3..3.", "33....3", "......."],
    'ico_line':   ["3......", ".3.....", "..3....", "...3..3", "....33.", "......."],
}


# ---------------------------------------------------------------- tiny font (3x5) for numbers & a few symbols
FONT = {
    '0': ["333", "3.3", "3.3", "3.3", "333"], '1': [".3.", "33.", ".3.", ".3.", "333"],
    '2': ["333", "..3", "333", "3..", "333"], '3': ["333", "..3", ".33", "..3", "333"],
    '4': ["3.3", "3.3", "333", "..3", "..3"], '5': ["333", "3..", "333", "..3", "333"],
    '6': ["333", "3..", "333", "3.3", "333"], '7': ["333", "..3", ".3.", ".3.", ".3."],
    '8': ["333", "3.3", "333", "3.3", "333"], '9': ["333", "3.3", "333", "..3", "333"],
    '%': ["3.3", "..3", ".3.", "3..", "3.3"], '.': ["...", "...", "...", "...", ".3."],
    ',': ["...", "...", "...", ".3.", "3.."], 'x': ["...", "3.3", ".3.", "3.3", "..."],
    '/': ["..3", "..3", ".3.", "3..", "3.."], '-': ["...", "...", "333", "...", "..."],
    '+': ["...", ".3.", "333", ".3.", "..."], ':': ["...", ".3.", "...", ".3.", "..."],
    ' ': ["...", "...", "...", "...", "..."], 'm': ["...", "33.", "333", "3.3", "3.3"],
    's': ["...", ".33", ".3.", "..3", "33."], '~': ["...", ".3.", "3.3", "..."[:3], "..."],
    '?': ["333", "..3", ".33", "...", ".3."], '!': [".3.", ".3.", ".3.", "...", ".3."],
    '=': ["...", "333", "...", "333", "..."],
}
FONT['~'] = ["...", "33.", "3.3", "..3", "..."]
# æ for the bark bubble (5 wide)
FONT_WIDE = {'æ': ["33.33", "..3.3", "33333", "3.3..", "33.33"]}


def build_all():
    S = {}
    S.update(build_v2())          # the hero pup + handstand (contour-based v2)
    S['lie0'] = lying('closed', 0)
    S['lie1'] = lying('closed', 1)
    S['lie_open'] = lying('open', 0)
    for i in range(4):
        S[f'swim{i}'] = swim(i)
        S[f'float{i}'] = float_flipper(i)
        S[f'fur{i}'] = furseal(i)
    S['mom'] = mom_head()
    S['mom_call'] = mom_head(mouth='open', eye='closed')
    S['mom_blink'] = mom_head(eye='closed')
    S['fish_s0'] = fish(False, 0); S['fish_s1'] = fish(False, 1)
    S['fish_b0'] = fish(True, 0); S['fish_b1'] = fish(True, 1)
    S['ball'] = ball()
    S['scis_open'] = scissors(True); S['scis_shut'] = scissors(False)
    S['sun'] = sun()
    S['heart'] = heart(True); S['heart_empty'] = heart(False)
    for k, v in HATS.items():
        S[k] = from_rows(v)
    for k, v in MISC.items():
        S[k] = from_rows(v)
    return S


def preview(S, path, scale=6, cols=6):
    names = list(S.keys())
    cell_w = max(s.w for s in S.values()) + 4
    cell_h = max(s.h for s in S.values()) + 10
    rows = (len(names) + cols - 1) // cols
    img = Image.new('RGB', (cols * cell_w * scale, rows * cell_h * scale), (30, 34, 60))
    d = ImageDraw.Draw(img)
    for i, n in enumerate(names):
        s = S[n]
        cx = (i % cols) * cell_w * scale
        cy = (i // cols) * cell_h * scale
        d.rectangle([cx + scale, cy + scale, cx + (s.w + 3) * scale, cy + (s.h + 3) * scale], fill=LCD['0'])
        for y in range(s.h):
            for x in range(s.w):
                c = s.g[y][x]
                if c != '.':
                    X = cx + (x + 2) * scale; Y = cy + (y + 2) * scale
                    d.rectangle([X, Y, X + scale - 1, Y + scale - 1], fill=LCD[c])
        d.text((cx + scale, cy + (s.h + 4) * scale), n, fill=(230, 230, 230))
    img.save(path)


def write_js(S, path):
    out = ["/* GENERATED by tools/spritelab.py — then hand-editable.",
           "   '.' transparent · '0' LCD paper · '1' light · '2' mid · '3' ink · 'o' rescue orange */",
           "window.SP = window.SP || {};",
           "SP.SPRITES = {"]
    for k, s in S.items():
        out.append(f"  {k}: [")
        for r in s.rows():
            out.append(f"    \"{r}\",")
        out.append("  ],")
    out.append("};")
    out.append("SP.FONT = " + json.dumps(FONT) + ";")
    out.append("SP.FONT_WIDE = " + json.dumps(FONT_WIDE, ensure_ascii=False) + ";")
    open(path, 'w', encoding='utf-8').write('\n'.join(out) + '\n')


# ================================================================ v2: hand-placed contours
HEAD_POLY = [(22.5,1.4),(26,1.2),(28.4,2.4),(29.8,4.2),(30.8,5.8),(32.4,6.4),(33.6,7.6),(33.6,9.2),(32.6,10.4),(30.4,11.2),
             (28.2,12.4),(25.6,13.4),(21.6,13.4),(18.8,11.4),(18.4,8.0),(19.2,4.4),(20.8,2.2)]
BODY_POLY = [(27.2,11.5),(27.6,13.5),(28.4,16),(28.2,19),(27.2,22),(26.0,25),(25.2,28.6),(12,29),(7.6,28.8),
             (4.6,27.8),(3.6,26.2),(4.6,24.4),(6.6,22.4),(9.2,20.4),(12.2,18.6),(15.0,16.8),(17.2,15.0),(18.4,13.0),(19.4,10),(24,10.5)]
LIGHT_POLY = [(27.6,12.8),(28.4,16),(28,19),(27,22),(26,25),(25.4,28.6),(17,28.8),(18.6,25),(21,21.6),(23.4,17.6),(25.2,14.2)]


def pup2(head_rot=0.0, head_dy=0, mouth='closed', eye='open', flipper='down', hind='rest', gulp=False, body_dy=0,
         W=36, H=30, blush=False):
    s = Spr(W, H)
    by = body_dy
    piv = (23.0, 12.5 + by)

    def T(x, y):  # head transform
        X, Y = rp(x, y + by, -head_rot, *piv)
        return X, Y + head_dy

    bpoly = [(x, y + by) for x, y in BODY_POLY]
    hpoly = [T(x, y) for x, y in HEAD_POLY]
    if mouth == 'open':
        # drop the jaw a little: insert lower jaw points
        hpoly = [T(x, y) for x, y in HEAD_POLY[:9]] + [T(32.6, 12.6), T(30.0, 13.0)] + [T(x, y) for x, y in HEAD_POLY[10:]]

    # hind flippers (behind)
    if hind == 'rest':
        hf = s.mask_poly([(9,25.6+by),(3.4,26.8+by),(0.2,28.2+by),(0.6,29.6),(8,29.6),(11,28.2+by)])
    elif hind == 'walk2':
        hf = s.mask_poly([(9,25.6+by),(4.6,27.6+by),(3.4,29.6),(10,29.6),(12,28+by)])
    else:  # scratch: flipper reaches up behind the neck
        hf = s.mask_poly([(9,24+by),(12.6,18+by),(16.2,12.2+by),(18.4,12.8+by),(15.6,19+by),(12.4,25.6+by)])
        hf2 = s.mask_poly([(8,26+by),(3.4,27+by),(0.4,28.6+by),(0.8,29.6),(8,29.6),(10.6,28.2+by)])
        s.part(hf2, '3', '3')
    s.part(hf, '3', '3')
    if hind == 'scratch':
        s.fill(s.mask_poly([(9,24+by),(12.6,18+by),(16.2,12.2+by),(18.4,12.8+by),(15.6,19+by),(12.4,25.6+by)]), '3')

    body = s.mask_poly(bpoly)
    head = s.mask_poly(hpoly)
    sil = body | head
    s.fill(sil, '2')
    # light belly / chest / throat
    light = s.mask_poly([(x, y + by) for x, y in LIGHT_POLY]) & body
    s.fill(light, '1')
    # light muzzle + cheek
    mc = T(30.6, 10.0)
    muz = s.mask_ellipse(mc[0], mc[1], 3.2, 1.6, rot=-head_rot) & head
    s.fill(muz, '1')
    ch = T(27.6, 11.2)
    cheek = s.mask_ellipse(ch[0], ch[1], 2.4, 1.4, rot=-head_rot) & head
    s.fill(cheek, '1')
    # back: gritty dither band hugging the top-left outline
    for (x, y) in sil:
        if s.get(x, y) == '2':
            near_top = (x, y - 1) not in sil or (x, y - 2) not in sil
            near_left = (x - 1, y) not in sil or (x - 2, y) not in sil
            if (near_top or near_left) and (x + y) % 2 == 0 and y % 2 == 0 and y > 13 + by:
                s.put(x, y, '3')
    # crown highlight
    s.outline_mask(sil, '3')
    # internal hint line between head and chest (jaw), only a short stroke under the chin
    j0 = T(26.4, 13.0); j1 = T(28.4, 12.4)
    s.line(j0[0], j0[1], j1[0], j1[1], '3') if mouth != 'open' else None

    # ear
    e = [T(21.0, 6.0), T(21.0, 7.0), T(20.0, 7.0)]
    for (x, y) in e:
        s.put(x, y, '3')
    # eye
    ex, ey = T(25.2, 5.2)
    ex, ey = int(round(ex)), int(round(ey))
    if eye in ('open', 'wide'):
        for dx in (0, 1):
            for dy in (0, 1, 2):
                s.put(ex + dx, ey + dy, '3')
        s.put(ex, ey, '0')
        if eye == 'wide':
            s.put(ex + 1, ey + 2, '0')
    elif eye == 'closed':
        s.put(ex - 1, ey + 1, '3'); s.put(ex, ey + 2, '3'); s.put(ex + 1, ey + 2, '3'); s.put(ex + 2, ey + 1, '3')
    elif eye == 'happy':
        s.put(ex - 1, ey + 2, '3'); s.put(ex, ey + 1, '3'); s.put(ex + 1, ey + 1, '3'); s.put(ex + 2, ey + 2, '3')
    elif eye == 'sad':
        s.put(ex - 1, ey, '3'); s.put(ex, ey + 1, '3'); s.put(ex + 1, ey + 1, '3'); s.put(ex, ey + 2, '3'); s.put(ex + 1, ey + 2, '3')
    # nose
    for (x, y) in (T(33.0, 7.8), T(33.0, 8.8)):
        s.put(x, y, '3')
    # mouth
    if mouth == 'closed':
        for (x, y) in (T(30.0, 10.8), T(31.0, 10.8), T(32.0, 10.2)):
            s.put(x, y, '3')
    else:
        m = s.mask_poly([T(29.4, 10.6), T(33.6, 10.0), T(32.6, 12.2), T(30.2, 12.2)])
        s.fill(m, '3')
        tx, ty = T(31.4, 11.4)
        s.put(tx, ty, '2')
    # whisker dots
    for (wx, wy) in ((30.4, 9.4), (31.6, 9.8), (29.6, 10.0)):
        X, Y = T(wx, wy)
        if s.get(X, Y) == '1':
            s.put(X, Y, '0')
    if blush:
        X, Y = T(27.6, 10.4)
        s.put(X, Y, '2')
    if gulp:
        g = s.mask_ellipse(25.8, 14.4 + by, 2.0, 1.8)
        s.part(g, '1', '3')

    # front flipper
    if flipper == 'down':
        fp = [(22,16.4),(26.2,15.6),(28.8,20),(31.2,24.4),(34.6,28.2),(34.2,29.6),(27,29.6),(25.6,26),(23.2,21.4)]
    elif flipper == 'fwd':
        fp = [(22,16.4),(26.2,15.4),(31,18.4),(35.4,21.6),(35.4,23.4),(30,23.0),(24.6,21.2)]
    elif flipper == 'back':
        fp = [(21.4,16.4),(25.6,15.8),(26.2,21),(25.8,26),(26.4,29.6),(20.6,29.6),(21.6,25.6),(21.2,21)]
    else:  # 'up' waving
        fp = [(22,17),(26,15.6),(31,14.0),(35.4,12.2),(35.8,14.2),(30.6,17.2),(26.4,19.8)]
    fp = [(x, y + by) for x, y in fp]
    ff = s.mask_poly(fp)
    s.part(ff, '3', '3')
    # flipper highlight: second pixel from the leading edge
    for (x, y) in ff:
        if (x + 1, y) not in ff and (x - 1, y) in ff and (x - 2, y) in ff and y % 1 == 0:
            s.put(x - 1, y, '2')
    return s


def handstand2(frame=0):
    """circus-style flipper stand: upside down, front flippers splayed on the ground, face to viewer-right"""
    s = Spr(30, 36)
    w = (0, 1, 0, -1)[frame % 4]
    # body: from shoulders (bottom) up to hips (top), slight banana curve
    body = s.mask_poly([(10,27),(11,20),(12+w*0.5,13),(13+w,7),(16+w,4.6),(19+w,6.6),(19.4+w*0.5,13),(19,20),(19.6,27)])
    # hind flippers V at top
    h1 = s.mask_poly([(13.6+w,7),(8.6+w*1.5,1.2),(10.6+w*1.5,0.2),(16+w,5.4)])
    h2 = s.mask_poly([(15.6+w,5.2),(21.6+w*1.5,0.4),(23+w*1.5,2.0),(18.6+w,7.4)])
    s.part(h1, '3', '3'); s.part(h2, '3', '3')
    s.fill(body, '2')
    lt = s.mask_poly([(15.8,27),(16.4,20),(16.6+w*0.5,12),(17.6+w,7),(19+w,7.4),(19.2+w*0.5,13),(18.8,20),(19.2,27)]) & body
    s.fill(lt, '1')
    for (x, y) in body:
        if s.get(x, y) == '2' and (x - 1, y) not in body and (x + y) % 2 == 0:
            pass
    # head between the flippers, facing right
    head = union(s.mask_ellipse(15.6, 27.6, 5.6, 4.4), s.mask_ellipse(21.2, 29.0, 3.4, 2.2))
    sil = body | head
    s.fill(head, '2')
    face = s.mask_ellipse(20.6, 29.6, 3.4, 1.6) & head
    s.fill(face, '1')
    s.outline_mask(sil, '3')
    # eye, ear, nose, mouth
    for dx in (0, 1):
        for dy in (0, 1, 2):
            s.put(17 + dx, 25 + dy, '3')
    s.put(17, 25, '0')
    s.put(13, 26, '3'); s.put(13, 27, '3')
    s.put(24, 28, '3'); s.put(24, 29, '3')
    s.line(21, 30, 23, 30, '3')
    s.put(21, 29, '0')
    # front flippers splayed on the ground
    f1 = s.mask_poly([(11.6,28.4),(14,30.4),(10.6,33.4),(5.4,35.6),(4.4,35.6),(7.6,32.0)])
    f2 = s.mask_poly([(17.4,31.2),(20,31.4),(23.6,33.2),(27.6,35.6),(19.6,35.6),(17.8,33.2)])
    s.part(f1, '3', '3'); s.part(f2, '3', '3')
    return s


def build_v2():
    S = {}
    S['pup_idle0'] = pup2()
    S['pup_idle1'] = pup2(head_dy=1)
    S['pup_blink'] = pup2(eye='closed')
    S['pup_happy'] = pup2(eye='happy', mouth='open', head_rot=0.16)
    S['pup_bark0'] = pup2(head_rot=0.42, mouth='open', eye='closed')
    S['pup_bark1'] = pup2(head_rot=0.32, mouth='closed')
    S['pup_open'] = pup2(head_rot=0.10, mouth='open')
    S['pup_gulp'] = pup2(head_rot=0.30, gulp=True, eye='closed')
    S['pup_shakeL'] = pup2(head_rot=-0.34, mouth='open', eye='closed')
    S['pup_shakeR'] = pup2(head_rot=0.46, mouth='open', eye='closed')
    S['pup_sniff'] = pup2(head_rot=-0.22, head_dy=1, flipper='fwd')
    S['pup_scratch0'] = pup2(hind='scratch', eye='closed', head_rot=0.14)
    S['pup_scratch1'] = pup2(hind='scratch', eye='happy', head_rot=0.22, head_dy=-1)
    S['pup_walk0'] = pup2(flipper='fwd')
    S['pup_walk1'] = pup2(flipper='back', hind='walk2', body_dy=1, head_dy=0)
    S['pup_sad'] = pup2(head_rot=-0.32, eye='sad', head_dy=1)
    S['pup_wide'] = pup2(eye='wide', head_rot=0.05)
    S['pup_up'] = pup2(flipper='up', head_rot=0.20, eye='happy')
    S['pup_fan'] = pup2(flipper='fwd', head_rot=0.28, eye='closed', mouth='open')
    for i in range(4):
        S[f'stand{i}'] = handstand2(i)
    return S


if __name__ == '__main__':
    S = build_all()
    preview(S, sys.argv[1] if len(sys.argv) > 1 else '/home/claude/tools/sheet.png')
    if len(sys.argv) > 2:
        write_js(S, sys.argv[2])
    print(len(S), 'sprites')


