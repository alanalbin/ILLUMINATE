'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  rotateX = 5,
  enableContinuous3D = true,
}: Scroll3DPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Track scroll progression smoothly through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Critically-damped butter-smooth spring for ultra-fluid, zero-jitter 3D scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    mass: 0.35,
    restDelta: 0.0001,
  });

  const activeProgress = isMobile ? scrollYProgress : smoothProgress;

  // Ultra-smooth 3D depth emergence: subtle, elegant, and readable without jarring jumps
  const scrollRotateX = useTransform(
    activeProgress,
    [0, 0.22, 0.82, 1],
    [isMobile ? 2.5 : rotateX, 0, 0, isMobile ? -1 : -2]
  );

  const scrollScale = useTransform(
    activeProgress,
    [0, 0.22, 0.82, 1],
    [isMobile ? 0.96 : 0.94, 1, 1, isMobile ? 0.98 : 0.97]
  );

  const scrollOpacity = useTransform(
    activeProgress,
    [0, 0.18, 0.86, 1],
    [isMobile ? 0.65 : 0.45, 1, 1, isMobile ? 0.92 : 0.88]
  );

  const scrollY = useTransform(
    activeProgress,
    [0, 0.22, 0.82, 1],
    [isMobile ? 20 : 32, 0, 0, isMobile ? -6 : -12]
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: isMobile ? 950 : 1400,
        perspectiveOrigin: '50% 40%',
      }}
    >
      <motion.div
        style={{
          rotateX: enableContinuous3D ? scrollRotateX : 0,
          scale: enableContinuous3D ? scrollScale : 1,
          opacity: enableContinuous3D ? scrollOpacity : 1,
          y: enableContinuous3D ? scrollY : 0,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
