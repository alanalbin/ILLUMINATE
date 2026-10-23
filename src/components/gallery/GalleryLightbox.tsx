'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  ExternalLink,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { GalleryPhotoItem } from '@/lib/gallery/face-matcher';

interface GalleryLightboxProps {
  photo: GalleryPhotoItem | null;
  allPhotos: GalleryPhotoItem[];
  onClose: () => void;
  onSelectPhoto: (photo: GalleryPhotoItem) => void;
}

export default function GalleryLightbox({
  photo,
  allPhotos,
  onClose,
  onSelectPhoto,
}: GalleryLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showFaceBoxes, setShowFaceBoxes] = useState<boolean>(true);

  const currentIndex = photo
    ? allPhotos.findIndex((p) => p.id === photo.id)
    : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setZoomLevel(1);
      onSelectPhoto(allPhotos[currentIndex - 1]);
    } else if (allPhotos.length > 0) {
      setZoomLevel(1);
      onSelectPhoto(allPhotos[allPhotos.length - 1]);
    }
  }, [currentIndex, allPhotos, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < allPhotos.length - 1) {
      setZoomLevel(1);
      onSelectPhoto(allPhotos[currentIndex + 1]);
    } else if (allPhotos.length > 0) {
      setZoomLevel(1);
      onSelectPhoto(allPhotos[0]);
    }
  }, [currentIndex, allPhotos, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onClose, handlePrev, handleNext]);

  if (!photo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `ILLUMINATE_${photo.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none">
        
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-purple-400 bg-purple-950/80 border border-purple-800/40 px-3 py-1 rounded-full">
              {currentIndex + 1} / {allPhotos.length}
            </span>
            <span className="text-sm font-bold text-white hidden sm:inline">
              {photo.name}
            </span>
            <span className="text-xs text-zinc-400 hidden md:inline">
              • {photo.category}
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Face Box Toggle */}
            {photo.faceCount > 0 && (
              <button
                onClick={() => setShowFaceBoxes(!showFaceBoxes)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  showFaceBoxes
                    ? 'bg-purple-900/60 border-purple-500/60 text-purple-200'
                    : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white'
                }`}
                title="Toggle Face Detection Outlines"
              >
                {showFaceBoxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {photo.faceCount} Face{photo.faceCount > 1 ? 's' : ''}
                </span>
              </button>
            )}

            {/* Zoom In / Out */}
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.3))}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Download High-Res Photo"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download HD</span>
            </button>

            {/* External Drive Link */}
            <a
              href={photo.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Open Original in Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.15] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-6 z-50 p-3 rounded-2xl bg-black/50 border border-white/[0.1] text-white hover:bg-purple-900/40 hover:border-purple-500/50 backdrop-blur-md transition-all cursor-pointer"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-6 z-50 p-3 rounded-2xl bg-black/50 border border-white/[0.1] text-white hover:bg-purple-900/40 hover:border-purple-500/50 backdrop-blur-md transition-all cursor-pointer"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main Photo Container */}
        <div className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-full max-w-full flex items-center justify-center"
          >
            <img
              src={photo.src}
              alt={photo.name}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/[0.08]"
            />

            {/* Face Bounding Box Overlays */}
            {showFaceBoxes &&
              photo.faces &&
              photo.faces.map((f, i) => {
                const [bx, by, bw, bh] = f.box;
                return (
                  <div
                    key={i}
                    style={{
                      left: `${bx * 100}%`,
                      top: `${by * 100}%`,
                      width: `${bw * 100}%`,
                      height: `${bh * 100}%`,
                    }}
                    className="absolute border-2 border-purple-400 rounded-md shadow-[0_0_12px_#a855f7] pointer-events-none group"
                  >
                    <span className="absolute -top-5 left-0 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-200 border border-purple-500/40 whitespace-nowrap">
                      Face #{i + 1}
                    </span>
                  </div>
                );
              })}
          </motion.div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center text-xs text-zinc-400 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4">
          <span>Google Drive Cloud Synced</span>
          <span>•</span>
          <span>Use Arrow keys to browse • Click Zoom to inspect details</span>
        </div>
      </div>
    </AnimatePresence>
  );
}
