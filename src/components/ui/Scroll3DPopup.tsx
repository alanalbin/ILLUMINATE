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
  rotateX = 10,
  enableContinuous3D = true,
}: Scroll3DPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
        (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure scroll progress through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Smooth out scroll progression using spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: isMobile ? 120 : 90,
    damping: isMobile ? 26 : 22,
    restDelta: 0.001,
  });

  // Dynamic 3D perspective transformations mapped to scroll entry, focus, and departure
  const scrollRotateX = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [isMobile ? 0 : 12, 0, 0, isMobile ? 0 : -3]
  );
  const scrollScale = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [isMobile ? 0.98 : 0.94, 1, 1, 0.99]
  );
  const scrollOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [isMobile ? 0.75 : 0.55, 1, 1, 0.98]
  );
  const scrollY = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [isMobile ? 16 : 35, 0, 0, 0]
  );
  const scrollZ = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [isMobile ? 0 : -60, 0, 0, isMobile ? 0 : -15]
  );

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{ perspective: isMobile ? undefined : 1100 }}
    >
      <motion.div
        style={{
          rotateX: enableContinuous3D && !isMobile ? scrollRotateX : 0,
          scale: enableContinuous3D ? scrollScale : 1,
          opacity: enableContinuous3D ? scrollOpacity : 1,
          y: enableContinuous3D ? scrollY : 0,
          z: enableContinuous3D && !isMobile ? scrollZ : 0,
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
          transformOrigin: '50% 50%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
