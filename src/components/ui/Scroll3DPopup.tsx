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
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Measure scroll progress through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Desktop uses a silky spring for fluid inertia; mobile uses direct GPU scroll progression for zero-latency response
  const desktopSpring = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.65,
    restDelta: 0.001,
  });

  const activeProgress = isMobile ? scrollYProgress : desktopSpring;

  // Punchy 3D Scroll Pop-Up: elements emerge dynamically from depth, pop up into crisp focus, stay stable, and gracefully recede
  const scrollRotateX = useTransform(
    activeProgress,
    [0, 0.18, 0.82, 1],
    [isMobile ? 6 : rotateX, 0, 0, isMobile ? -2 : -4]
  );

  const scrollScale = useTransform(
    activeProgress,
    [0, 0.18, 0.82, 1],
    [isMobile ? 0.92 : 0.87, 1, 1, isMobile ? 0.98 : 0.96]
  );

  const scrollOpacity = useTransform(
    activeProgress,
    [0, 0.14, 0.86, 1],
    [isMobile ? 0.45 : 0.25, 1, 1, isMobile ? 0.9 : 0.85]
  );

  const scrollY = useTransform(
    activeProgress,
    [0, 0.18, 0.82, 1],
    [isMobile ? 32 : 55, 0, 0, isMobile ? -10 : -18]
  );

  const scrollZ = useTransform(
    activeProgress,
    [0, 0.18, 0.82, 1],
    [isMobile ? -30 : -75, 0, 0, isMobile ? -10 : -20]
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: isMobile ? 850 : 1250,
        perspectiveOrigin: '50% 38%',
      }}
    >
      <motion.div
        style={{
          rotateX: enableContinuous3D ? scrollRotateX : 0,
          scale: enableContinuous3D ? scrollScale : 1,
          opacity: enableContinuous3D ? scrollOpacity : 1,
          y: enableContinuous3D ? scrollY : 0,
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
          transformOrigin: '50% 50%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
