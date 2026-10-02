'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface TouchInteractiveTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
}

export default function TouchInteractiveTilt({
  children,
  className = '',
  maxTilt = 12,
  glareOpacity = 0.25,
}: TouchInteractiveTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('none');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth < 768 ||
        'ontouchstart' in window);
    setIsTouchDevice(isTouch);
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isTouchDevice) return;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;

      const rotX = -normY * maxTilt;
      const rotY = normX * maxTilt;

      setTransform(
        `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
      );

      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: glareOpacity,
      });
    },
    [maxTilt, glareOpacity, isTouchDevice]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTouchDevice || e.pointerType === 'touch') return;
    setIsHovered(true);
    handleMove(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTransform('none');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: isTouchDevice ? 'none' : transform,
        transformStyle: isTouchDevice ? 'flat' : 'preserve-3d',
      }}
    >
      {children}

      {/* Dynamic Specular Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 overflow-hidden"
        style={{
          opacity: isHovered ? glarePosition.opacity : 0,
          background: `radial-gradient(circle 240px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.35), transparent 70%)`,
        }}
      />
    </div>
  );
}
