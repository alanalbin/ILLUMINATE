import { describe, it, expect } from 'vitest';
import { cosineSimilarity, matchFaceAgainstGallery, GalleryPhotoItem } from '@/lib/gallery/face-matcher';
import galleryData from '@/data/gallery-faces.json';

describe('Gallery Face Matching & Biometric Algorithms', () => {
  it('correctly calculates identical vector cosine similarity as 1.0', () => {
    const v1 = [0.1, 0.5, 0.8, 0.2];
    expect(cosineSimilarity(v1, v1)).toBeCloseTo(1.0, 4);
  });

  it('correctly calculates orthogonal vector cosine similarity as 0.0', () => {
    const v1 = [1, 0, 0];
    const v2 = [0, 1, 0];
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(0.0, 4);
  });

  it('indexes all 43 event photos from Google Drive', () => {
    expect(galleryData.totalPhotos).toBe(43);
    expect(galleryData.photos.length).toBe(43);
  });

  it('indexes over 250 facial landmarks across photos', () => {
    expect(galleryData.totalFaces).toBeGreaterThan(250);
  });

  it('matches a known face against gallery with top rank', () => {
    const photos = galleryData.photos as GalleryPhotoItem[];
    const photoWithFace = photos.find((p) => p.faces && p.faces.length > 0);
    expect(photoWithFace).toBeDefined();

    if (photoWithFace && photoWithFace.faces.length > 0) {
      const targetDescriptor = photoWithFace.faces[0].descriptor;
      const matches = matchFaceAgainstGallery(targetDescriptor, photos, 0.65);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].photo.id).toBe(photoWithFace.id);
      expect(matches[0].score).toBeCloseTo(1.0, 2);
    }
  });
});
