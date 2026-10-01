'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Sparkles, ArrowRight, Zap, X } from 'lucide-react';

interface BeamIntroLoadingProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export default function BeamIntroLoading({
  onComplete,
  forcePlay = false,
}: BeamIntroLoadingProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Initializing Quantum Core...');
  const [isBlastingOut, setIsBlastingOut] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check if already viewed in this session
  useEffect(() => {
    if (typeof window !== 'undefined' && !forcePlay) {
      const seen = sessionStorage.getItem('illuminate_intro_seen');
      if (seen === 'true') {
        setVisible(false);
        onComplete?.();
      }
    }
  }, [forcePlay, onComplete]);

  // Three.js 3D Beam Animation Scene
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 45);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
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
      renderer.toneMappingExposure = 1.4;
    } catch (e) {
      console.warn('WebGL init fallback in intro:', e);
      return;
    }

    // 3. Central Vertical 3D Energy Beam
    const beamGroup = new THREE.Group();
    scene.add(beamGroup);

    // Core Solid Bright Pillar
    const coreGeo = new THREE.CylinderGeometry(0.8, 0.8, 120, 32, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    beamGroup.add(coreMesh);

    // Outer Neon Violet Corona Glow Cylinder
    const coronaGeo = new THREE.CylinderGeometry(2.8, 3.8, 120, 32, 1, true);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    beamGroup.add(coronaMesh);

    // Wide Atmospheric Aura Cylinder (Cyan / Indigo edge)
    const auraGeo = new THREE.CylinderGeometry(6.5, 9.0, 120, 32, 1, true);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    beamGroup.add(auraMesh);

    // 4. Ground Impact Expanding Shockwave Rings
    const ringCount = 4;
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.RingGeometry(1, 1.6, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xc084fc : 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -10;
      scene.add(ringMesh);
      rings.push(ringMesh);
    }

    // 5. Helical Swirling Vortex Particles
    const particleCount = 450;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    const pAngles = new Float32Array(particleCount);
    const pRadii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 8;
      const y = (Math.random() - 0.5) * 60;

      pPositions[i3] = Math.cos(angle) * radius;
      pPositions[i3 + 1] = y;
      pPositions[i3 + 2] = Math.sin(angle) * radius;

      pSpeeds[i] = 0.8 + Math.random() * 1.5;
      pAngles[i] = angle;
      pRadii[i] = radius;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    // Particle Texture
    const ptCanvas = document.createElement('canvas');
    ptCanvas.width = 32;
    ptCanvas.height = 32;
    const ptCtx = ptCanvas.getContext('2d');
    if (ptCtx) {
      const grad = ptCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#c084fc');
      grad.addColorStop(0.7, '#6366f1');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ptCtx.fillStyle = grad;
      ptCtx.fillRect(0, 0, 32, 32);
    }
    const ptTexture = new THREE.CanvasTexture(ptCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 1.2,
      map: ptTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 6. Dynamic Point Lights
    const beamLight = new THREE.PointLight(0xa855f7, 5, 80);
    beamLight.position.set(0, 0, 10);
    scene.add(beamLight);

    const groundLight = new THREE.PointLight(0x38bdf8, 4, 60);
    groundLight.position.set(0, -9, 0);
    scene.add(groundLight);

    // 7. Responsive Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let startTime = performance.now();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Beam Breathing / Laser Energy Pulse
      const pulse = 1 + Math.sin(elapsedTime * 8) * 0.12;
      coreMesh.scale.set(pulse, 1, pulse);
      coronaMesh.scale.set(pulse * 1.05, 1, pulse * 1.05);
      coronaMesh.rotation.y = elapsedTime * 0.5;
      auraMesh.rotation.y = -elapsedTime * 0.3;

      // Rotate whole beam slightly
      beamGroup.rotation.y = elapsedTime * 0.2;

      // Expand Shockwave Rings at base
      rings.forEach((ring, idx) => {
        const ringTime = (elapsedTime * 1.8 + (idx * 0.6)) % 2.5;
        const scale = 1 + ringTime * 8;
        ring.scale.set(scale, scale, scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ringTime / 2.5) * 0.7;
      });

      // Swirl Particles Upward in Spiral
      const posArray = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pAngles[i] += 0.04 * pSpeeds[i];
        posArray[i3] = Math.cos(pAngles[i]) * pRadii[i];
        posArray[i3 + 2] = Math.sin(pAngles[i]) * pRadii[i];

        // Move upward
        posArray[i3 + 1] += pSpeeds[i] * 0.4;
        if (posArray[i3 + 1] > 30) {
          posArray[i3 + 1] = -25;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      // Camera micro float
      camera.position.x = Math.sin(elapsedTime * 0.6) * 2;
      camera.position.y = 5 + Math.cos(elapsedTime * 0.5) * 1.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      ptTexture.dispose();
      rings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
    };
  }, [visible]);

  // Loading Progress Timer (Smooth 0 -> 100% in 2.3 seconds)
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);

        // Update narrative status
        if (next < 25) {
          setPhaseText('Focusing 3D Particle Beam...');
        } else if (next < 55) {
          setPhaseText('Synchronizing E-Cell IIT Bombay Frameworks...');
        } else if (next < 85) {
          setPhaseText('Illuminating KMCT Campus Grid...');
        } else {
          setPhaseText('Beam Coherence Maxima: Igniting Workshop Portal!');
        }

        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [visible]);

  // Trigger Flash Dissolution & Exit when Progress = 100%
  useEffect(() => {
    if (progress >= 100 && !isBlastingOut) {
      const timer = setTimeout(() => {
        setIsBlastingOut(true);
        // Fade out completely after blast
        const exitTimer = setTimeout(() => {
          handleDismiss();
        }, 750);
        return () => clearTimeout(exitTimer);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [progress, isBlastingOut]);

  // Keyboard shortcut: Escape to skip
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('illuminate_intro_seen', 'true');
    }
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 1 }}
        animate={{ opacity: isBlastingOut ? 0 : 1 }}
        exit={{ opacity: 0, scale: 1.08 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#040208] text-white select-none overflow-hidden"
      >
        {/* 3D WebGL Beam Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Cinematic Ambient Flash on Exit */}
        {isBlastingOut && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-white to-purple-500/30 z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Top Header: Affiliation & Skip Button */}
        <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-purple-300 uppercase">
              ILLUMINATE 2026 • SYSTEM INITIALIZATION
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
            title="Skip Intro"
          >
            <span>Skip [Esc]</span>
            <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Center Illuminated Emblem & Beam Core */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-xl">
          
          {/* Glowing Aura Ring around Emblem */}
          <div className="relative mb-6">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.4, 0.9, 0.4],
                rotate: 360,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -inset-6 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-400/20 to-purple-600/30 blur-xl pointer-events-none"
            />
            
            {/* Illuminated Center Badge */}
            <div className="w-24 h-24 rounded-3xl bg-black/70 border-2 border-purple-400/60 flex items-center justify-center p-4 backdrop-blur-2xl shadow-[0_0_50px_rgba(168,85,247,0.8)] relative z-10">
              <img
                src="/logos/illuminate-torch.png"
                alt="ILLUMINATE"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(192,132,252,0.9)]"
              />
            </div>
          </div>

          {/* Title & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white uppercase">
              ILLUMINATE
            </h1>
            <p className="text-xs sm:text-sm font-medium text-purple-300/90 mt-1 tracking-wider uppercase">
              KMCT Kasaragod • E-Cell IIT Bombay
            </p>
          </motion.div>

        </div>

        {/* Bottom Loading Progress & Status Ticker */}
        <div className="w-full max-w-md mx-auto px-6 pb-12 relative z-20 flex flex-col items-center">
          
          {/* Status Message */}
          <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 mb-2.5">
            <span className="truncate pr-2 text-purple-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{phaseText}</span>
            </span>
            <span className="font-bold text-white tracking-widest">{progress}%</span>
          </div>

          {/* Glowing Energy Bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.08] border border-white/10 overflow-hidden relative p-[1px]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.9)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>

          {/* Quick Enter Prompt once finished */}
          <div className="mt-4 flex items-center justify-center gap-4 text-slate-400 text-xs">
            <span>Offline Entrepreneurship Masterclass</span>
            <span>•</span>
            <span>6 Hours</span>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
