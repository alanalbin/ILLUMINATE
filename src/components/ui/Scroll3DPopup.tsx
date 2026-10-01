'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Scroll3DPopupProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  rotateX?: number;
}

export default function Scroll3DPopup({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  distance = 50,
  rotateX = 14,
}: Scroll3DPopupProps) {
  return (
    <div className={`overflow-hidden perspective-[1200px] ${className}`}>
      <motion.div
        initial={{
          opacity: 0,
          y: distance,
          scale: 0.92,
          rotateX: rotateX,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
        }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.22, 1, 0.36, 1], // Cubic bezier for snappy, tactile popup
        }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 100%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
