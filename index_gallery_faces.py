import os
import json
import cv2
import numpy as np

# Load photos
with open('src/data/gallery-photos.json', 'r', encoding='utf-8') as f:
    photos = json.load(f)

# Load OpenCV cascades
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

def extract_face_descriptor(face_crop):
    """Extract a 128-dimensional normalized facial descriptor vector."""
    resized = cv2.resize(face_crop, (64, 64))
    if len(resized.shape) == 3:
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    else:
        gray = resized
    
    # 1. 32-bin intensity histogram
    hist = cv2.calcHist([gray], [0], None, [32], [0, 256]).flatten()
    hist = hist / (np.linalg.norm(hist) + 1e-6)
    
    # 2. 8x8 cell grid averages (64 dimensions)
    grid_means = []
    for r in range(0, 64, 8):
        for c in range(0, 64, 8):
            cell = gray[r:r+8, c:c+8]
            grid_means.append(np.mean(cell))
    grid_means = np.array(grid_means)
    grid_means = grid_means / (np.linalg.norm(grid_means) + 1e-6)
    
    # 3. Sobel edge gradients (32 dimensions)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    mag, angle = cv2.cartToPolar(sobelx, sobely, angleInDegrees=True)
    grad_hist, _ = np.histogram(angle, bins=32, range=(0, 360), weights=mag)
    grad_hist = grad_hist / (np.linalg.norm(grad_hist) + 1e-6)
    
    # Combine (32 + 64 + 32 = 128 dimensions)
    desc = np.concatenate([hist * 0.3, grid_means * 0.4, grad_hist * 0.3])
    desc = desc / (np.linalg.norm(desc) + 1e-6)
    return [round(float(v), 5) for v in desc]

indexed_photos = []
total_faces_found = 0

for p in photos:
    # Look in public/gallery/...
    rel_path = p['src'].lstrip('/')
    img_path = os.path.join('public', rel_path)
    if not os.path.exists(img_path):
        rel_thumb = p['thumb'].lstrip('/')
        img_path = os.path.join('public', rel_thumb)
    
    img = cv2.imread(img_path)
    if img is None:
        print(f"Cannot read: {img_path}")
        continue
        
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect frontal faces
    faces = list(face_cascade.detectMultiScale(gray, scaleFactor=1.06, minNeighbors=3, minSize=(25, 25)))
    
    # Also profile faces
    if len(faces) < 3:
        profiles = profile_cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=3, minSize=(25, 25))
        for pf in profiles:
            px, py, pw, ph = pf
            overlap = False
            for (fx, fy, fw, fh) in faces:
                if abs(px - fx) < 40 and abs(py - fy) < 40:
                    overlap = True
                    break
            if not overlap:
                faces.append(pf)
                
    face_data = []
    for (x, y, fw, fh) in faces:
        margin_x = int(fw * 0.1)
        margin_y = int(fh * 0.1)
        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(w, x + fw + margin_x)
        y2 = min(h, y + fh + margin_y)
        crop = img[y1:y2, x1:x2]
        
        if crop.size > 0:
            descriptor = extract_face_descriptor(crop)
            face_data.append({
                "box": [round(float(x) / w, 4), round(float(y) / h, 4), round(float(fw) / w, 4), round(float(fh) / h, 4)],
                "descriptor": descriptor
            })
            total_faces_found += 1
            
    fc = len(faces)
    if fc == 0:
        category = "Keynote & Stage"
    elif fc == 1:
        category = "Speakers & Mentors"
    elif fc in [2, 3, 4]:
        category = "Interactive Sessions"
    else:
        category = "Audience & Teams"
        
    indexed_photos.append({
        "id": p['id'],
        "name": p['name'],
        "src": p['src'],
        "thumb": p['thumb'],
        "driveUrl": p['driveUrl'],
        "driveThumb": p['driveThumb'],
        "category": category,
        "faceCount": len(faces),
        "faces": face_data,
        "width": w,
        "height": h
    })

print(f"Indexed {len(indexed_photos)} photos. Total faces indexed: {total_faces_found}")

with open('src/data/gallery-faces.json', 'w', encoding='utf-8') as f:
    json.dump({
        "version": "1.0",
        "totalPhotos": len(indexed_photos),
        "totalFaces": total_faces_found,
        "photos": indexed_photos
    }, f, indent=2)

print("Saved face index to src/data/gallery-faces.json!")
