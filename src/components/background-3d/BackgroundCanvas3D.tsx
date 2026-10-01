'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sliders, Zap, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [hubOpen, setHubOpen] = useState(false);
  const [elementsVisible, setElementsVisible] = useState({
    floatingEmbers: true,
    geometricPrism: true,
    silkyWave: true,
  });

  const elementsRef = useRef(elementsVisible);
  elementsRef.current = elementsVisible;

  const shockwaveTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 1. WebGL Verification
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 2. Clean, Deep-Space Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 210);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 3. Gentle Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1a0d33, 1.0);
    scene.add(ambientLight);

    const softPurpleGlow = new THREE.PointLight(0xa855f7, 2.0, 500);
    softPurpleGlow.position.set(80, 50, 60);
    scene.add(softPurpleGlow);

    const softCyanGlow = new THREE.PointLight(0x38bdf8, 1.5, 500);
    softCyanGlow.position.set(-80, -40, 50);
    scene.add(softCyanGlow);

    // =========================================================================
    // 1. SPARSE, FLOATING LUMINESCENT EMBERS (Not crowded: only 36 gentle points)
    // =========================================================================
    const emberCount = isMobile ? 22 : 36;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      emberPositions[i3] = (Math.random() - 0.5) * 450;
      emberPositions[i3 + 1] = (Math.random() - 0.5) * 350;
      emberPositions[i3 + 2] = (Math.random() - 0.5) * 250;
      emberSpeeds[i] = 0.03 + Math.random() * 0.05; // peaceful, meditative drift
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    // Soft glowing circle sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.25, 'rgba(192, 132, 252, 0.7)');
      grad.addColorStop(0.65, 'rgba(126, 34, 206, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(pCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 4.5 : 6.0,
      map: emberTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embersField = new THREE.Points(emberGeo, emberMat);
    scene.add(embersField);

    // =========================================================================
    // 2. MINIMALIST SLENDER GEOMETRIC CELESTIAL PRISM (Spacious, elegant wireframe)
    // =========================================================================
    const prismGroup = new THREE.Group();
    prismGroup.position.set(0, 5, -50);
    scene.add(prismGroup);

    // Single refined outer icosahedron (very thin, low opacity wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(isMobile ? 26 : 36, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.12, // Subtle, doesn't compete with content
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    prismGroup.add(icoMesh);

    // Inner concentric octahedron diamond
    const octGeo = new THREE.OctahedronGeometry(isMobile ? 15 : 20, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    prismGroup.add(octMesh);

    // Slender outer orbital ring (faint, slow)
    const ringGeo = new THREE.TorusGeometry(isMobile ? 55 : 75, 0.8, 12, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    prismGroup.add(ringMesh);

    // =========================================================================
    // 3. SILKY HOLOGRAPHIC WAVE RIBBON (Smooth, spacious wave - NOT a busy grid)
    // =========================================================================
    const waveGeo = new THREE.PlaneGeometry(420, 260, 20, 14); // Low polygon density for clean look
    waveGeo.rotateX(-Math.PI / 2.4);
    waveGeo.translate(0, -65, -60);

    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.09, // Very subtle, silky background movement
      blending: THREE.AdditiveBlending,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    scene.add(waveMesh);

    // =========================================================================
    // INTERACTION: Smooth Mouse Parallax, Gentle Particle Repulsion & Click Ripple
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let shockwaveActive = false;
    let shockwaveRadius = 0;

    const triggerShockwave = () => {
      shockwaveActive = true;
      shockwaveRadius = 0;
    };
    shockwaveTriggerRef.current = triggerShockwave;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('.glass-card')) {
        return;
      }
      triggerShockwave();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Tab visibility handling
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Smooth Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();
      const elements = elementsRef.current;

      // Visibility toggles
      embersField.visible = elements.floatingEmbers;
      prismGroup.visible = elements.geometricPrism;
      waveMesh.visible = elements.silkyWave;

      // Smooth damped camera tilt
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.02;
        currentY += (targetY - currentY) * 0.02;

        camera.position.x = currentX * 6;
        camera.position.y = -currentY * 4;
        camera.lookAt(0, 0, 0);

        // Meditative, slow prism rotation
        if (elements.geometricPrism) {
          icoMesh.rotation.y = time * 0.025;
          icoMesh.rotation.x = time * 0.015;
          octMesh.rotation.y = -time * 0.03;
          octMesh.rotation.z = time * 0.02;
          ringMesh.rotation.z = time * 0.012;

          // Gentle vertical breathing float
          prismGroup.position.y = 5 + Math.sin(time * 0.5) * 3;
        }
      }

      // Shockwave propagation
      if (shockwaveActive) {
        shockwaveRadius += delta * 280;
        if (shockwaveRadius > 400) {
          shockwaveActive = false;
        }
      }

      // Peaceful embers drift
      if (elements.floatingEmbers) {
        const pos = emberGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < emberCount; i++) {
          const i3 = i * 3;
          pos[i3 + 1] += emberSpeeds[i] * 0.7; // slow upward drift
          if (pos[i3 + 1] > 180) {
            pos[i3 + 1] = -180;
            pos[i3] = (Math.random() - 0.5) * 450;
          }

          // Gentle shockwave ripple effect
          if (shockwaveActive) {
            const dist = Math.sqrt(pos[i3] * pos[i3] + pos[i3 + 1] * pos[i3 + 1]);
            const diff = Math.abs(dist - shockwaveRadius);
            if (diff < 30) {
              pos[i3 + 1] += (1 - diff / 30) * 1.5;
            }
          }
        }
        emberGeo.attributes.position.needsUpdate = true;

        // Subtle luminosity pulse
        emberMat.opacity = 0.45 + Math.sin(time * 0.8) * 0.08;
      }

      // Silky undulating wave motion (fluid, spacious)
      if (elements.silkyWave) {
        const wavePos = waveGeo.attributes.position;
        for (let i = 0; i < wavePos.count; i++) {
          const u = wavePos.getX(i);
          const v = wavePos.getY(i);
          // Very gentle harmonic wave
          const z =
            Math.sin(u * 0.025 + time * 0.8) * 6.0 +
            Math.cos(v * 0.03 + time * 0.6) * 4.5;
          wavePos.setZ(i, z);
        }
        waveGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      emberGeo.dispose();
      emberMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      emberTexture.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#05030a]"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {/* 3D Canvas Background Element */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0d0722 0%, #05030a 70%, #030107 100%)',
        }}
        aria-hidden="true"
      />

      {/* Discrete, Clean 3D Control Dock */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 select-none">
        <AnimatePresence>
          {hubOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18 }}
              className="glass-card rounded-2xl p-4 border border-purple-500/30 shadow-2xl shadow-purple-950/80 bg-[#090518]/90 backdrop-blur-2xl w-64 text-white space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">3D Ambient Space</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  CALM
                </span>
              </div>

              {/* Shockwave Trigger */}
              <button
                type="button"
                onClick={() => shockwaveTriggerRef.current?.()}
                className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Send Ripple Wave</span>
              </button>

              {/* Toggles */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setElementsVisible((prev) => ({ ...prev, floatingEmbers: !prev.floatingEmbers }))
                  }
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    elementsVisible.floatingEmbers
                      ? 'bg-purple-950/50 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span>Soft Glowing Embers</span>
                  {elementsVisible.floatingEmbers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setElementsVisible((prev) => ({ ...prev, geometricPrism: !prev.geometricPrism }))
                  }
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    elementsVisible.geometricPrism
                      ? 'bg-purple-950/50 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span>Slender Celestial Prism</span>
                  {elementsVisible.geometricPrism ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setElementsVisible((prev) => ({ ...prev, silkyWave: !prev.silkyWave }))
                  }
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    elementsVisible.silkyWave
                      ? 'bg-purple-950/50 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span>Silky Holographic Wave</span>
                  {elementsVisible.silkyWave ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Replay 3D Intro */}
              {onReplayIntro && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setHubOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-purple-400" />
                    <span>Replay 3D Intro Beam</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Floating Trigger */}
        <button
          type="button"
          onClick={() => setHubOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/30 hover:border-purple-400 text-xs font-semibold text-purple-200 hover:text-white shadow-lg shadow-purple-950/80 backdrop-blur-xl transition-all cursor-pointer group active:scale-95"
          title="3D Ambient Controls"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>3D Space</span>
          <Sliders className="w-3 h-3 text-purple-400 group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    </>
  );
}
