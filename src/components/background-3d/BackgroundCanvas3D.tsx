'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Waves, Orbit, Zap, Palette, RefreshCw, Eye, EyeOff, Sliders } from 'lucide-react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  
  // Interactive Controls State
  const [activeLayers, setActiveLayers] = useState({
    constellation: true,
    cyberWave: true,
    celestialCore: true,
  });
  const [colorTheme, setColorTheme] = useState<'purple' | 'cyan' | 'emerald'>('purple');
  const [hubOpen, setHubOpen] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // References to communicate with Three.js animation loop without rebuilding scene
  const layersRef = useRef(activeLayers);
  layersRef.current = activeLayers;

  const themeRef = useRef(colorTheme);
  themeRef.current = colorTheme;

  const speedRef = useRef(speedMultiplier);
  speedRef.current = speedMultiplier;

  const shockwaveTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 1. WebGL Support Verification
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

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 15, 230);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Volumetric Ambient & Accent Lights
    const ambientLight = new THREE.AmbientLight(0x1e0e3e, 0.9);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0xa855f7, 2.5, 600);
    primaryLight.position.set(90, 60, 80);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 2.0, 600);
    secondaryLight.position.set(-90, -30, 60);
    scene.add(secondaryLight);

    // =========================================================================
    // ANIMATION 1: 3D Constellation Stardust Network with Dynamic Proximity Lines
    // =========================================================================
    const starCount = isMobile ? 100 : 200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starBasePositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 480;
      const y = (Math.random() - 0.5) * 360;
      const z = (Math.random() - 0.5) * 300;

      starPositions[i3] = x;
      starPositions[i3 + 1] = y;
      starPositions[i3 + 2] = z;

      starBasePositions[i3] = x;
      starBasePositions[i3 + 1] = y;
      starBasePositions[i3 + 2] = z;

      starVelocities[i3] = (Math.random() - 0.5) * 0.08;
      starVelocities[i3 + 1] = 0.05 + Math.random() * 0.08; // upward drift
      starVelocities[i3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Particle sprite texture
    const ptCanvas = document.createElement('canvas');
    ptCanvas.width = 32;
    ptCanvas.height = 32;
    const ptCtx = ptCanvas.getContext('2d');
    if (ptCtx) {
      const grad = ptCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(192, 132, 252, 0.9)');
      grad.addColorStop(0.7, 'rgba(147, 51, 234, 0.3)');
      grad.addColorStop(1, 'rgba(5, 3, 10, 0)');
      ptCtx.fillStyle = grad;
      ptCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(ptCanvas);

    const starMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.5 : 5.0,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Proximity Lines connecting nearby stars (Constellation effect)
    const maxLineSegments = isMobile ? 80 : 160;
    const linePositions = new Float32Array(maxLineSegments * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellationLines);

    // =========================================================================
    // ANIMATION 2: 3D Holographic Undulating Cyber Wave Grid (Perspective Terrain)
    // =========================================================================
    const gridCols = isMobile ? 36 : 56;
    const gridRows = isMobile ? 28 : 42;
    const wavePlaneGeo = new THREE.PlaneGeometry(550, 400, gridCols, gridRows);
    wavePlaneGeo.rotateX(-Math.PI / 2.3);
    wavePlaneGeo.translate(0, -75, -80);

    const wavePlaneMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });

    const cyberWaveMesh = new THREE.Mesh(wavePlaneGeo, wavePlaneMat);
    scene.add(cyberWaveMesh);

    // Store original undisturbed vertices
    const wavePosAttr = wavePlaneGeo.attributes.position;
    const originalWaveZ = new Float32Array(wavePosAttr.count);
    for (let i = 0; i < wavePosAttr.count; i++) {
      originalWaveZ[i] = wavePosAttr.getY(i);
    }

    // =========================================================================
    // ANIMATION 3: 3D Celestial Core & Dual Orbiting Gyroscopic Rings
    // =========================================================================
    const celestialGroup = new THREE.Group();
    celestialGroup.position.set(0, 15, -40);
    scene.add(celestialGroup);

    // Central Faceted Icosahedron (Faceted Wireframe + Glowing Core)
    const coreIcoGeo = new THREE.IcosahedronGeometry(isMobile ? 22 : 32, 1);
    const coreIcoMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    });
    const coreIco = new THREE.Mesh(coreIcoGeo, coreIcoMat);
    celestialGroup.add(coreIco);

    // Inner Glowing Core (Small Octahedron)
    const coreOctGeo = new THREE.OctahedronGeometry(isMobile ? 12 : 18, 0);
    const coreOctMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreOct = new THREE.Mesh(coreOctGeo, coreOctMat);
    celestialGroup.add(coreOct);

    // Orbital Ring 1 (Inclined XY-plane)
    const ring1Geo = new THREE.TorusGeometry(isMobile ? 48 : 65, 0.9, 12, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 4;
    ring1Mesh.rotation.y = Math.PI / 6;
    celestialGroup.add(ring1Mesh);

    // Orbital Ring 2 (Perpendicular Opposite Tilt)
    const ring2Geo = new THREE.TorusGeometry(isMobile ? 62 : 82, 0.7, 12, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 3;
    ring2Mesh.rotation.z = Math.PI / 5;
    celestialGroup.add(ring2Mesh);

    // =========================================================================
    // INTERACTIVITY: Mouse Raycasting, Cursor Gravity & Repulsion, Shockwaves
    // =========================================================================
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const mouseNormalized = new THREE.Vector2(0, 0);
    let targetCameraX = 0;
    let targetCameraY = 0;
    let currentCameraX = 0;
    let currentCameraY = 0;

    // Shockwave State
    let shockwaveActive = false;
    let shockwaveRadius = 0;
    let shockwaveOrigin = new THREE.Vector3(0, 0, 0);

    const triggerShockwave = (x = 0, y = 0) => {
      shockwaveActive = true;
      shockwaveRadius = 0;
      shockwaveOrigin.set(x, y, 0);
    };
    shockwaveTriggerRef.current = () => triggerShockwave(0, 0);

    const handlePointerMove = (e: PointerEvent) => {
      mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;

      targetCameraX = mouseNormalized.x * 12;
      targetCameraY = mouseNormalized.y * 8;

      // Project mouse coordinates into 3D world space at z=0 plane
      mouse3D.set(mouseNormalized.x * 180, mouseNormalized.y * 120, 0);
    };

    const handleWindowClick = (e: MouseEvent) => {
      // Don't trigger if clicked on an interactive UI control or link
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('.glass-card')) {
        return;
      }
      triggerShockwave(mouse3D.x, mouse3D.y);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });

    // Responsive resize handler
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

    // =========================================================================
    // MAIN RENDER & ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime() * speedRef.current;
      const layers = layersRef.current;
      const currentTheme = themeRef.current;

      // 1. Dynamic Color Theming Updates
      if (currentTheme === 'cyan') {
        starMaterial.color.setHex(0x38bdf8);
        lineMaterial.color.setHex(0x0284c7);
        wavePlaneMat.color.setHex(0x06b6d4);
        coreIcoMat.color.setHex(0x38bdf8);
        ring1Mat.color.setHex(0x0ea5e9);
        ring2Mat.color.setHex(0x7dd3fc);
        primaryLight.color.setHex(0x06b6d4);
        secondaryLight.color.setHex(0x38bdf8);
      } else if (currentTheme === 'emerald') {
        starMaterial.color.setHex(0x34d399);
        lineMaterial.color.setHex(0x059669);
        wavePlaneMat.color.setHex(0x10b981);
        coreIcoMat.color.setHex(0x34d399);
        ring1Mat.color.setHex(0x059669);
        ring2Mat.color.setHex(0x6ee7b7);
        primaryLight.color.setHex(0x10b981);
        secondaryLight.color.setHex(0x34d399);
      } else {
        // default purple
        starMaterial.color.setHex(0xffffff);
        lineMaterial.color.setHex(0x9333ea);
        wavePlaneMat.color.setHex(0x7c3aed);
        coreIcoMat.color.setHex(0xa855f7);
        ring1Mat.color.setHex(0x818cf8);
        ring2Mat.color.setHex(0xc084fc);
        primaryLight.color.setHex(0xa855f7);
        secondaryLight.color.setHex(0x38bdf8);
      }

      // Layer Visibility Toggle
      starField.visible = layers.constellation;
      constellationLines.visible = layers.constellation;
      cyberWaveMesh.visible = layers.cyberWave;
      celestialGroup.visible = layers.celestialCore;

      // Smooth camera interpolation
      if (!prefersReducedMotion) {
        currentCameraX += (targetCameraX - currentCameraX) * 0.03;
        currentCameraY += (targetCameraY - currentCameraY) * 0.03;

        camera.position.x = currentCameraX;
        camera.position.y = 15 - currentCameraY;
        camera.lookAt(0, 0, 0);
      }

      // Update Shockwave Propagation
      if (shockwaveActive) {
        shockwaveRadius += delta * 320;
        if (shockwaveRadius > 450) {
          shockwaveActive = false;
        }
      }

      // -----------------------------------------------------------------------
      // ANIMATION 1: Update Stardust & Constellation Web with Cursor Repulsion
      // -----------------------------------------------------------------------
      if (layers.constellation) {
        const positions = starGeometry.attributes.position.array as Float32Array;

        for (let i = 0; i < starCount; i++) {
          const i3 = i * 3;

          // Natural slow drift
          positions[i3] += starVelocities[i3];
          positions[i3 + 1] += starVelocities[i3 + 1];
          positions[i3 + 2] += starVelocities[i3 + 2];

          // Wrap boundaries
          if (positions[i3 + 1] > 180) {
            positions[i3 + 1] = -180;
            positions[i3] = (Math.random() - 0.5) * 480;
          }

          // Cursor interactive repulsion in 3D
          const dx = positions[i3] - mouse3D.x;
          const dy = positions[i3 + 1] - mouse3D.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 4900 && distSq > 0) { // 70px radius
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 70) * 1.8;
            positions[i3] += (dx / dist) * force;
            positions[i3 + 1] += (dy / dist) * force;
          }

          // Shockwave ripple repulsion
          if (shockwaveActive) {
            const sx = positions[i3] - shockwaveOrigin.x;
            const sy = positions[i3 + 1] - shockwaveOrigin.y;
            const sDist = Math.sqrt(sx * sx + sy * sy);
            const diff = Math.abs(sDist - shockwaveRadius);
            if (diff < 35) {
              const sForce = (1 - diff / 35) * 4.5;
              positions[i3] += (sx / (sDist || 1)) * sForce;
              positions[i3 + 1] += (sy / (sDist || 1)) * sForce;
            }
          }
        }
        starGeometry.attributes.position.needsUpdate = true;

        // Calculate dynamic proximity lines between stars (constellation web)
        let lineIdx = 0;
        const linePos = lineGeometry.attributes.position.array as Float32Array;
        const maxDist = isMobile ? 38 : 48;

        for (let i = 0; i < starCount && lineIdx < maxLineSegments * 6; i++) {
          const i3 = i * 3;
          for (let j = i + 1; j < starCount && lineIdx < maxLineSegments * 6; j++) {
            const j3 = j * 3;
            const dX = positions[i3] - positions[j3];
            const dY = positions[i3 + 1] - positions[j3 + 1];
            const dZ = positions[i3 + 2] - positions[j3 + 2];
            const distSq = dX * dX + dY * dY + dZ * dZ;

            if (distSq < maxDist * maxDist) {
              linePos[lineIdx++] = positions[i3];
              linePos[lineIdx++] = positions[i3 + 1];
              linePos[lineIdx++] = positions[i3 + 2];

              linePos[lineIdx++] = positions[j3];
              linePos[lineIdx++] = positions[j3 + 1];
              linePos[lineIdx++] = positions[j3 + 2];
            }
          }
        }

        // Fill remaining segments with zeros
        while (lineIdx < maxLineSegments * 6) {
          linePos[lineIdx++] = 0;
        }
        lineGeometry.attributes.position.needsUpdate = true;
      }

      // -----------------------------------------------------------------------
      // ANIMATION 2: Update Cyber Wave Undulating Grid
      // -----------------------------------------------------------------------
      if (layers.cyberWave) {
        const wavePositions = wavePlaneGeo.attributes.position;
        for (let i = 0; i < wavePositions.count; i++) {
          const u = wavePositions.getX(i);
          const v = wavePositions.getY(i);

          // Complex dual-sine wave equation
          const waveElevation =
            Math.sin(u * 0.03 + time * 1.5) * 8.0 +
            Math.cos(v * 0.04 + time * 1.2) * 6.5 +
            Math.sin((u + v) * 0.02 + time * 0.8) * 4.0;

          // Interactive mouse height perturbation
          const dx = u - mouse3D.x * 0.7;
          const dy = v - mouse3D.y * 0.7;
          const mDist = Math.sqrt(dx * dx + dy * dy);
          const mouseLift = mDist < 90 ? Math.cos((mDist / 90) * Math.PI) * 12 : 0;

          wavePositions.setZ(i, waveElevation + mouseLift);
        }
        wavePlaneGeo.attributes.position.needsUpdate = true;
        wavePlaneGeo.computeVertexNormals();
      }

      // -----------------------------------------------------------------------
      // ANIMATION 3: Update Celestial Core & Dual Orbiting Rings
      // -----------------------------------------------------------------------
      if (layers.celestialCore) {
        coreIco.rotation.y = time * 0.35;
        coreIco.rotation.x = time * 0.22;

        coreOct.rotation.y = -time * 0.5;
        coreOct.rotation.z = time * 0.3;

        // Breathe pulsation
        const coreScale = 1 + Math.sin(time * 2.2) * 0.08;
        coreIco.scale.set(coreScale, coreScale, coreScale);

        // Orbital rings independent opposite precession
        ring1Mesh.rotation.z = time * 0.25;
        ring1Mesh.rotation.y = Math.sin(time * 0.3) * 0.4 + Math.PI / 6;

        ring2Mesh.rotation.z = -time * 0.2;
        ring2Mesh.rotation.x = Math.cos(time * 0.25) * 0.4 - Math.PI / 3;

        // Subtle core float in depth
        celestialGroup.position.y = 15 + Math.sin(time * 0.8) * 6;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      starGeometry.dispose();
      starMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      wavePlaneGeo.dispose();
      wavePlaneMat.dispose();
      coreIcoGeo.dispose();
      coreIcoMat.dispose();
      coreOctGeo.dispose();
      coreOctMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleTexture.dispose();
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
          background:
            colorTheme === 'cyan'
              ? 'radial-gradient(ellipse at 50% 30%, #06182a 0%, #030a14 70%, #010408 100%)'
              : colorTheme === 'emerald'
              ? 'radial-gradient(ellipse at 50% 30%, #051c14 0%, #020d0a 70%, #010604 100%)'
              : 'radial-gradient(ellipse at 50% 30%, #0e0724 0%, #05030a 70%, #030107 100%)',
          transition: 'background 0.8s ease',
        }}
        aria-hidden="true"
      />

      {/* =====================================================================
          INTERACTABLE 3D EXPERIENCE CONTROL HUB (Bottom-Right Floating Dock)
         ===================================================================== */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
        
        {/* Expanded Controls Panel */}
        <AnimatePresence>
          {hubOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-5 border border-purple-500/40 shadow-2xl shadow-purple-950/80 bg-[#080415]/90 backdrop-blur-2xl w-72 text-white space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">3D Universe Controls</span>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-800/40 px-2 py-0.5 rounded-full">
                  LIVE 3D
                </span>
              </div>

              {/* Action 1: Interactive Pulse Shockwave */}
              <div>
                <button
                  type="button"
                  onClick={() => shockwaveTriggerRef.current?.()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send 3D Pulse Shockwave</span>
                </button>
                <p className="text-[10px] text-zinc-400 mt-1 text-center">
                  Tip: Clicking anywhere on screen also sends ripples!
                </p>
              </div>

              {/* 3 Background Animation Layer Toggles */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Active 3D Animations
                </p>

                {/* Layer 1: Constellation Dust & Web */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveLayers((prev) => ({ ...prev, constellation: !prev.constellation }))
                  }
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    activeLayers.constellation
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Constellation Dust Web</span>
                  </span>
                  {activeLayers.constellation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Layer 2: Cyber Wave Grid */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveLayers((prev) => ({ ...prev, cyberWave: !prev.cyberWave }))
                  }
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    activeLayers.cyberWave
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5" />
                    <span>2. Cyber Wave Grid</span>
                  </span>
                  {activeLayers.cyberWave ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Layer 3: Celestial Core & Rings */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveLayers((prev) => ({ ...prev, celestialCore: !prev.celestialCore }))
                  }
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
                    activeLayers.celestialCore
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Orbit className="w-3.5 h-3.5" />
                    <span>3. Celestial Core & Rings</span>
                  </span>
                  {activeLayers.celestialCore ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Theme Color Picker */}
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                  Color Mode
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorTheme('purple')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      colorTheme === 'purple'
                        ? 'bg-purple-600/30 border-purple-400 text-white'
                        : 'bg-white/[0.04] border-white/10 text-zinc-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Nebula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTheme('cyan')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      colorTheme === 'cyan'
                        ? 'bg-cyan-600/30 border-cyan-400 text-white'
                        : 'bg-white/[0.04] border-white/10 text-zinc-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Cyan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTheme('emerald')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      colorTheme === 'emerald'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white'
                        : 'bg-white/[0.04] border-white/10 text-zinc-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Matrix</span>
                  </button>
                </div>
              </div>

              {/* Replay 3D Beam Intro Button */}
              {onReplayIntro && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setHubOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-purple-400 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Replay 3D Beam Intro</span>
                  </button>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Floating Trigger Pill */}
        <button
          type="button"
          onClick={() => setHubOpen((prev) => !prev)}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/40 hover:border-purple-400 text-xs font-bold text-white shadow-xl shadow-purple-950/90 backdrop-blur-xl transition-all cursor-pointer group active:scale-95"
          title="Interactive 3D Animations & Controls"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-purple-300 group-hover:text-white transition-colors">3D Experience</span>
          <Sliders className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
        </button>

      </div>
    </>
  );
}
