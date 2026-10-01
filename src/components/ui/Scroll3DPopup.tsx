'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Scroll3DPopupProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  rotateX?: number;
  enableContinuous3D?: boolean;
}

export default function Scroll3DPopup({
  children,
  className = '',
  rotateX = 10,
  enableContinuous3D = true,
}: Scroll3DPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure scroll progress through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Smooth out scroll progression using spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  });

  // Dynamic 3D perspective transformations mapped to scroll entry, focus, and departure
  const scrollRotateX = useTransform(
    smoothProgress,
    [0, 0.42, 0.58, 1],
    [14, 0, 0, -11]
  );
  const scrollScale = useTransform(
    smoothProgress,
    [0, 0.42, 0.58, 1],
    [0.92, 1, 1, 0.94]
  );
  const scrollOpacity = useTransform(
    smoothProgress,
    [0, 0.18, 0.82, 1],
    [0.45, 1, 1, 0.5]
  );
  const scrollY = useTransform(
    smoothProgress,
    [0, 0.45, 0.55, 1],
    [40, 0, 0, -30]
  );
  const scrollZ = useTransform(
    smoothProgress,
    [0, 0.42, 0.58, 1],
    [-80, 0, 0, -70]
  );

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{ perspective: 1100 }}
    >
      <motion.div
        style={{
          rotateX: enableContinuous3D ? scrollRotateX : 0,
          scale: enableContinuous3D ? scrollScale : 1,
          opacity: enableContinuous3D ? scrollOpacity : 1,
          y: enableContinuous3D ? scrollY : 0,
          z: enableContinuous3D ? scrollZ : 0,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
