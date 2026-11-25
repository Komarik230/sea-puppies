import json, math
from PIL import Image, ImageDraw
MX, MY, MW, MH = 2, 2, 58, 92
LAT0, LAT1 = 58.0, 18.0
KY = MH / (LAT0 - LAT1)              # px per degree latitude
KX = KY * math.cos(math.radians(38))  # px per degree longitude (equirectangular, true at 38N)
LON0 = -136.0
def proj(lon, lat): return ((lon - LON0) * KX, (LAT0 - lat) * KY)
SS = 8
img = Image.new('L', (MW*SS, MH*SS), 0); d = ImageDraw.Draw(img)
gj = json.load(open('ne_50m_land.geojson'))
for f in gj['features']:
  g = f['geometry']; polys = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
  for poly in polys:
    lons=[q[0] for q in poly[0]]; lats=[q[1] for q in poly[0]]
    if max(lons)-min(lons) > 200 or max(lons) < -140 or min(lons) > -100 or max(lats) < 15 or min(lats) > 60: continue
    for k, ring in enumerate(poly):
      pts = [(proj(lon,lat)[0]*SS, proj(lon,lat)[1]*SS) for lon,lat in ring]
      if max(p[0] for p in pts) < 0 or min(p[0] for p in pts) > MW*SS: continue
      d.polygon(pts, fill=255 if k==0 else 0)
land = [[0]*MW for _ in range(MH)]
for y in range(MH):
  for x in range(MW):
    s = sum(img.getpixel((x*SS+i, y*SS+j)) for i in range(SS) for j in range(SS)) / (SS*SS*255)
    land[y][x] = 1 if s >= 0.5 else 0
rec = {}
tot_in = 0
for lon, lat, n in json.load(open('gbif_points.json')):
  x, y = proj(lon, lat); x, y = int(x), int(y)
  if 0 <= x < MW and 0 <= y < MH:
    rec[(x,y)] = rec.get((x,y),0) + n; tot_in += n
print('records inside map', round(tot_in), 'pixels', len(rec))
top = sorted(rec.items(), key=lambda kv: -kv[1])[:12]
for (x,y),n in top:
  print(f'  px({x},{y}) lat {LAT0 - (y+.5)/KY:.2f} lon {LON0 + (x+.5)/KX:.2f}: {n:.0f}')
lv = lambda n: 1 if n < 10 else 2
print('1-9:', sum(1 for n in rec.values() if n<10), ' 10+:', sum(1 for n in rec.values() if n>=10))
# breeding range bracket (NOAA): Channel Islands (~34.1N) to central Mexico; we draw 34.1N..~23N
out = {
  'x': MX, 'y': MY, 'w': MW, 'h': MH, 'lat0': LAT0, 'lat1': LAT1, 'lon0': LON0, 'kx': round(KX,4), 'ky': round(KY,4),
  'land': [''.join(str(v) for v in row) for row in land],
  'rec': [[x, y, lv(n)] for (x,y),n in sorted(rec.items())],
}
json.dump(out, open('map_lcd.json','w'))
# preview
P = {0:(167,179,148),1:(135,148,116),2:(91,102,79),3:(33,42,30)}
im = Image.new('RGB',(128,96),P[0])
for y in range(MH):
  for x in range(MW):
    if land[y][x]: im.putpixel((MX+x,MY+y),P[1])
for (x,y),n in rec.items(): im.putpixel((MX+x,MY+y),P[2] if n<10 else P[3])
im.resize((512,384),Image.NEAREST).save('map_preview.png')
