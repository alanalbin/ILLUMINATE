'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { X } from 'lucide-react';

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

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.003);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    } catch {
      return;
    }

    // 2. Focused Cinematic Lights
    const ambient = new THREE.AmbientLight(0x200b3b, 1.2);
    scene.add(ambient);

    const primaryLight = new THREE.PointLight(0xa855f7, 4, 60);
    primaryLight.position.set(0, 0, 10);
    scene.add(primaryLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 3, 50);
    cyanLight.position.set(-10, -5, 10);
    scene.add(cyanLight);

    // =========================================================================
    // 3. ELEGANT, UNCLUTTERED 3D PRISMATIC MONOLITH & BEAM
    // =========================================================================
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // 3A. Faceted Double-Pyramid Crystal
    const crystalGeo = new THREE.OctahedronGeometry(3.6, 0);
    crystalGeo.scale(1, 1.6, 1);

    const crystalMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x3b0764,
      specular: 0xffffff,
      shininess: 90,
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    centerGroup.add(crystal);

    // Delicate wireframe outline
    const wireGeo = new THREE.OctahedronGeometry(3.64, 0);
    wireGeo.scale(1, 1.6, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    centerGroup.add(wire);

    // Inner Glowing Core Diamond
    const innerGeo = new THREE.OctahedronGeometry(1.5, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    centerGroup.add(innerCore);

    // 3B. Slender Vertical Light Beam
    const beamGeo = new THREE.CylinderGeometry(0.25, 1.2, 80, 24, 1, true);
    beamGeo.translate(0, 35, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    centerGroup.add(beam);

    // Soft Outer Violet Glow
    const haloGeo = new THREE.CylinderGeometry(1.2, 3.2, 80, 24, 1, true);
    haloGeo.translate(0, 35, 0);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    centerGroup.add(halo);

    // 3C. Single Concentric Orbital Light Ring (Thin, clean)
    const ringGeo = new THREE.TorusGeometry(6.2, 0.05, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    centerGroup.add(ring);

    // 3D. Sparse Floating Embers (Only 24 gentle points - NOT crowded)
    const emberCount = 24;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 40;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      size: 0.9,
      color: 0xc084fc,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 4. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const speed = warpingRef.current ? 4.0 : 1.0;

      // Meditative smooth crystal rotation
      centerGroup.rotation.y = time * 0.4 * speed;
      centerGroup.position.y = Math.sin(time * 1.5) * 0.4;

      innerCore.rotation.y = -time * 1.0 * speed;
      innerCore.rotation.z = time * 0.6 * speed;

      ring.rotation.z = time * 0.5 * speed;

      // Beam gentle pulsation
      const pulse = (1 + Math.sin(time * 5) * 0.12) * (warpingRef.current ? 3.5 : 1.0);
      beam.scale.set(pulse, 1, pulse);
      halo.scale.set(pulse * 1.1, 1, pulse * 1.1);

      // Camera gentle push in on finish
      if (warpingRef.current) {
        camera.position.z -= 0.5;
      } else {
        camera.position.x = Math.sin(time * 0.3) * 1.5;
        camera.position.y = Math.cos(time * 0.25) * 1.0;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
    };
  }, [visible]);

  // Clean Progress Sequence (0 -> 100% in 1.8s)
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
        }, 550);
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
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#05030a] text-white select-none overflow-hidden"
      >
        {/* Clean 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Soft Ambient Light Flash on Exit */}
        {isWarpingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-white/80 to-transparent z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Minimalist Top Bar: Skip Button Only */}
        <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-end relative z-20">
          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="Skip Intro"
          >
            <span>Skip</span>
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Clean Center Typography */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-none -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              ILLUMINATE
            </h1>
            <p className="text-xs text-purple-300/80 mt-1 tracking-widest uppercase font-mono">
              KMCT Kasaragod • E-Cell IIT Bombay
            </p>
          </motion.div>
        </div>

        {/* Clean Bottom Progress: Thin Minimalist Line & Percentage */}
        <div className="w-full max-w-xs mx-auto px-6 pb-12 relative z-20 flex flex-col items-center">
          
          {/* Slender Progress Line */}
          <div className="w-full h-[2px] bg-white/[0.08] rounded-full overflow-hidden relative mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.08 }}
            />
          </div>

          {/* Clean Percentage Display */}
          <div className="flex items-center justify-between w-full text-[11px] font-mono text-zinc-500">
            <span>STARTUP MASTERCLASS</span>
            <span className="text-purple-300 font-semibold">{progress}%</span>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
