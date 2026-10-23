'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Sparkles,
  Search,
  Filter,
  Download,
  Maximize2,
  ExternalLink,
  Users,
  Camera,
  Layers,
  X,
  Check,
  FolderOpen
} from 'lucide-react';
import galleryData from '@/data/gallery-faces.json';
import { GalleryPhotoItem } from '@/lib/gallery/face-matcher';
import FaceScanModal from './FaceScanModal';
import GalleryLightbox from './GalleryLightbox';

const ALL_PHOTOS = (galleryData.photos || []) as GalleryPhotoItem[];

const CATEGORIES = [
  'All Photos',
  'Speakers & Mentors',
  'Interactive Sessions',
  'Audience & Teams',
  'Keynote & Stage',
];

interface GallerySectionProps {
  id?: string;
  initialPhotos?: GalleryPhotoItem[];
}

export default function GallerySection({ id = 'gallery', initialPhotos }: GallerySectionProps) {
  const photos = useMemo(() => initialPhotos || ALL_PHOTOS, [initialPhotos]);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('All Photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaceFilterIds, setActiveFaceFilterIds] = useState<string[] | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>('');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhotoItem | null>(null);

  // Filtered Photos calculation
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // 1. Face Scan Filter
      if (activeFaceFilterIds !== null) {
        if (!activeFaceFilterIds.includes(photo.id)) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'All Photos') {
        if (photo.category !== selectedCategory) return false;
      }

      // 3. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = photo.name.toLowerCase().includes(q);
        const matchCat = photo.category.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      return true;
    });
  }, [photos, activeFaceFilterIds, selectedCategory, searchQuery]);

  const handleApplyFilter = (matchedIds: string[], targetName?: string) => {
    setActiveFaceFilterIds(matchedIds);
    setFilterLabel(targetName || 'AI Biometric Face Scan');
    setSelectedCategory('All Photos');
    // Smooth scroll down to gallery
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilter = () => {
    setActiveFaceFilterIds(null);
    setFilterLabel('');
  };

  const handleDownload = (e: React.MouseEvent, photo: GalleryPhotoItem) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `ILLUMINATE_${photo.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id={id}
      className="py-24 bg-[#05030a]/60 backdrop-blur-[2px] border-t border-purple-950/40 relative z-10 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-indigo-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/80 border border-purple-800/40 px-4 py-1.5 rounded-full shadow-sm mb-4">
              <Camera className="w-3.5 h-3.5" />
              <span>Event Memories & Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Workshop Gallery
            </h2>
            <p className="mt-3 text-slate-300 text-base">
              Relive the energy, keynotes, and collaborative breakthroughs from the KMCT Kasaragod & E-Cell IIT Bombay workshop.
            </p>
          </div>

          {/* Find My Photos Action & Google Drive Link */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <Scan className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </div>
              <span>Find My Photos (AI Scan)</span>
              <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
            </button>

            <a
              href="https://drive.google.com/drive/folders/1-F9yn6bghrSUSUB5T-bNEz7S4TgTIBzF"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/40 hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
              title="Open Google Drive Cloud Folder"
            >
              <FolderOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Google Drive Folder</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-300" />
            </a>
          </div>
        </div>

        {/* Active AI Filter Indicator Banner */}
        <AnimatePresence>
          {activeFaceFilterIds !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4 shadow-lg shadow-emerald-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{filterLabel} Active</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {filteredPhotos.length} matches
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    Displaying only photographs matched to your scanned facial telemetry.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearFilter}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All Photos</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: Category Filters + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveFaceFilterIds(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat && activeFaceFilterIds === null
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat}
                {cat === 'All Photos' && (
                  <span className="ml-1.5 text-[10px] text-purple-300 font-mono">
                    ({photos.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search photos by title, speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Photo Count Status */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 font-mono">
          <span>
            Showing <strong className="text-white">{filteredPhotos.length}</strong> of{' '}
            {photos.length} photos
          </span>
          <span className="hidden sm:inline text-purple-400">
            296 faces biometric-indexed
          </span>
        </div>

        {/* Photo Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white/[0.01] border border-white/[0.06] p-8">
            <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No photos matched your criteria</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or reset the active filter to view all gallery images.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Photos');
                setSearchQuery('');
                setActiveFaceFilterIds(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => {
              const isMatch = activeFaceFilterIds !== null && activeFaceFilterIds.includes(photo.id);

              return (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(0.2, index * 0.03) }}
                  onClick={() => setLightboxPhoto(photo)}
                  className={`group relative rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-950 border transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/30 cursor-pointer ${
                    isMatch
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                      : 'border-white/[0.08] hover:border-purple-500/60'
                  }`}
                >
                  {/* Image */}
                  <img
                    src={photo.thumb}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {/* Category pill */}
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-300 border border-white/[0.1]">
                      {photo.category}
                    </span>

                    {/* AI Match badge or Face Count badge */}
                    {isMatch ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Match</span>
                      </span>
                    ) : photo.faceCount > 0 ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md text-purple-200 border border-purple-500/30 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        <span>{photo.faceCount}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Hover Content */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between transition-transform duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[170px] drop-shadow-md">
                        {photo.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        KMCT • IIT Bombay
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDownload(e, photo)}
                        className="p-1.5 rounded-lg bg-white/[0.1] hover:bg-purple-600 text-white backdrop-blur-md transition-colors"
                        title="Download HD Photo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 rounded-lg bg-white/[0.1] text-white backdrop-blur-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Face & OCR Scanner Modal */}
      <FaceScanModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        allPhotos={photos}
        onApplyFilter={handleApplyFilter}
      />

      {/* Lightbox Modal */}
      <GalleryLightbox
        photo={lightboxPhoto}
        allPhotos={filteredPhotos}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(p) => setLightboxPhoto(p)}
      />
    </section>
  );
}
