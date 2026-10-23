import React from 'react';
import type { Metadata } from 'next';
import GallerySection from '@/components/gallery/GallerySection';

export const metadata: Metadata = {
  title: 'Gallery — ILLUMINATE | KMCT & E-Cell IIT Bombay',
  description:
    'Browse 43 high-resolution event photographs from the ILLUMINATE Workshop. Use our AI Biometric Face Scanner and OCR to find your moments instantly.',
};

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-16 flex flex-col relative bg-transparent overflow-x-hidden">
      <GallerySection id="gallery-page" />
    </div>
  );
}
