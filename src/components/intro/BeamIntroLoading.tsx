'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Sparkles, X, ChevronRight } from 'lucide-react';

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
  const [phaseText, setPhaseText] = useState('Aligning Prismatic Core');
  const [isWipingOut, setIsWipingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check session storage so users aren't interrupted on back/forward unless forcePlay is true
  useEffect(() => {
    if (typeof window !== 'undefined' && !forcePlay) {
      const seen = sessionStorage.getItem('illuminate_intro_seen');
      if (seen === 'true') {
        setVisible(false);
        onComplete?.();
      }
    }
  }, [forcePlay, onComplete]);

  // Three.js 3D Prismatic Genesis & Light Beam Scene
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040209, 0.003);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

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
      renderer.toneMappingExposure = 1.3;
    } catch {
      return;
    }

    // 2. Volumetric Lights
    const ambient = new THREE.AmbientLight(0x180b30, 1.2);
    scene.add(ambient);

    const corePointLight = new THREE.PointLight(0xa855f7, 5, 60);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const cyanRimLight = new THREE.PointLight(0x38bdf8, 3.5, 50);
    cyanRimLight.position.set(-15, -10, 15);
    scene.add(cyanRimLight);

    // 3. Central Monolith Group
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // Primary Faceted Crystal (Slender double-pyramid octahedron)
    const crystalGeo = new THREE.OctahedronGeometry(4.2, 0);
    // Elongate vertically to resemble a floating obelisk prism
    crystalGeo.scale(1, 1.7, 1);

    const crystalMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x2e1065,
      specular: 0xffffff,
      shininess: 120,
      transparent: true,
      opacity: 0.78,
      flatShading: true,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    centerGroup.add(crystalMesh);

    // Sleek Wireframe Cage highlighting geometric facets
    const wireGeo = new THREE.OctahedronGeometry(4.26, 0);
    wireGeo.scale(1, 1.7, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    centerGroup.add(wireMesh);

    // Inner Luminous Core (Glowing miniature diamond)
    const innerGeo = new THREE.IcosahedronGeometry(1.6, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    centerGroup.add(innerMesh);

    // 4. Vertical Coherent Light Beam striking from above
    const beamGeo = new THREE.CylinderGeometry(0.35, 1.8, 80, 32, 1, true);
    beamGeo.translate(0, 40, 0); // Position beam extending upward from crystal
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xe0e7ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    centerGroup.add(beamMesh);

    // Beam Outer Halo
    const beamHaloGeo = new THREE.CylinderGeometry(1.5, 4.5, 80, 32, 1, true);
    beamHaloGeo.translate(0, 40, 0);
    const beamHaloMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamHaloMesh = new THREE.Mesh(beamHaloGeo, beamHaloMat);
    centerGroup.add(beamHaloMesh);

    // 5. Refracted Equatorial Orbiting Light Rings
    const ring1Geo = new THREE.TorusGeometry(6.5, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 2.2;
    centerGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(8.2, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 2.5;
    centerGroup.add(ring2Mesh);

    // 6. Floating Prismatic Light Shards (Floating around the crystal)
    const shardCount = 14;
    const shards: { mesh: THREE.Mesh; speed: number; orbitRadius: number; phase: number }[] = [];
    for (let i = 0; i < shardCount; i++) {
      const sGeo = new THREE.TetrahedronGeometry(0.35 + Math.random() * 0.4, 0);
      const sMat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xc084fc,
        emissive: 0x1e1b4b,
        specular: 0xffffff,
        flatShading: true,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      scene.add(sMesh);
      shards.push({
        mesh: sMesh,
        speed: 0.4 + Math.random() * 0.6,
        orbitRadius: 7 + Math.random() * 6,
        phase: (i * Math.PI * 2) / shardCount,
      });
    }

    // 7. Ambient Floating Stardust (Sparse, slow, gentle)
    const stardustCount = 80;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPositions = new Float32Array(stardustCount * 3);
    for (let i = 0; i < stardustCount; i++) {
      stardustPositions[i * 3] = (Math.random() - 0.5) * 60;
      stardustPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      stardustPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPositions, 3));
    const stardustMat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0xc084fc,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const stardustPoints = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustPoints);

    // Resize Handler
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

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Graceful, steady prism rotation
      centerGroup.rotation.y = time * 0.45;
      centerGroup.position.y = Math.sin(time * 1.4) * 0.5;

      // Inner diamond counter-rotation
      innerMesh.rotation.y = -time * 1.2;
      innerMesh.rotation.z = time * 0.8;

      // Beam dynamic breathing pulse
      const beamScale = 1 + Math.sin(time * 6) * 0.15;
      beamMesh.scale.set(beamScale, 1, beamScale);
      beamHaloMesh.scale.set(beamScale * 1.1, 1, beamScale * 1.1);

      // Rings differential precession
      ring1Mesh.rotation.z = time * 0.6;
      ring2Mesh.rotation.z = -time * 0.4;

      // Orbiting light shards
      shards.forEach((item) => {
        const angle = time * item.speed + item.phase;
        item.mesh.position.set(
          Math.cos(angle) * item.orbitRadius,
          Math.sin(angle * 1.5) * 2.5 + Math.sin(time + item.phase) * 1.5,
          Math.sin(angle) * item.orbitRadius
        );
        item.mesh.rotation.x = time * 1.5;
        item.mesh.rotation.y = time * 2;
      });

      // Camera slow cinematic push-in
      camera.position.z = 36 - Math.min(progressRef.current * 0.08, 8);
      camera.lookAt(0, 0, 0);

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
      beamHaloGeo.dispose();
      beamHaloMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      stardustGeo.dispose();
      stardustMat.dispose();
      shards.forEach((s) => {
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
      });
    };
  }, [visible]);

  // Synchronized progress tracking
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 6) + 4;
        const next = Math.min(100, prev + delta);

        if (next < 30) {
          setPhaseText('Gathering Light Spectrum...');
        } else if (next < 65) {
          setPhaseText('Focusing Coherent Venture Beam...');
        } else if (next < 90) {
          setPhaseText('Synchronizing KMCT & IIT Bombay Portal...');
        } else {
          setPhaseText('Prism Resonance 100% • Igniting Workspace');
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [visible]);

  // Trigger flash and exit when 100% reached
  useEffect(() => {
    if (progress >= 100 && !isWipingOut) {
      const timer = setTimeout(() => {
        setIsWipingOut(true);
        const exitTimer = setTimeout(() => {
          handleDismiss();
        }, 650);
        return () => clearTimeout(exitTimer);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [progress, isWipingOut]);

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
        initial={{ opacity: 1 }}
        animate={{ opacity: isWipingOut ? 0 : 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#040209] text-white select-none overflow-hidden"
      >
        {/* Fullscreen 3D Prism WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Cinematic White/Purple Light Burst on Completion */}
        {isWipingOut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 2 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-radial from-white via-purple-500/40 to-transparent z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Top Header: Initiative Badge & Skip Pill */}
        <div className="w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-purple-300 uppercase font-semibold">
              ILLUMINATE • 3D AWAKENING
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-purple-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
            title="Skip Intro"
          >
            <span>Skip [Esc]</span>
            <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Center Illuminated Monolith Overlay */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-none -mt-4">
          
          {/* Subtle Ambient Halo */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600/30 to-cyan-400/20 blur-2xl pointer-events-none" />

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-2"
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-100 uppercase">
              ILLUMINATE
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-purple-300/80 mt-1 tracking-wider uppercase">
              KMCT Kasaragod • E-Cell IIT Bombay
            </p>
          </motion.div>

        </div>

        {/* Bottom Circular Radial Progress & State Bar */}
        <div className="w-full max-w-md mx-auto px-6 pb-10 relative z-20 flex flex-col items-center">
          
          {/* Circular Gauge / Modern Radial Indicator */}
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              {/* Background Track */}
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3"
                fill="none"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="url(#beamGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * progress) / 100}
                className="transition-all duration-100 ease-out"
              />
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Percentage Display */}
            <span className="absolute text-xs font-mono font-bold text-white tracking-wider">
              {progress}%
            </span>
          </div>

          {/* Phase Narrative */}
          <p className="text-xs font-mono text-purple-200/90 tracking-wide text-center">
            {phaseText}
          </p>

          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            6-Hour Offline Masterclass • National Entrepreneurship Challenge
          </p>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
