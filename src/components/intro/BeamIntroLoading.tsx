'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { X, Sparkles } from 'lucide-react';

interface BeamIntroLoadingProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export default function BeamIntroLoading({
  onComplete,
  forcePlay = true,
}: BeamIntroLoadingProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isWarpingOut, setIsWarpingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Background subtle starlight / cosmos canvas
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } catch {
      return;
    }

    // Soft ambient & purple point lights
    const ambient = new THREE.AmbientLight(0x130728, 1.2);
    scene.add(ambient);

    const purpleGlow = new THREE.PointLight(0xa855f7, 3, 100);
    purpleGlow.position.set(0, 0, 15);
    scene.add(purpleGlow);

    // Subtle drifting ambient starlight dust around the logo
    const starCount = 60;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 70;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      starVelocities[i] = 0.02 + Math.random() * 0.04;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0xc084fc,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Concentric celestial orbital ring around center
    const ringGeo = new THREE.TorusGeometry(12, 0.06, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    scene.add(ringMesh);

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      ringMesh.rotation.z = time * 0.15;
      ringMesh.rotation.y = Math.sin(time * 0.3) * 0.15;

      const positions = starGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += starVelocities[i];
        if (positions[i3 + 1] > 25) {
          positions[i3 + 1] = -25;
          positions[i3] = (Math.random() - 0.5) * 70;
        }
      }
      starGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [visible]);

  // Clean Progress Sequence (0 -> 100% in ~1.8s)
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 8) + 6;
        return Math.min(100, prev + delta);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [visible]);

  const warpingRef = useRef(isWarpingOut);
  warpingRef.current = isWarpingOut;

  useEffect(() => {
    if (progress >= 100 && !isWarpingOut) {
      const timer = setTimeout(() => {
        setIsWarpingOut(true);
        const exitTimer = setTimeout(() => {
          handleDismiss();
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [progress, isWarpingOut]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isWarpingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#05030a] text-white select-none overflow-hidden"
      >
        {/* Subtle Ambient Cosmic Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Ambient Radial Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.12) 0%, rgba(5, 3, 10, 0.75) 60%, #05030a 100%)',
          }}
        />

        {/* Soft Ambient Light Flare on Exit */}
        {isWarpingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-white/80 to-transparent z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Top Bar: Skip Button */}
        <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-end relative z-20">
          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="Skip Loading"
          >
            <span>Skip</span>
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Center: Illuminate Logo with Bright & Disbright (Pulsing Glow) Animation */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none my-auto">
          
          {/* Expanding Pulsing Halo Aura behind the logo */}
          <div className="relative flex items-center justify-center">
            
            {/* Outer Dispersal Ring 1 */}
            <motion.div
              animate={{
                scale: [0.85, 1.4, 1.7],
                opacity: [0.55, 0.25, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-purple-500/30 bg-purple-600/10 blur-[8px] pointer-events-none"
            />

            {/* Inner Glowing Core Aura */}
            <motion.div
              animate={{
                scale: [0.92, 1.15, 0.92],
                opacity: [0.35, 0.8, 0.35],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/25 to-cyan-400/20 blur-[50px] pointer-events-none"
            />

            {/* ILLUMINATE OFFICIAL LOGO — BRIGHT AND DISBRIGHT (PULSING) */}
            <motion.div
              animate={{
                opacity: [0.65, 1, 0.65],
                scale: [0.96, 1.04, 0.96],
                filter: [
                  'drop-shadow(0 0 14px rgba(147, 51, 234, 0.35)) brightness(0.72)',
                  'drop-shadow(0 0 38px rgba(192, 132, 252, 0.95)) drop-shadow(0 0 75px rgba(147, 51, 234, 0.7)) brightness(1.42)',
                  'drop-shadow(0 0 14px rgba(147, 51, 234, 0.35)) brightness(0.72)',
                ],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <img
                src="/logo.png"
                alt="ILLUMINATE"
                className="w-[280px] sm:w-[420px] max-w-[85vw] h-auto object-contain select-none"
              />
            </motion.div>

          </div>

          {/* Subtitle & Institutional Association */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 space-y-1.5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-mono text-purple-300 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
              <span>6-Hour Entrepreneurship Workshop</span>
            </div>
            <p className="text-xs text-zinc-400 tracking-wider font-mono">
              KMCT Kasaragod • E-Cell IIT Bombay
            </p>
          </motion.div>

        </div>

        {/* Bottom Progress: Clean Minimalist Line & Percentage */}
        <div className="w-full max-w-xs mx-auto px-6 pb-12 relative z-20 flex flex-col items-center">
          
          {/* Slender Progress Line */}
          <div className="w-full h-[2.5px] bg-white/[0.08] rounded-full overflow-hidden relative mb-2.5">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.08 }}
            />
          </div>

          {/* Percentage & Status Display */}
          <div className="flex items-center justify-between w-full text-[11px] font-mono text-zinc-500">
            <span className="tracking-wider uppercase">INITIALIZING</span>
            <span className="text-purple-300 font-bold">{progress}%</span>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
