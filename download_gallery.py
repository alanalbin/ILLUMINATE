import os
import json
import urllib.request
import time

os.makedirs('public/gallery', exist_ok=True)
os.makedirs('public/gallery/thumbs', exist_ok=True)

with open('src/data/gallery-photos.json') as f:
    photos = json.load(f)

print(f"Downloading {len(photos)} photos to public/gallery/...")

updated_photos = []

for i, p in enumerate(photos):
    fname = p['name']
    base, ext = os.path.splitext(fname)
    local_thumb = f"public/gallery/thumbs/{base}.jpg"
    local_full = f"public/gallery/{base}.jpg"
    
    # Download thumb (w=600)
    if not os.path.exists(local_thumb):
        try:
            req = urllib.request.Request(p['thumb'], headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=10).read()
            with open(local_thumb, 'wb') as f:
                f.write(data)
        except Exception as e:
            print(f"Failed thumb {fname}: {e}")
            
    # Download full (w=1600)
    if not os.path.exists(local_full):
        try:
            req = urllib.request.Request(p['url'], headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=10).read()
            with open(local_full, 'wb') as f:
                f.write(data)
        except Exception as e:
            print(f"Failed full {fname}: {e}")
            
    updated_photos.append({
        "id": p['id'],
        "name": fname,
        "src": f"/gallery/{base}.jpg",
        "thumb": f"/gallery/thumbs/{base}.jpg",
        "driveUrl": p['url'],
        "driveThumb": p['thumb']
    })
    if (i+1) % 10 == 0:
        print(f"Progress: {i+1}/{len(photos)}")

with open('src/data/gallery-photos.json', 'w') as f:
    json.dump(updated_photos, f, indent=2)

print("Finished downloading all gallery photos!")
