import re
import json

with open('drive_dump.html', encoding='utf-8') as f:
    html = f.read()

# Let's inspect all IMG_xxxx.JPG occurrences
img_matches = list(re.finditer(r'IMG_\d+\.JPG', html))
all_found = {}

for m in img_matches:
    fname = m.group(0)
    idx = m.start()
    window = html[max(0, idx-400): min(len(html), idx+400)]
    ssk_match = re.search(r'ssk=[\'"][^:\'"]*:[^:\'"]*:([a-zA-Z0-9_-]{28,35})', window)
    if ssk_match:
        fid = ssk_match.group(1).split('-')[0]
        if len(fid) >= 28:
            all_found[fname] = fid
            continue
            
    fids = re.findall(r'1[a-zA-Z0-9_-]{32}', window)
    if fids:
        all_found[fname] = fids[0]

all_names = set(re.findall(r'IMG_\d+\.JPG', html))
print(f"Total unique images mapped to drive ID: {len(all_found)}")
print(f"Total unique filenames in file: {len(all_names)}")

photo_list = []
for fname, fid in sorted(all_found.items()):
    photo_list.append({
        "id": fid,
        "name": fname,
        "url": f"https://lh3.googleusercontent.com/d/{fid}=s1600",
        "thumb": f"https://lh3.googleusercontent.com/d/{fid}=s600"
    })

with open("src/data/gallery-photos.json", "w", encoding="utf-8") as f:
    json.dump(photo_list, f, indent=2)

print(f"Wrote {len(photo_list)} photos to src/data/gallery-photos.json")
