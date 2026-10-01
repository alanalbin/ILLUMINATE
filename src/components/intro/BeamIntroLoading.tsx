'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Zap, X, ShieldCheck, Sparkles } from 'lucide-react';

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
  const [phaseText, setPhaseText] = useState('CALIBRATING 3D QUANTUM CORE');
  const [isWarpingOut, setIsWarpingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // 3D Scene Implementation
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Fog & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030108, 0.0028);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 38);
    camera.lookAt(0, 0, 0);

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
    } catch {
      return;
    }

    // 2. High-Tech Volumetric Ambient & Accent Lights
    const ambientLight = new THREE.AmbientLight(0x200b3b, 1.4);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xa855f7, 6, 70);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4, 60);
    cyanLight.position.set(-15, 10, 15);
    scene.add(cyanLight);

    const floorLight = new THREE.PointLight(0x6366f1, 3, 50);
    floorLight.position.set(0, -14, 0);
    scene.add(floorLight);

    // =========================================================================
    // 3. THE 3D KINETIC GIMBAL REACTOR
    // =========================================================================
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // 3A. Central Levitating Polyhedron Core (Dodecahedron + Inner Pulsing Sphere)
    const coreGeo = new THREE.DodecahedronGeometry(3.2, 0);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x4c1d95,
      specular: 0xffffff,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    reactorGroup.add(coreMesh);

    // Wireframe faceted cage overlay
    const cageGeo = new THREE.DodecahedronGeometry(3.26, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    reactorGroup.add(cageMesh);

    // Inner Radiant Energy Core
    const radiantGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const radiantMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
    });
    const radiantMesh = new THREE.Mesh(radiantGeo, radiantMat);
    reactorGroup.add(radiantMesh);

    // 3B. Triple Kinetic Gimbal Rings (Glow Torus Rings on 3 independent axes)
    // Ring 1 (Inner Cyan Ring, X/Y tilt)
    const ring1Geo = new THREE.TorusGeometry(5.4, 0.09, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    reactorGroup.add(ring1);

    // Ring 2 (Middle Violet Ring, Y/Z tilt)
    const ring2Geo = new THREE.TorusGeometry(7.0, 0.08, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    reactorGroup.add(ring2);

    // Ring 3 (Outer Radiant Ring, Incline tilt)
    const ring3Geo = new THREE.TorusGeometry(8.8, 0.06, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xe0e7ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = -Math.PI / 4;
    ring3.rotation.x = Math.PI / 5;
    reactorGroup.add(ring3);

    // 3C. Vertical High-Coherence Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.35, 0.7, 100, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 10;
    scene.add(beamMesh);

    // Outer Beam Volumetric Glow Cylinder
    const glowGeo = new THREE.CylinderGeometry(1.4, 2.8, 100, 32, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.y = 10;
    scene.add(glowMesh);

    // 3D. Concentric Impact Shockwaves at Ground
    const shockRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const sGeo = new THREE.RingGeometry(0.8, 1.3, 64);
      const sMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xc084fc,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.rotation.x = -Math.PI / 2;
      sMesh.position.y = -10;
      scene.add(sMesh);
      shockRings.push(sMesh);
    }

    // 3E. Ingestion Vortex Particles (Spiraling inward toward the reactor core)
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pAngles = new Float32Array(particleCount);
    const pDistances = new Float32Array(particleCount);
    const pSpeeds = new Float32Array(particleCount);
    const pHeights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pAngles[i] = Math.random() * Math.PI * 2;
      pDistances[i] = 4 + Math.random() * 18;
      pSpeeds[i] = 0.8 + Math.random() * 1.4;
      pHeights[i] = (Math.random() - 0.5) * 20;

      pPositions[i * 3] = Math.cos(pAngles[i]) * pDistances[i];
      pPositions[i * 3 + 1] = pHeights[i];
      pPositions[i * 3 + 2] = Math.sin(pAngles[i]) * pDistances[i];
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    // Particle Texture with soft circular glow
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#a855f7');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 1.1,
      map: pTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const vortexParticles = new THREE.Points(pGeo, pMat);
    scene.add(vortexParticles);

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 4. ANIMATION LOOP
    // =========================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const speedMult = warpingRef.current ? 4.5 : 1.0;

      // 4A. Kinetic Core & Rings Rotation
      coreMesh.rotation.y = time * 0.5 * speedMult;
      coreMesh.rotation.x = time * 0.3 * speedMult;
      cageMesh.rotation.y = time * 0.5 * speedMult;
      cageMesh.rotation.x = time * 0.3 * speedMult;

      radiantMesh.rotation.y = -time * 1.2 * speedMult;
      radiantMesh.rotation.z = time * 0.8 * speedMult;

      // Ring 1 (Pitch spin)
      ring1.rotation.x = time * 1.2 * speedMult;
      ring1.rotation.y = time * 0.4 * speedMult;

      // Ring 2 (Roll spin)
      ring2.rotation.y = time * 1.5 * speedMult;
      ring2.rotation.z = -time * 0.6 * speedMult;

      // Ring 3 (Yaw spin)
      ring3.rotation.z = time * 0.9 * speedMult;
      ring3.rotation.x = -time * 0.7 * speedMult;

      // Vertical Breathing Float
      reactorGroup.position.y = Math.sin(time * 1.8) * 0.6;

      // 4B. Laser Beam Pulsation
      const beamPulse = (1 + Math.sin(time * 8) * 0.15) * (warpingRef.current ? 4.0 : 1.0);
      beamMesh.scale.set(beamPulse, 1, beamPulse);
      glowMesh.scale.set(beamPulse * 1.2, 1, beamPulse * 1.2);

      // 4C. Shockwave rings expansion at base
      shockRings.forEach((r, idx) => {
        const ringTime = (time * 1.6 + idx * 0.65) % 2.0;
        const scale = 1 + ringTime * 7;
        r.scale.set(scale, scale, scale);
        (r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ringTime / 2.0) * 0.6;
      });

      // 4D. Swirling Ingestion Particles
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pAngles[i] += 0.03 * pSpeeds[i] * speedMult;
        // Inward spiraling
        pDistances[i] -= 0.04 * pSpeeds[i] * speedMult;
        if (pDistances[i] < 2.0) {
          pDistances[i] = 16 + Math.random() * 4;
        }

        pArr[i * 3] = Math.cos(pAngles[i]) * pDistances[i];
        pArr[i * 3 + 1] = pHeights[i] + Math.sin(time + pAngles[i]) * 1.2;
        pArr[i * 3 + 2] = Math.sin(pAngles[i]) * pDistances[i];
      }
      pGeo.attributes.position.needsUpdate = true;

      // 4E. Camera Dynamics
      if (warpingRef.current) {
        // Dramatic push in
        camera.position.z -= 0.6;
      } else {
        camera.position.x = Math.sin(time * 0.4) * 2.5;
        camera.position.y = 4 + Math.cos(time * 0.35) * 1.5;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      radiantGeo.dispose();
      radiantMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      pTexture.dispose();
      shockRings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
    };
  }, [visible]);

  // Synchronized Progress Counter (Smooth 0 -> 100% in ~2.2s)
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 7) + 4;
        const next = Math.min(100, prev + delta);

        if (next < 25) {
          setPhaseText('CALIBRATING 3D GIMBAL RINGS');
        } else if (next < 55) {
          setPhaseText('FOCUSING COHERENT LASER BEAM');
        } else if (next < 85) {
          setPhaseText('INGESTING VENTURE MATRIX');
        } else {
          setPhaseText('ILLUMINATION IGNITION 100%');
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [visible]);

  // Warp out trigger when 100% is reached
  const warpingRef = useRef(isWarpingOut);
  warpingRef.current = isWarpingOut;

  useEffect(() => {
    if (progress >= 100 && !isWarpingOut) {
      const timer = setTimeout(() => {
        setIsWarpingOut(true);
        const exitTimer = setTimeout(() => {
          handleDismiss();
        }, 600);
        return () => clearTimeout(exitTimer);
      }, 350);

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
        exit={{ opacity: 0, scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#04010a] text-white select-none overflow-hidden"
      >
        {/* Fullscreen 3D Kinetic Reactor Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Warp Out Cinematic Flare Effect */}
        {isWarpingOut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 3.0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-radial from-white via-cyan-400/40 to-transparent z-30 pointer-events-none mix-blend-screen"
          />
        )}

        {/* Top Header: System HUD & Skip */}
        <div className="w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                SYSTEM REQUISITION • 3D REACTOR ONLINE
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                KMCT Kasaragod • E-Cell IIT Bombay
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
            title="Skip Intro"
          >
            <span>Skip [Esc]</span>
            <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Center Illuminated Title HUD */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-none -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-[10px] font-mono uppercase tracking-widest text-purple-300 mb-3 shadow-lg">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Offline Entrepreneurship Masterclass</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200 uppercase drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              ILLUMINATE
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-purple-300 mt-1 tracking-wider uppercase">
              KMCT College of Engineering • E-Cell, IIT Bombay
            </p>
          </motion.div>
        </div>

        {/* Bottom Radial Telemetry & Loading Metrics */}
        <div className="w-full max-w-md mx-auto px-6 pb-10 relative z-20 flex flex-col items-center">
          
          {/* Radial Segmented Dial */}
          <div className="relative w-18 h-18 mb-3.5 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="url(#reactorGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={157.08}
                strokeDashoffset={157.08 - (157.08 * progress) / 100}
                className="transition-all duration-75 ease-out"
              />
              <defs>
                <linearGradient id="reactorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Real-time Percentage Counter */}
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-mono font-black text-white tracking-wider">
                {progress}%
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{phaseText}</span>
          </div>

          {/* Micro Telemetry Tags */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mt-1">
            <span>FREQ: 432.8 THz</span>
            <span>•</span>
            <span>FLUX: OPTIMAL</span>
            <span>•</span>
            <span>6-HOUR SPRINT</span>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
