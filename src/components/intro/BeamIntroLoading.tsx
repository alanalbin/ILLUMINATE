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
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const pointerPosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0025);

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
      renderer.toneMappingExposure = 1.25;
    } catch {
      return;
    }

    // 2. Focused Cinematic Lights
    const ambient = new THREE.AmbientLight(0x240e44, 1.4);
    scene.add(ambient);

    const primaryLight = new THREE.PointLight(0xa855f7, 5, 80);
    primaryLight.position.set(0, 0, 12);
    scene.add(primaryLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4, 70);
    cyanLight.position.set(-14, -8, 12);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3, 60);
    goldLight.position.set(14, 8, 10);
    scene.add(goldLight);

    // =========================================================================
    // 3. EYE-CATCHING 3D QUANTUM GYRO-PRISM CORE
    // =========================================================================
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // 3A. Faceted Refractive Icosahedron Crystal Core
    const crystalGeo = new THREE.IcosahedronGeometry(3.2, 0);
    const crystalMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x3b0764,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    centerGroup.add(crystal);

    // Iridescent Wireframe Outer Shell
    const wireGeo = new THREE.IcosahedronGeometry(3.28, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    centerGroup.add(wire);

    // Inner Radiant Octahedron Star
    const innerGeo = new THREE.OctahedronGeometry(1.6, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const innerStar = new THREE.Mesh(innerGeo, innerMat);
    centerGroup.add(innerStar);

    // 3B. Dual Interlocking Gyroscope Gimbal Rings
    // Ring 1 (Cyan orbital torus)
    const ring1Geo = new THREE.TorusGeometry(5.8, 0.08, 16, 90);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.6;
    centerGroup.add(ring1);

    // Ring 2 (Magenta counter-orbital torus)
    const ring2Geo = new THREE.TorusGeometry(6.6, 0.06, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 2.4;
    ring2.rotation.z = Math.PI / 4;
    centerGroup.add(ring2);

    // Outer Thin Gold Halo
    const haloRingGeo = new THREE.TorusGeometry(7.4, 0.04, 16, 90);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    centerGroup.add(haloRing);

    // 3C. Twin Vertical Coherent Laser Beams (Top and Bottom)
    // Upward beam
    const topBeamGeo = new THREE.CylinderGeometry(0.18, 1.2, 90, 24, 1, true);
    topBeamGeo.translate(0, 42, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const topBeam = new THREE.Mesh(topBeamGeo, beamMat);
    centerGroup.add(topBeam);

    // Downward beam
    const bottomBeamGeo = new THREE.CylinderGeometry(1.2, 0.18, 90, 24, 1, true);
    bottomBeamGeo.translate(0, -42, 0);
    const bottomBeam = new THREE.Mesh(bottomBeamGeo, beamMat);
    centerGroup.add(bottomBeam);

    // Soft Violet Core Halo
    const glowCylinderGeo = new THREE.CylinderGeometry(1.1, 3.5, 90, 24, 1, true);
    glowCylinderGeo.translate(0, 42, 0);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const glowCylinder = new THREE.Mesh(glowCylinderGeo, glowMat);
    centerGroup.add(glowCylinder);

    // 3D. Dynamic Swirling Quantum Vortex Embers (36 energetic particles)
    const emberCount = 36;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberPhases = new Float32Array(emberCount);
    const emberRadii = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPhases[i] = Math.random() * Math.PI * 2;
      emberRadii[i] = 7.0 + Math.random() * 9.0;
      const angle = emberPhases[i];
      emberPositions[i * 3] = Math.cos(angle) * emberRadii[i];
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      emberPositions[i * 3 + 2] = Math.sin(angle) * emberRadii[i];
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      size: 0.85,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    centerGroup.add(embers);

    // Pointer move listener for interactive 3D tilt
    const handlePointerMove = (e: PointerEvent) => {
      pointerPosRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerPosRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 4. Animation Loop with Vortex Physics & Spool-up
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const currentProg = progressRef.current;
      const isWarp = warpingRef.current;

      // Exponential spool-up speed as progress approaches 100%
      const spoolMultiplier = 1.0 + (currentProg / 100) * 1.8 + (isWarp ? 4.5 : 0);

      // Smooth damped pointer tilt response
      const ptr = pointerPosRef.current;
      ptr.x += (ptr.targetX - ptr.x) * 0.05;
      ptr.y += (ptr.targetY - ptr.y) * 0.05;

      centerGroup.rotation.x = ptr.y * 0.25;
      centerGroup.rotation.z = -ptr.x * 0.25;

      // Multi-axis compound rotation
      centerGroup.rotation.y = time * 0.5 * spoolMultiplier;
      centerGroup.position.y = Math.sin(time * 1.8) * 0.35;

      innerStar.rotation.y = -time * 1.4 * spoolMultiplier;
      innerStar.rotation.x = time * 0.9 * spoolMultiplier;

      ring1.rotation.z = time * 0.8 * spoolMultiplier;
      ring2.rotation.z = -time * 0.9 * spoolMultiplier;
      haloRing.rotation.x = time * 0.4 * spoolMultiplier;

      // Dynamic beam pulse
      const beamPulse = (1 + Math.sin(time * 6) * 0.14) * (isWarp ? 4.0 : 1.0);
      topBeam.scale.set(beamPulse, 1, beamPulse);
      bottomBeam.scale.set(beamPulse, 1, beamPulse);
      glowCylinder.scale.set(beamPulse * 1.15, 1, beamPulse * 1.15);

      // Vortex particle physics (spiral inward and orbit faster)
      const pos = emberGeo.attributes.position.array as Float32Array;
      const orbitSpeed = 1.5 * spoolMultiplier;
      for (let i = 0; i < emberCount; i++) {
        emberPhases[i] += 0.02 * orbitSpeed;
        const currentAngle = emberPhases[i];
        // Swirl radius contracts slightly as progress builds
        const r = emberRadii[i] * (1.0 - (currentProg / 100) * 0.25);
        pos[i * 3] = Math.cos(currentAngle) * r;
        pos[i * 3 + 1] += Math.sin(time * 2 + i) * 0.04;
        pos[i * 3 + 2] = Math.sin(currentAngle) * r;
      }
      emberGeo.attributes.position.needsUpdate = true;

      // Camera push-in warp at completion
      if (isWarp) {
        camera.position.z -= 0.65;
      } else {
        camera.position.x = ptr.x * 2.0;
        camera.position.y = -ptr.y * 1.5;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      haloRingGeo.dispose();
      haloRingMat.dispose();
      topBeamGeo.dispose();
      bottomBeamGeo.dispose();
      beamMat.dispose();
      glowCylinderGeo.dispose();
      glowMat.dispose();
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
            className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-white/85 to-cyan-500/20 z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Minimalist Top Bar: Skip Button Only */}
        <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-end relative z-20">
          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-lg"
            title="Skip Intro"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Clean Center Typography */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-none -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-[0.28em] text-white uppercase drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              ILLUMINATE
            </h1>
            <p className="text-xs text-purple-300/90 mt-1.5 tracking-widest uppercase font-mono font-medium">
              KMCT Kasaragod • E-Cell IIT Bombay
            </p>
          </motion.div>
        </div>

        {/* Clean Bottom Progress: Thin Minimalist Line & Percentage */}
        <div className="w-full max-w-xs mx-auto px-6 pb-12 relative z-20 flex flex-col items-center">
          
          {/* Slender Progress Line */}
          <div className="w-full h-[2px] bg-white/[0.08] rounded-full overflow-hidden relative mb-2.5">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.08 }}
            />
          </div>

          {/* Clean Percentage Display */}
          <div className="flex items-center justify-between w-full text-[11px] font-mono text-zinc-400">
            <span className="tracking-wider">STARTUP MASTERCLASS</span>
            <span className="text-purple-300 font-bold">{progress}%</span>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
