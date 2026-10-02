'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Zap,
  Activity,
  Layers,
  Cpu,
  Flame,
  Radio,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface Interactive3DPrismProps {
  className?: string;
}

type TopologyType = 'knot' | 'spark' | 'lattice' | 'singularity';
type PillarType = 'ideate' | 'validate' | 'prototype' | 'scale';

interface PillarConfig {
  name: string;
  tagline: string;
  themeColor: string;
  hexColor: number;
  emissiveHex: number;
  accentHex: number;
  frequency: string;
  metric: string;
  metricLabel: string;
}

const PILLARS: Record<PillarType, PillarConfig> = {
  ideate: {
    name: 'Ideate',
    tagline: 'Problem Validation & Market Need',
    themeColor: 'from-violet-500 to-purple-600',
    hexColor: 0x9333ea,
    emissiveHex: 0x581c87,
    accentHex: 0xc084fc,
    frequency: '540 THz',
    metric: '94%',
    metricLabel: 'Opportunity Match',
  },
  validate: {
    name: 'Validate',
    tagline: 'Unit Economics, CAC & LTV',
    themeColor: 'from-cyan-400 to-blue-600',
    hexColor: 0x06b6d4,
    emissiveHex: 0x0e7490,
    accentHex: 0x38bdf8,
    frequency: '680 THz',
    metric: '3.4x',
    metricLabel: 'LTV:CAC Target',
  },
  prototype: {
    name: 'Prototype',
    tagline: 'Rapid MVP & Lean Architecture',
    themeColor: 'from-emerald-400 to-teal-600',
    hexColor: 0x10b981,
    emissiveHex: 0x065f46,
    accentHex: 0x34d399,
    frequency: '590 THz',
    metric: '< 48h',
    metricLabel: 'Sprint Velocity',
  },
  scale: {
    name: 'Scale',
    tagline: 'Venture Pitching & Traction Loops',
    themeColor: 'from-amber-400 to-orange-600',
    hexColor: 0xf59e0b,
    emissiveHex: 0x78350f,
    accentHex: 0xfbbf24,
    frequency: '450 THz',
    metric: '10x',
    metricLabel: 'Growth Potential',
  },
};

export default function Interactive3DPrism({ className = '' }: Interactive3DPrismProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interactive UI State
  const [selectedTopology, setSelectedTopology] = useState<TopologyType>('knot');
  const [activePillar, setActivePillar] = useState<PillarType>('ideate');
  const [isDisrupted, setIsDisrupted] = useState(false);
  const [disruptCooldown, setDisruptCooldown] = useState(false);
  const [energySurges, setEnergySurges] = useState(0);
  const [livePulse, setLivePulse] = useState(false);

  // Callbacks to interact with Three.js scene
  const switchTopologyRef = useRef<((t: TopologyType) => void) | null>(null);
  const triggerDisruptRef = useRef<(() => void) | null>(null);
  const triggerSurgeRef = useRef<(() => void) | null>(null);
  const updateColorsRef = useRef<((pillar: PillarConfig) => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 480;
    const height = mount.clientHeight || 320;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 2. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x180b2c, 1.4);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(PILLARS.ideate.hexColor, 3.8, 25);
    primaryLight.position.set(6, 6, 6);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(PILLARS.ideate.accentHex, 3.0, 25);
    secondaryLight.position.set(-6, -6, 5);
    scene.add(secondaryLight);

    const cursorFollowerLight = new THREE.PointLight(0xffffff, 2.5, 18);
    cursorFollowerLight.position.set(0, 0, 7);
    scene.add(cursorFollowerLight);

    // 3. Levitation & Gravity Group
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // =========================================================================
    // 4. TOPOLOGICAL MORPH GEOMETRIES (Knot, Spark, Lattice, Singularity)
    // =========================================================================
    // 4A. Hyperloop Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.44, 100, 16, 2, 3);
    const knotMat = new THREE.MeshPhongMaterial({
      color: PILLARS.ideate.hexColor,
      emissive: PILLARS.ideate.emissiveHex,
      specular: 0xffffff,
      shininess: 90,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    reactorGroup.add(knotMesh);

    // Wireframe overlay for Knot
    const knotWireGeo = knotGeo;
    const knotWireMat = new THREE.MeshBasicMaterial({
      color: PILLARS.ideate.accentHex,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const knotWireMesh = new THREE.Mesh(knotWireGeo, knotWireMat);
    knotMesh.add(knotWireMesh);

    // 4B. Quantum Spark (Faceted Icosahedron)
    const sparkGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const sparkMat = new THREE.MeshPhongMaterial({
      color: PILLARS.ideate.hexColor,
      emissive: PILLARS.ideate.emissiveHex,
      specular: 0xffffff,
      shininess: 100,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sparkMesh.scale.set(0.001, 0.001, 0.001);
    sparkMesh.visible = false;
    reactorGroup.add(sparkMesh);

    const sparkWireMat = new THREE.MeshBasicMaterial({
      color: PILLARS.ideate.accentHex,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const sparkWireMesh = new THREE.Mesh(sparkGeo, sparkWireMat);
    sparkMesh.add(sparkWireMesh);

    // 4C. Neural Matrix (Geodesic Dodecahedron)
    const latticeGeo = new THREE.DodecahedronGeometry(2.1, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: PILLARS.ideate.accentHex,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    latticeMesh.scale.set(0.001, 0.001, 0.001);
    latticeMesh.visible = false;
    reactorGroup.add(latticeMesh);

    // Inner glowing core for lattice
    const innerSphereGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const innerSphereMesh = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    latticeMesh.add(innerSphereMesh);

    // 4D. Singularity Core (Dual Octahedron)
    const singGeo = new THREE.OctahedronGeometry(2.0, 0);
    const singMat = new THREE.MeshPhongMaterial({
      color: PILLARS.ideate.hexColor,
      emissive: PILLARS.ideate.emissiveHex,
      specular: 0xffffff,
      shininess: 110,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });
    const singMesh = new THREE.Mesh(singGeo, singMat);
    singMesh.scale.set(0.001, 0.001, 0.001);
    singMesh.visible = false;
    reactorGroup.add(singMesh);

    const singInnerGeo = new THREE.OctahedronGeometry(1.2, 0);
    const singInnerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    const singInnerMesh = new THREE.Mesh(singInnerGeo, singInnerMat);
    singMesh.add(singInnerMesh);

    const meshes: Record<TopologyType, THREE.Mesh> = {
      knot: knotMesh,
      spark: sparkMesh,
      lattice: latticeMesh,
      singularity: singMesh,
    };

    let activeMesh: THREE.Mesh = knotMesh;
    let targetMesh: THREE.Mesh = knotMesh;

    switchTopologyRef.current = (nextTopology: TopologyType) => {
      const nextMesh = meshes[nextTopology];
      if (nextMesh === targetMesh) return;

      targetMesh = nextMesh;
      targetMesh.visible = true;
      targetMesh.scale.set(0.1, 0.1, 0.1);

      // Trigger transition energy flash
      primaryLight.intensity = 8.0;
      secondaryLight.intensity = 6.0;
    };

    // =========================================================================
    // 5. MAGNETIC CONTAINMENT RINGS & ORBITAL SATELLITE PROBES
    // =========================================================================
    const ringGroup = new THREE.Group();
    reactorGroup.add(ringGroup);

    const ring1Geo = new THREE.TorusGeometry(3.1, 0.04, 12, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: PILLARS.ideate.accentHex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ringGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(3.5, 0.035, 12, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2.5;
    ringGroup.add(ring2Mesh);

    // Orbital satellite probes
    const satCount = 6;
    const satellites: THREE.Mesh[] = [];
    const satGeo = new THREE.OctahedronGeometry(0.18, 0);
    const satMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      reactorGroup.add(sat);
      satellites.push(sat);
    }

    // =========================================================================
    // 6. QUANTUM DISRUPTION PARTICLES (Explode & Magnetic Recall Physics)
    // =========================================================================
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleHomePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Home positions form a spherical cloud around the core
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 2.4 + Math.random() * 0.8;

      const hx = Math.sin(phi) * Math.cos(theta) * radius;
      const hy = Math.sin(phi) * Math.sin(theta) * radius;
      const hz = Math.cos(phi) * radius;

      particleHomePositions[i * 3] = hx;
      particleHomePositions[i * 3 + 1] = hy;
      particleHomePositions[i * 3 + 2] = hz;

      particlePositions[i * 3] = hx;
      particlePositions[i * 3 + 1] = hy;
      particlePositions[i * 3 + 2] = hz;

      particleVelocities[i * 3] = 0;
      particleVelocities[i * 3 + 1] = 0;
      particleVelocities[i * 3 + 2] = 0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Glowing particle texture
    const discCanvas = document.createElement('canvas');
    discCanvas.width = 32;
    discCanvas.height = 32;
    const discCtx = discCanvas.getContext('2d');
    if (discCtx) {
      const grad = discCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(192, 132, 252, 0.9)');
      grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      discCtx.fillStyle = grad;
      discCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(discCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    reactorGroup.add(particleSystem);

    let isExploded = false;
    let explodeTimer = 0;

    triggerDisruptRef.current = () => {
      isExploded = true;
      explodeTimer = 1.0;

      // Blast particles outward radially
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const norm = new THREE.Vector3(
          particleHomePositions[i3] + (Math.random() - 0.5) * 1.5,
          particleHomePositions[i3 + 1] + (Math.random() - 0.5) * 1.5,
          particleHomePositions[i3 + 2] + (Math.random() - 0.5) * 1.5
        ).normalize();

        const speed = 0.25 + Math.random() * 0.35;
        particleVelocities[i3] = norm.x * speed;
        particleVelocities[i3 + 1] = norm.y * speed;
        particleVelocities[i3 + 2] = norm.z * speed;
      }

      // Flash scene light
      primaryLight.intensity = 10.0;
      secondaryLight.intensity = 9.0;
    };

    triggerSurgeRef.current = () => {
      primaryLight.intensity = 8.5;
      secondaryLight.intensity = 7.5;
      ring1Mat.opacity = 0.9;
      ring2Mat.opacity = 0.9;
    };

    updateColorsRef.current = (pillar: PillarConfig) => {
      primaryLight.color.setHex(pillar.hexColor);
      secondaryLight.color.setHex(pillar.accentHex);

      knotMat.color.setHex(pillar.hexColor);
      knotMat.emissive.setHex(pillar.emissiveHex);
      knotWireMat.color.setHex(pillar.accentHex);

      sparkMat.color.setHex(pillar.hexColor);
      sparkMat.emissive.setHex(pillar.emissiveHex);
      sparkWireMat.color.setHex(pillar.accentHex);

      latticeMat.color.setHex(pillar.accentHex);

      singMat.color.setHex(pillar.hexColor);
      singMat.emissive.setHex(pillar.emissiveHex);

      ring1Mat.color.setHex(pillar.accentHex);
    };

    // =========================================================================
    // 7. MAGNETIC CURSOR GRAVITY PHYSICS & HOVER INTERACTION
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      targetX = (clientX / width - 0.5) * 2;
      targetY = (clientY / height - 0.5) * 2;

      // Project light to cursor
      cursorFollowerLight.position.set(targetX * 4, -targetY * 3, 5);
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const onPointerDown = () => {
      triggerSurgeRef.current?.();
      setEnergySurges((c) => c + 1);
    };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerleave', onPointerLeave);
    mount.addEventListener('pointerdown', onPointerDown);

    // =========================================================================
    // 8. 60FPS KINETIC RENDER LOOP
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Magnetic Levitation & Cursor Gravity Tracking
      mouseX += (targetX - mouseX) * 0.07;
      mouseY += (targetY - mouseY) * 0.07;

      // The core levitates and leans towards the cursor with spring inertia
      reactorGroup.rotation.y = time * 0.35 + mouseX * 0.85;
      reactorGroup.rotation.x = mouseY * 0.65 + Math.sin(time * 0.8) * 0.12;
      reactorGroup.position.x = mouseX * 0.6;
      reactorGroup.position.y = -mouseY * 0.5 + Math.sin(time * 1.5) * 0.15;

      // Smooth Morph Scaling Transition
      Object.keys(meshes).forEach((key) => {
        const m = meshes[key as TopologyType];
        if (m === targetMesh) {
          if (m.scale.x < 1.0) {
            const nextScale = THREE.MathUtils.lerp(m.scale.x, 1.0, 0.12);
            m.scale.set(nextScale, nextScale, nextScale);
          }
        } else {
          if (m.scale.x > 0.005) {
            const nextScale = THREE.MathUtils.lerp(m.scale.x, 0.0, 0.15);
            m.scale.set(nextScale, nextScale, nextScale);
          } else {
            m.visible = false;
          }
        }
      });

      // Internal Shape Extra Rotations
      if (activeMesh === knotMesh) {
        knotMesh.rotation.z = time * 0.2;
      } else if (activeMesh === singMesh) {
        singInnerMesh.rotation.y = -time * 1.2;
        singInnerMesh.rotation.z = time * 0.8;
      }

      // Magnetic rings dynamic counter-rotation
      ring1Mesh.rotation.z = time * 0.45;
      ring2Mesh.rotation.y = -time * 0.55;
      ringGroup.rotation.x = mouseY * 0.3;

      // Orbiting satellite probes
      satellites.forEach((sat, i) => {
        const angle = time * 1.4 + (i * Math.PI * 2) / satCount;
        const orbitRadius = 3.6 + Math.sin(time * 2.0 + i) * 0.25;
        sat.position.set(
          Math.cos(angle) * orbitRadius,
          Math.sin(angle * 1.2) * 1.1 + mouseY * 0.4,
          Math.sin(angle) * orbitRadius
        );
        sat.rotation.x = time * 3;
        sat.rotation.y = time * 2;
      });

      // -----------------------------------------------------------------------
      // Disruption Particle Physics (Explosion -> Spring Recall)
      // -----------------------------------------------------------------------
      const posArray = particleGeo.attributes.position.array as Float32Array;

      if (isExploded) {
        explodeTimer -= delta * 0.65;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Apply velocity
          posArray[i3] += particleVelocities[i3];
          posArray[i3 + 1] += particleVelocities[i3 + 1];
          posArray[i3 + 2] += particleVelocities[i3 + 2];

          // Magnetic spring force pulling particles back home
          const hx = particleHomePositions[i3];
          const hy = particleHomePositions[i3 + 1];
          const hz = particleHomePositions[i3 + 2];

          const springStrength = 0.09;
          particleVelocities[i3] += (hx - posArray[i3]) * springStrength;
          particleVelocities[i3 + 1] += (hy - posArray[i3 + 1]) * springStrength;
          particleVelocities[i3 + 2] += (hz - posArray[i3 + 2]) * springStrength;

          // Friction damping
          particleVelocities[i3] *= 0.88;
          particleVelocities[i3 + 1] *= 0.88;
          particleVelocities[i3 + 2] *= 0.88;
        }

        particleGeo.attributes.position.needsUpdate = true;

        if (explodeTimer <= 0) {
          isExploded = false;
        }
      } else {
        // Subtle ambient harmonic pulsation
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const hx = particleHomePositions[i3];
          const hy = particleHomePositions[i3 + 1];
          const hz = particleHomePositions[i3 + 2];

          const pulse = 1 + Math.sin(time * 2.0 + i) * 0.06;
          posArray[i3] = hx * pulse;
          posArray[i3 + 1] = hy * pulse;
          posArray[i3 + 2] = hz * pulse;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // Lights decay
      if (primaryLight.intensity > 3.8) {
        primaryLight.intensity += (3.8 - primaryLight.intensity) * 0.06;
      }
      if (secondaryLight.intensity > 3.0) {
        secondaryLight.intensity += (3.0 - secondaryLight.intensity) * 0.06;
      }
      if (ring1Mat.opacity > 0.45) {
        ring1Mat.opacity += (0.45 - ring1Mat.opacity) * 0.05;
      }
      if (ring2Mat.opacity > 0.35) {
        ring2Mat.opacity += (0.35 - ring2Mat.opacity) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerleave', onPointerLeave);
      mount.removeEventListener('pointerdown', onPointerDown);

      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      knotGeo.dispose();
      knotMat.dispose();
      knotWireMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      sparkWireMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      innerSphereGeo.dispose();
      innerSphereMat.dispose();
      singGeo.dispose();
      singMat.dispose();
      singInnerGeo.dispose();
      singInnerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      satGeo.dispose();
      satMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Handler: Change Topology
  const handleSelectTopology = (topo: TopologyType) => {
    setSelectedTopology(topo);
    switchTopologyRef.current?.(topo);
  };

  // Handler: Change Pillar Frequency
  const handleSelectPillar = (pillarKey: PillarType) => {
    setActivePillar(pillarKey);
    const config = PILLARS[pillarKey];
    updateColorsRef.current?.(config);
    triggerSurgeRef.current?.();
  };

  // Handler: Trigger Disruption / Quantum Explode
  const handleDisrupt = () => {
    if (disruptCooldown) return;
    setIsDisrupted(true);
    setDisruptCooldown(true);
    setLivePulse(true);
    triggerDisruptRef.current?.();
    setEnergySurges((c) => c + 1);

    setTimeout(() => {
      setIsDisrupted(false);
      setLivePulse(false);
    }, 1200);

    setTimeout(() => {
      setDisruptCooldown(false);
    }, 1800);
  };

  // Handler: Pulse Surge
  const handleSurge = () => {
    setLivePulse(true);
    triggerSurgeRef.current?.();
    setEnergySurges((c) => c + 1);
    setTimeout(() => setLivePulse(false), 400);
  };

  const currentPillarConfig = PILLARS[activePillar];

  return (
    <div
      className={`glass-card rounded-3xl p-6 sm:p-7 border border-purple-500/40 hover:border-purple-400/80 bg-gradient-to-b from-[#140b2a]/90 via-[#0c061a]/95 to-[#06030e]/95 backdrop-blur-2xl relative overflow-hidden group shadow-2xl shadow-purple-950/60 transition-all duration-300 ${className}`}
    >
      {/* 1. Header HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08] relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono uppercase tracking-wider text-purple-200 font-bold">
                Quantum Venture Catalyst
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Interactive 3D Reactor • Cursor Gravity & Morphic Physics
            </p>
          </div>
        </div>

        {/* Pillar Frequency Mode Pills */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
          {(Object.keys(PILLARS) as PillarType[]).map((pKey) => {
            const pill = PILLARS[pKey];
            const isActive = activePillar === pKey;
            return (
              <button
                key={pKey}
                type="button"
                onClick={() => handleSelectPillar(pKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r text-white shadow-md font-semibold ' + pill.themeColor
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {pill.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Mount */}
      <div className="relative w-full h-64 sm:h-72 my-2 z-10 flex items-center justify-center select-none">
        <div
          ref={mountRef}
          className="w-full h-full cursor-crosshair relative z-10"
          title="Move cursor to tilt magnetic field • Tap to surge energy"
        />

        {/* Live Magnetic Attraction Hint Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-400">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Magnetic Cursor Field: Active</span>
        </div>

        {/* Live Active Pillar HUD Overlay */}
        <div className="absolute top-3 right-3 pointer-events-none z-20 flex flex-col items-end gap-0.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono">
          <span className="text-zinc-400">Resonance Freq:</span>
          <span className="text-purple-300 font-bold">{currentPillarConfig.frequency}</span>
        </div>

        {/* Dynamic Topology Selector Pills Floating in Canvas */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleSelectTopology('knot')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTopology === 'knot'
                ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hyperloop Knot
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopology('spark')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTopology === 'spark'
                ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Quantum Spark
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopology('lattice')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTopology === 'lattice'
                ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Neural Matrix
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopology('singularity')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTopology === 'singularity'
                ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Singularity
          </button>
        </div>
      </div>

      {/* 3. Bottom Controls & Telemetry Readout */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs relative z-20">
        {/* Kinetic Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Quantum Disruption (Explode & Magnetic Recall) */}
          <button
            type="button"
            onClick={handleDisrupt}
            disabled={disruptCooldown}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isDisrupted
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-300 shadow-amber-500/50 scale-105'
                : disruptCooldown
                ? 'bg-white/[0.03] text-zinc-500 border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 hover:border-purple-300 shadow-purple-900/40 hover:scale-[1.02]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isDisrupted ? 'animate-bounce text-amber-200' : 'text-amber-400'}`} />
            <span>{isDisrupted ? 'Recalling Quantum Shards...' : '💥 Disrupt & Explode'}</span>
          </button>

          {/* Instant Surge Pulse */}
          <button
            type="button"
            onClick={handleSurge}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              livePulse
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-105'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Surge</span>
          </button>
        </div>

        {/* Live Telemetry Status Bar */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Target:</span>
            <span className="text-white font-semibold">{currentPillarConfig.metricLabel}</span>
            <span className="text-emerald-400 font-bold">({currentPillarConfig.metric})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="text-zinc-500">Surges:</span>
            <strong className="text-purple-300">{energySurges}</strong>
          </div>
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all duration-700" />
    </div>
  );
}
