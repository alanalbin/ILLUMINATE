'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  EyeOff,
  RotateCcw,
  Compass,
  Zap,
  Globe,
  Rocket,
  Radio,
  Flame,
  Shield,
  Magnet,
  Maximize2,
} from 'lucide-react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export type AnimationMode = 'galaxy' | 'quantum' | 'warp' | 'matrix';
export type ForceMode = 'attract' | 'repel' | 'vortex';
export type ColorTheme = 'cyber' | 'solar' | 'aurora' | 'prism';

interface ThemeConfig {
  name: string;
  primary: THREE.Color;
  secondary: THREE.Color;
  accent: THREE.Color;
  bgGrad: string;
  pointLightColor: number;
}

const THEMES: Record<ColorTheme, ThemeConfig> = {
  cyber: {
    name: 'Cyber Neon',
    primary: new THREE.Color(0x00f0ff), // Electric Cyan
    secondary: new THREE.Color(0xa855f7), // Neon Violet
    accent: new THREE.Color(0x3b82f6), // Royal Blue
    bgGrad: 'radial-gradient(ellipse at 50% 35%, #0e0728 0%, #05030e 60%, #020106 100%)',
    pointLightColor: 0x00f0ff,
  },
  solar: {
    name: 'Solar Supernova',
    primary: new THREE.Color(0xf59e0b), // Amber Gold
    secondary: new THREE.Color(0xf43f5e), // Plasma Crimson
    accent: new THREE.Color(0x8b5cf6), // Violet Flare
    bgGrad: 'radial-gradient(ellipse at 50% 35%, #240a16 0%, #0b0307 60%, #020003 100%)',
    pointLightColor: 0xf59e0b,
  },
  aurora: {
    name: 'Quantum Aurora',
    primary: new THREE.Color(0x10b981), // Emerald Mint
    secondary: new THREE.Color(0x06b6d4), // Cyan Aqua
    accent: new THREE.Color(0x6366f1), // Electric Indigo
    bgGrad: 'radial-gradient(ellipse at 50% 35%, #031b1c 0%, #020a0d 60%, #000204 100%)',
    pointLightColor: 0x10b981,
  },
  prism: {
    name: 'Nebula Prism',
    primary: new THREE.Color(0xec4899), // Neon Fuchsia
    secondary: new THREE.Color(0x8b5cf6), // Cosmic Violet
    accent: new THREE.Color(0x38bdf8), // Sky Blue
    bgGrad: 'radial-gradient(ellipse at 50% 35%, #1d0726 0%, #09020e 60%, #020004 100%)',
    pointLightColor: 0xec4899,
  },
};

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<AnimationMode>('galaxy');
  const [forceMode, setForceMode] = useState<ForceMode>('attract');
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>('cyber');
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [supernovaCount, setSupernovaCount] = useState<number>(0);
  const [particleCount, setParticleCount] = useState<number>(14000);

  // Thread refs for 60fps loop communication without re-triggering effect
  const modeRef = useRef<AnimationMode>(currentMode);
  const forceRef = useRef<ForceMode>(forceMode);
  const themeRef = useRef<ColorTheme>(currentTheme);
  const triggerSupernovaRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    modeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    forceRef.current = forceMode;
  }, [forceMode]);

  useEffect(() => {
    themeRef.current = currentTheme;
  }, [currentTheme]);

  const handleSupernova = useCallback(() => {
    if (triggerSupernovaRef.current) {
      triggerSupernovaRef.current();
      setSupernovaCount((c) => c + 1);
    }
  }, []);

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

    const isMobile = window.innerWidth < 768;
    const totalParticles = isMobile ? 8000 : 16000;
    setParticleCount(totalParticles);

    // 2. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030208, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.set(0, 35, 130);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    if (!isMobile) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
    }
    container.appendChild(renderer.domElement);

    // 3. Dynamic Ambient & Central Lights
    const ambientLight = new THREE.AmbientLight(0x0e0720, 2.0);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(THEMES[themeRef.current].pointLightColor, 5.0, 450);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const cursorLight = new THREE.PointLight(0x00f0ff, 3.5, 300);
    cursorLight.position.set(0, 0, 60);
    scene.add(cursorLight);

    // 4. Custom Particle Texture Sprite (High-glow starburst with soft corona)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.18, 'rgba(235, 248, 255, 0.95)');
      grad.addColorStop(0.42, 'rgba(140, 180, 255, 0.5)');
      grad.addColorStop(0.75, 'rgba(90, 40, 160, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // 5. Particle Systems: Volumetric Multi-Modal Coordinate Arrays
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const velocities = new Float32Array(totalParticles * 3);
    const origPositions = new Float32Array(totalParticles * 3);
    const seedAngles = new Float32Array(totalParticles);
    const seedDistances = new Float32Array(totalParticles);
    const seedSpeeds = new Float32Array(totalParticles);
    const seedArms = new Float32Array(totalParticles);

    const initialTheme = THEMES[themeRef.current];

    // Initialize Galaxy Spiral & Volumetric Coordinates
    const spiralArms = 3;
    const maxRadius = 140;

    for (let i = 0; i < totalParticles; i++) {
      const i3 = i * 3;

      // Distribute along spiral galaxy arms with organic thickness
      const armIndex = i % spiralArms;
      const armAngle = (armIndex * (Math.PI * 2)) / spiralArms;
      const distRatio = Math.pow(Math.random(), 1.6); // Concentrated near core
      const distance = 8 + distRatio * maxRadius;
      const angle = armAngle + distance * 0.08 + (Math.random() - 0.5) * 0.65;

      const spreadY = (Math.random() - 0.5) * (18 * (1 - distRatio * 0.4));
      const spreadX = (Math.random() - 0.5) * (10 * (1 - distRatio * 0.5));
      const spreadZ = (Math.random() - 0.5) * (10 * (1 - distRatio * 0.5));

      const x = Math.cos(angle) * distance + spreadX;
      const y = spreadY;
      const z = Math.sin(angle) * distance + spreadZ;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      origPositions[i3] = x;
      origPositions[i3 + 1] = y;
      origPositions[i3 + 2] = z;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      seedAngles[i] = angle;
      seedDistances[i] = distance;
      seedSpeeds[i] = (0.2 + (1 - distRatio) * 0.8) * (0.8 + Math.random() * 0.4);
      seedArms[i] = armIndex;

      // Color gradation from core to arm edges
      const colorRatio = Math.min(1, Math.max(0, distance / maxRadius));
      const col = new THREE.Color().lerpColors(
        initialTheme.primary,
        initialTheme.secondary,
        colorRatio
      );

      // Core stars are brighter & whiter
      if (distRatio < 0.15) {
        col.lerp(new THREE.Color(0xffffff), 0.55);
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.4 : 3.9,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);

    // 6. Central Holographic Quantum Core (Multi-ring Gyroscopic Relic)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0);
    scene.add(coreGroup);

    // Outer Gyro-Ring 1
    const ringGeo1 = new THREE.TorusGeometry(18, 0.45, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: initialTheme.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    coreGroup.add(ringMesh1);

    // Outer Gyro-Ring 2 (Offset angle)
    const ringGeo2 = new THREE.TorusGeometry(15, 0.35, 16, 90);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: initialTheme.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 3;
    ringMesh2.rotation.y = Math.PI / 4;
    coreGroup.add(ringMesh2);

    // Inner Holographic Icosahedron Shell
    const shellGeo = new THREE.IcosahedronGeometry(9.5, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: initialTheme.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    coreGroup.add(shellMesh);

    // Inner Glowing Plasma Star Sphere
    const innerStarGeo = new THREE.SphereGeometry(4.5, 32, 32);
    const innerStarMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const innerStarMesh = new THREE.Mesh(innerStarGeo, innerStarMat);
    coreGroup.add(innerStarMesh);

    // 7. Interactive Constellation Lines (for Quantum Nexus mode)
    const maxLineConnections = isMobile ? 120 : 350;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    constellationLines.visible = false;
    scene.add(constellationLines);

    // 8. Supernova Shockwave Expanding Halo
    const shockwaveGeo = new THREE.RingGeometry(0.8, 2.5, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: initialTheme.primary,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = -Math.PI / 2;
    scene.add(shockwaveMesh);

    let supernovaActive = false;
    let supernovaProgress = 0;
    const supernovaOrigin = new THREE.Vector3(0, 0, 0);

    const triggerSupernova = () => {
      supernovaActive = true;
      supernovaProgress = 0;
      shockwaveMesh.scale.set(1, 1, 1);
      shockwaveMat.opacity = 1.0;
      shockwaveMesh.position.copy(supernovaOrigin);
      coreLight.intensity = 15.0;
    };
    triggerSupernovaRef.current = triggerSupernova;

    // 9. Input & Interactive Orbit Controls
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    let isPointerDown = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 2.3;
    let cameraRadius = 140;
    let targetCameraRadius = 140;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;

      if (isPointerDown) {
        const deltaX = clientX - previousPointerX;
        const deltaY = clientY - previousPointerY;

        sphericalTheta -= deltaX * 0.006;
        sphericalPhi = Math.max(0.15, Math.min(Math.PI - 0.15, sphericalPhi + deltaY * 0.005));

        previousPointerX = clientX;
        previousPointerY = clientY;
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      // Don't capture when clicking on interactive HUD controls
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-interactive-hud="true"]')) return;

      isPointerDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-interactive-hud="true"]')) return;

      // Set supernova origin to current mouse intersection plane in 3D
      raycaster.setFromCamera(mouse, camera);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, hitPoint);
      supernovaOrigin.copy(hitPoint);
      triggerSupernova();
      setSupernovaCount((c) => c + 1);
    };

    const onWheel = (e: WheelEvent) => {
      targetCameraRadius = Math.max(60, Math.min(240, targetCameraRadius + e.deltaY * 0.08));
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onResize);

    // 10. High-Performance Render Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      // Project mouse into 3D plane
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);
      cursorLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 15);

      // Smooth camera orbit positioning with inertia damping
      cameraRadius += (targetCameraRadius - cameraRadius) * 0.05;
      const targetCamX = cameraRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      const targetCamY = cameraRadius * Math.cos(sphericalPhi);
      const targetCamZ = cameraRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);

      // Add gentle autonomous floating drift when idle
      const idleDriftX = Math.sin(elapsedTime * 0.15) * 6;
      const idleDriftY = Math.cos(elapsedTime * 0.2) * 4;

      camera.position.x += (targetCamX + idleDriftX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY + idleDriftY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate Holographic Quantum Artifact
      const activeTheme = THEMES[themeRef.current];
      ringMat1.color.lerp(activeTheme.primary, 0.08);
      ringMat2.color.lerp(activeTheme.secondary, 0.08);
      shellMat.color.lerp(activeTheme.accent, 0.08);
      coreLight.color.lerp(activeTheme.primary, 0.08);
      cursorLight.color.lerp(activeTheme.primary, 0.08);
      shockwaveMat.color.lerp(activeTheme.primary, 0.08);

      coreLight.intensity = Math.max(4.0, coreLight.intensity * 0.94);

      ringMesh1.rotation.z += delta * 0.55;
      ringMesh1.rotation.x += delta * 0.35;
      ringMesh2.rotation.y -= delta * 0.7;
      ringMesh2.rotation.z += delta * 0.45;
      shellMesh.rotation.x += delta * 0.4;
      shellMesh.rotation.y += delta * 0.6;

      // Core breathes with quantum pulse
      const breatheScale = 1.0 + Math.sin(elapsedTime * 2.8) * 0.08;
      shellMesh.scale.set(breatheScale, breatheScale, breatheScale);

      // Artifact tilts toward cursor
      coreGroup.rotation.x = mouse.y * 0.35;
      coreGroup.rotation.y = -mouse.x * 0.45;

      // Current dynamics mode & force behavior
      const mode = modeRef.current;
      const force = forceRef.current;
      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const colAttr = particleGeometry.getAttribute('color') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      const cursorInfluenceRadius = isMobile ? 38 : 52;
      const cursorInfluenceRadiusSq = cursorInfluenceRadius * cursorInfluenceRadius;

      // Handle Constellation Network Visibility
      constellationLines.visible = mode === 'quantum';
      let lineVertexIdx = 0;

      for (let i = 0; i < totalParticles; i++) {
        const i3 = i * 3;
        let px = posArr[i3];
        let py = posArr[i3 + 1];
        let pz = posArr[i3 + 2];

        const ox = origPositions[i3];
        const oy = origPositions[i3 + 1];
        const oz = origPositions[i3 + 2];

        // 1. Base Motion per Mode
        if (mode === 'galaxy') {
          // Double-spiral rotational velocity around galaxy core
          const speed = seedSpeeds[i] * 0.4;
          const currentAngle = seedAngles[i] + elapsedTime * speed;
          const dist = seedDistances[i];

          const targetX = Math.cos(currentAngle) * dist + Math.sin(elapsedTime * 0.5 + i) * 1.5;
          const targetZ = Math.sin(currentAngle) * dist + Math.cos(elapsedTime * 0.5 + i) * 1.5;
          const targetY = oy + Math.sin(elapsedTime * 1.2 + dist * 0.05) * 3.5;

          px += (targetX - px) * 0.08;
          py += (targetY - py) * 0.08;
          pz += (targetZ - pz) * 0.08;
        } else if (mode === 'quantum') {
          // Floating interconnected neural nodes
          const waveA = Math.sin(elapsedTime * 0.8 + ox * 0.03) * 5.0;
          const waveB = Math.cos(elapsedTime * 0.9 + oz * 0.03) * 5.0;
          const targetY = oy + waveA + waveB;
          const targetX = ox + Math.sin(elapsedTime * 0.6 + i) * 2.0;
          const targetZ = oz + Math.cos(elapsedTime * 0.6 + i) * 2.0;

          px += (targetX - px) * 0.06;
          py += (targetY - py) * 0.06;
          pz += (targetZ - pz) * 0.06;

          // Connect nearby constellation nodes
          if (lineVertexIdx < maxLineConnections * 6 && i % 38 === 0) {
            const nextIdx = (i + 19) % totalParticles;
            const n3 = nextIdx * 3;
            const nX = posArr[n3];
            const nY = posArr[n3 + 1];
            const nZ = posArr[n3 + 2];

            const lineDistSq =
              (px - nX) * (px - nX) + (py - nY) * (py - nY) + (pz - nZ) * (pz - nZ);

            if (lineDistSq < 600) {
              const lArr = linePositions;
              const lcArr = lineColors;

              lArr[lineVertexIdx] = px;
              lArr[lineVertexIdx + 1] = py;
              lArr[lineVertexIdx + 2] = pz;
              lArr[lineVertexIdx + 3] = nX;
              lArr[lineVertexIdx + 4] = nY;
              lArr[lineVertexIdx + 5] = nZ;

              lcArr[lineVertexIdx] = activeTheme.primary.r;
              lcArr[lineVertexIdx + 1] = activeTheme.primary.g;
              lcArr[lineVertexIdx + 2] = activeTheme.primary.b;
              lcArr[lineVertexIdx + 3] = activeTheme.secondary.r;
              lcArr[lineVertexIdx + 4] = activeTheme.secondary.g;
              lcArr[lineVertexIdx + 5] = activeTheme.secondary.b;

              lineVertexIdx += 6;
            }
          }
        } else if (mode === 'warp') {
          // Hyperspace stream: stars accelerate through camera z-plane
          const warpSpeed = 160.0;
          let newZ = pz + delta * warpSpeed;
          if (newZ > 140) {
            newZ = -220 - Math.random() * 80;
            px = (Math.random() - 0.5) * 160;
            py = (Math.random() - 0.5) * 120;
          }
          pz = newZ;
        } else if (mode === 'matrix') {
          // Holographic undulating cyber-grid terrain
          const waveHeight =
            Math.sin(ox * 0.08 + elapsedTime * 2.2) * 8.0 +
            Math.cos(oz * 0.08 + elapsedTime * 1.8) * 8.0;
          px += (ox - px) * 0.08;
          py += (oy - 25 + waveHeight - py) * 0.08;
          pz += (oz - pz) * 0.08;
        }

        // 2. Cursor Force Field Physics (Attract, Repel, Vortex)
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dz = pz - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < cursorInfluenceRadiusSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const forceFactor = (1.0 - dist / cursorInfluenceRadius) * 22.0 * delta;

          if (force === 'attract') {
            // Gravitational suction toward cursor
            px -= (dx / dist) * forceFactor * 14.0;
            py -= (dy / dist) * forceFactor * 14.0;
            pz -= (dz / dist) * forceFactor * 14.0;
          } else if (force === 'repel') {
            // Kinetic deflector force field
            px += (dx / dist) * forceFactor * 24.0;
            py += (dy / dist) * forceFactor * 24.0;
            pz += (dz / dist) * forceFactor * 18.0;
          } else if (force === 'vortex') {
            // Angular whirlpool rotation around cursor
            const angleSpeed = 18.0 * (1.0 - dist / cursorInfluenceRadius) * delta;
            const perpX = -dy;
            const perpY = dx;
            px += perpX * angleSpeed;
            py += perpY * angleSpeed;
            pz += Math.sin(dist * 0.2) * 8.0 * delta;
          }

          // Dynamic particle illumination around cursor
          colArr[i3] = activeTheme.primary.r;
          colArr[i3 + 1] = activeTheme.primary.g;
          colArr[i3 + 2] = activeTheme.primary.b;
        } else {
          // Smooth return to base theme color
          const baseCol = new THREE.Color().lerpColors(
            activeTheme.primary,
            activeTheme.secondary,
            Math.abs(px) / 100
          );
          colArr[i3] += (baseCol.r - colArr[i3]) * 0.04;
          colArr[i3 + 1] += (baseCol.g - colArr[i3 + 1]) * 0.04;
          colArr[i3 + 2] += (baseCol.b - colArr[i3 + 2]) * 0.04;
        }

        // 3. Supernova Explosive Shockwave Propagation
        if (supernovaActive) {
          const swDx = px - supernovaOrigin.x;
          const swDy = py - supernovaOrigin.y;
          const swDz = pz - supernovaOrigin.z;
          const swDist = Math.sqrt(swDx * swDx + swDy * swDy + swDz * swDz);
          const currentRadius = supernovaProgress * 150.0;
          const ringThickness = 22.0;

          if (Math.abs(swDist - currentRadius) < ringThickness) {
            const intensity =
              (1.0 - Math.abs(swDist - currentRadius) / ringThickness) *
              (1.0 - supernovaProgress);
            px += (swDx / (swDist || 1)) * intensity * 26.0;
            py += (swDy / (swDist || 1)) * intensity * 26.0;
            pz += (swDz / (swDist || 1)) * intensity * 26.0;

            // Flash supernova blast color
            colArr[i3] = 1.0;
            colArr[i3 + 1] = 0.95;
            colArr[i3 + 2] = 0.9;
          }
        }

        posArr[i3] = px;
        posArr[i3 + 1] = py;
        posArr[i3 + 2] = pz;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Update Constellation Lines Buffer
      if (mode === 'quantum') {
        const lPosAttr = lineGeometry.getAttribute('position') as THREE.BufferAttribute;
        const lColAttr = lineGeometry.getAttribute('color') as THREE.BufferAttribute;
        lineGeometry.setDrawRange(0, lineVertexIdx / 3);
        lPosAttr.needsUpdate = true;
        lColAttr.needsUpdate = true;
      }

      // Progress Supernova Ring
      if (supernovaActive) {
        supernovaProgress += delta * 1.6;
        const currentScale = 1.0 + supernovaProgress * 75.0;
        shockwaveMesh.scale.set(currentScale, currentScale, currentScale);
        shockwaveMat.opacity = Math.max(0, 0.95 * (1.0 - supernovaProgress));

        if (supernovaProgress >= 1.0) {
          supernovaActive = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      innerStarGeo.dispose();
      innerStarMat.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#04020a]"
        aria-hidden="true"
      />
    );
  }

  const activeThemeData = THEMES[currentTheme];

  return (
    <>
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-auto z-0 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          background: activeThemeData.bgGrad,
          transition: 'background 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden="true"
      />

      {/* Interactive 3D Control Console Dock (Bottom-Right Glassmorphic HUD) */}
      <div
        data-interactive-hud="true"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 font-sans pointer-events-auto select-none"
      >
        {/* Supernova Blast Status Pill */}
        {supernovaCount > 0 && (
          <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-400/50 px-3 py-1 rounded-full backdrop-blur-xl animate-pulse shadow-glow-cyan">
            Quantum Burst • {supernovaCount}
          </div>
        )}

        {/* Collapsed Pill */}
        {hudCollapsed ? (
          <button
            onClick={() => setHudCollapsed(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 hover:bg-black/95 border border-cyan-400/40 text-cyan-300 text-xs font-semibold backdrop-blur-2xl shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Expand 3D Console"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D Controls</span>
            <Maximize2 className="w-3 h-3 text-cyan-400/70" />
          </button>
        ) : (
          /* Expanded Cyber Glassmorphic Console */
          <div className="relative rounded-2xl bg-[#090514]/90 border border-purple-500/35 p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5 w-72 transition-all ring-1 ring-white/5">
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-purple-200">
                  ILLUMINATE 3D ENGINE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {particleCount / 1000}k Stars
                </span>
                <button
                  onClick={() => setHudCollapsed(true)}
                  className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamics Mode Switcher */}
            <div>
              <div className="text-[10px] text-purple-300/80 font-mono uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Simulation Topology</span>
                <span className="text-cyan-400 capitalize">{currentMode}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'galaxy' as AnimationMode, label: 'Galaxy', icon: Compass },
                  { id: 'quantum' as AnimationMode, label: 'Nexus', icon: Radio },
                  { id: 'warp' as AnimationMode, label: 'Warp', icon: Rocket },
                  { id: 'matrix' as AnimationMode, label: 'Matrix', icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentMode(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-b from-cyan-500/30 to-purple-600/30 border border-cyan-400 text-white shadow-glow-cyan-sm'
                          : 'bg-purple-950/30 hover:bg-purple-900/40 border border-purple-900/40 text-purple-300'
                      }`}
                      title={`${item.label} Topology`}
                    >
                      <Icon className={`w-3.5 h-3.5 mb-1 ${isActive ? 'text-cyan-300' : 'text-purple-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cursor Force Field Selector (Attract, Repel, Vortex) */}
            <div className="border-t border-purple-900/30 pt-2">
              <div className="text-[10px] text-purple-300/80 font-mono uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Cursor Force Field</span>
                <span className="text-purple-300 capitalize">{forceMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'attract' as ForceMode, label: 'Attract', icon: Magnet },
                  { id: 'repel' as ForceMode, label: 'Repel', icon: Shield },
                  { id: 'vortex' as ForceMode, label: 'Vortex', icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = forceMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setForceMode(item.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-600/40 border border-purple-400 text-white shadow-sm'
                          : 'bg-purple-950/30 hover:bg-purple-900/40 border border-purple-900/30 text-purple-300/80'
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-300' : 'text-purple-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center justify-between border-t border-purple-900/30 pt-2">
              <span className="text-[10px] text-purple-300/80 font-mono uppercase tracking-wider">
                Palette
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'cyber' as ColorTheme, name: 'Cyber Neon', bg: 'bg-cyan-400' },
                  { id: 'solar' as ColorTheme, name: 'Solar Supernova', bg: 'bg-amber-400' },
                  { id: 'aurora' as ColorTheme, name: 'Quantum Aurora', bg: 'bg-emerald-400' },
                  { id: 'prism' as ColorTheme, name: 'Nebula Prism', bg: 'bg-pink-500' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTheme(t.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      currentTheme === t.id
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                    title={t.name}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${t.bg}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Supernova Burst & Replay Intro */}
            <div className="flex items-center gap-2 border-t border-purple-900/30 pt-2">
              <button
                onClick={handleSupernova}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-purple-950/80 hover:from-cyan-900 hover:to-purple-900 border border-cyan-400/60 text-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Supernova Burst</span>
              </button>
              {onReplayIntro && (
                <button
                  onClick={onReplayIntro}
                  className="p-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 hover:text-white transition-all cursor-pointer"
                  title="Replay 3D Beam Intro"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interaction Hints */}
            <div className="text-[9px] text-purple-300/50 font-mono text-center tracking-tight">
              Drag to Orbit 360° • Click to Blast • Scroll to Zoom
            </div>
          </div>
        )}
      </div>
    </>
  );
}
