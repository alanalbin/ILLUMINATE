'use client';

import React, { useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface TouchRippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
}

export default function TouchRippleButton({
  children,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  onClick,
  ...props
}: TouchRippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const newRipple: Ripple = { x, y, size, id: Date.now() + Math.random() };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      {...props}
      onPointerDown={createRipple}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer select-none transition-transform active:scale-[0.97] ${className}`}
    >
      {children}

      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full animate-ripple"
          style={{
            top: ripple.y - ripple.size / 2,
            left: ripple.x - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: rippleColor,
          }}
        />
      ))}
    </button>
  );
}
