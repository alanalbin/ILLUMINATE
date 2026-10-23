import { NextResponse } from 'next/server';
import galleryData from '@/data/gallery-faces.json';
import { matchFaceAgainstGallery, GalleryPhotoItem } from '@/lib/gallery/face-matcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    totalPhotos: galleryData.totalPhotos,
    totalFaces: galleryData.totalFaces,
    photos: galleryData.photos,
    categories: [
      'All Photos',
      'Keynote & Stage',
      'Speakers & Mentors',
      'Interactive Sessions',
      'Audience & Teams',
    ],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descriptor, queryText, threshold } = body;

    const photos = galleryData.photos as GalleryPhotoItem[];

    // 1. Biometric Face Match
    if (descriptor && Array.isArray(descriptor) && descriptor.length > 0) {
      const minThreshold = typeof threshold === 'number' ? threshold : 0.65;
      const matches = matchFaceAgainstGallery(descriptor, photos, minThreshold);

      return NextResponse.json({
        success: true,
        type: 'face',
        totalMatches: matches.length,
        matches,
      });
    }

    // 2. OCR / Text Query Match
    if (queryText && typeof queryText === 'string') {
      const q = queryText.trim().toLowerCase();
      const filtered = photos.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        return nameMatch || catMatch;
      });

      return NextResponse.json({
        success: true,
        type: 'ocr',
        totalMatches: filtered.length,
        photos: filtered,
      });
    }

    return NextResponse.json(
      { error: 'Provide a facial descriptor array or queryText' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
