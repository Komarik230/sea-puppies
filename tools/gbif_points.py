import json, urllib.request, mapbox_vector_tile as mvt
Z=3; T=22.5; pts=[]
for x in range(1,4):
  for y in range(1,4):
    raw=urllib.request.urlopen(f"https://api.gbif.org/v2/map/occurrence/density/{Z}/{x}/{y}.mvt?srs=EPSG:4326&taxonKey=2433458",timeout=60).read()
    if not raw: continue
    for lname,layer in mvt.decode(raw).items():
      ext=layer.get('extent',4096)
      for f in layer['features']:
        g=f['geometry']; c=g['coordinates']
        if g['type']=='Point': px,py=c
        elif g['type']=='MultiPoint':
          for px,py in c:
            pts.append([-180+x*T+px/ext*T, 90-(y+1)*T+py/ext*T, f['properties'].get('total',0)/len(c)])
          continue
        else: continue
        pts.append([-180+x*T+px/ext*T, 90-(y+1)*T+py/ext*T, f['properties'].get('total',0)])
print(len(pts), sum(p[2] for p in pts))
json.dump(pts, open('gbif_points.json','w'))
