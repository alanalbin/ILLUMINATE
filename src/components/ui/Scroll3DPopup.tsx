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

  // Measure scroll progress through the viewport (for desktop 3D continuous perspective)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Smooth out scroll progression using spring physics on desktop
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  });

  // Dynamic 3D perspective transformations for desktop
  const scrollRotateX = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [12, 0, 0, -3]
  );
  const scrollScale = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [0.94, 1, 1, 0.99]
  );
  const scrollOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [0.55, 1, 1, 0.95]
  );
  const scrollY = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [35, 0, 0, 0]
  );
  const scrollZ = useTransform(
    smoothProgress,
    [0, 0.38, 0.7, 1],
    [-60, 0, 0, -15]
  );

  // Mobile: Buttery-smooth, hardware-accelerated entrance with zero scroll latency
  if (isMobile) {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        <motion.div
          initial={{ opacity: 0.5, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // Desktop: Immersive continuous 3D scroll physics
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
