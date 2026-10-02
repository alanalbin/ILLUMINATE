'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Zap,
  Activity,
  Flame,
  Radio,
  RotateCcw,
  CircleDot,
  Orbit,
  Compass,
} from 'lucide-react';

interface Interactive3DPrismProps {
  className?: string;
}

type BlackHoleType = 'gargantua' | 'cygnus' | 'sagittarius' | 'primordial';

interface BlackHoleConfig {
  name: string;
  classification: string;
  themeColor: string;
  coreHex: number;
  plasmaHex: number;
  accentHex: number;
  spinParam: string;
  velocity: string;
  description: string;
}

const BLACK_HOLE_MODES: Record<BlackHoleType, BlackHoleConfig> = {
  gargantua: {
    name: 'Gargantua',
    classification: 'Supermassive Kerr Singularity',
    themeColor: 'from-violet-500 via-purple-500 to-cyan-400',
    coreHex: 0x9333ea,
    plasmaHex: 0x38bdf8,
    accentHex: 0xc084fc,
    spinParam: 'a* = 0.998',
    velocity: '0.92 c',
    description: 'Relativistic Doppler beaming with warped Einstein lensing ring',
  },
  cygnus: {
    name: 'Cygnus X-1',
    classification: 'High-Energy Stellar Microquasar',
    themeColor: 'from-cyan-400 via-blue-500 to-indigo-600',
    coreHex: 0x06b6d4,
    plasmaHex: 0x60a5fa,
    accentHex: 0x38bdf8,
    spinParam: 'a* = 0.950',
    velocity: '0.88 c',
    description: 'Hyper-collimated relativistic X-ray polar plasma jets',
  },
  sagittarius: {
    name: 'Sagittarius A*',
    classification: 'Milky Way Galactic Supermassive Core',
    themeColor: 'from-amber-400 via-orange-500 to-rose-600',
    coreHex: 0xf59e0b,
    plasmaHex: 0xfbbf24,
    accentHex: 0xf97316,
    spinParam: 'a* = 0.900',
    velocity: '0.82 c',
    description: 'Dense turbulent thermal accretion flow with solar flare eruptions',
  },
  primordial: {
    name: 'Primordial',
    classification: 'Quantum Micro-Singularity',
    themeColor: 'from-fuchsia-400 via-pink-500 to-rose-500',
    coreHex: 0xe879f9,
    plasmaHex: 0xf472b6,
    accentHex: 0xffffff,
    spinParam: 'a* = 0.999',
    velocity: '0.98 c',
    description: 'Quantum gravitational frame dragging & Hawking radiation glow',
  },
};

export default function Interactive3DPrism({ className = '' }: Interactive3DPrismProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Component UI State
  const [activeMode, setActiveMode] = useState<BlackHoleType>('gargantua');
  const [massConsumed, setMassConsumed] = useState<number>(14);
  const [isFeeding, setIsFeeding] = useState<boolean>(false);
  const [jetOverdrive, setJetOverdrive] = useState<boolean>(false);

  // Three.js direct bridge refs
  const feedStarRef = useRef<((customX?: number, customY?: number) => void) | null>(null);
  const triggerJetRef = useRef<(() => void) | null>(null);
  const updateModeRef = useRef<((config: BlackHoleConfig) => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 540;
    const height = mount.clientHeight || 340;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 9.5);
    camera.lookAt(0, 0, 0);

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

    // 2. Scene Lighting
    const ambientLight = new THREE.AmbientLight(0x0e061c, 1.6);
    scene.add(ambientLight);

    const accretionLight1 = new THREE.PointLight(BLACK_HOLE_MODES.gargantua.coreHex, 4.2, 30);
    accretionLight1.position.set(4, 2, 5);
    scene.add(accretionLight1);

    const accretionLight2 = new THREE.PointLight(BLACK_HOLE_MODES.gargantua.plasmaHex, 3.8, 30);
    accretionLight2.position.set(-4, -2, 4);
    scene.add(accretionLight2);

    const jetLight = new THREE.PointLight(0xffffff, 3.5, 20);
    jetLight.position.set(0, 5, 0);
    scene.add(jetLight);

    // 3. Black Hole Root Group (Tilts with cursor frame-dragging)
    const blackHoleGroup = new THREE.Group();
    // Default tilt to showcase the accretion disk and polar jets in 3D
    blackHoleGroup.rotation.x = 0.38;
    blackHoleGroup.rotation.z = -0.15;
    scene.add(blackHoleGroup);

    // =========================================================================
    // 4. THE EVENT HORIZON (Schwarzschild Singularity Core)
    // =========================================================================
    // Pure black void sphere that blocks all light behind it
    const eventHorizonRadius = 1.45;
    const horizonGeo = new THREE.SphereGeometry(eventHorizonRadius, 40, 40);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    blackHoleGroup.add(horizonMesh);

    // Inner dark gravitational shadow gradient
    const shadowHaloGeo = new THREE.SphereGeometry(eventHorizonRadius * 1.02, 32, 32);
    const shadowHaloMat = new THREE.MeshBasicMaterial({
      color: 0x05020c,
      transparent: true,
      opacity: 0.95,
      wireframe: false,
    });
    const shadowHalo = new THREE.Mesh(shadowHaloGeo, shadowHaloMat);
    blackHoleGroup.add(shadowHalo);

    // =========================================================================
    // 5. PHOTON SPHERE & GRAVITATIONAL LENSING RINGS (Einstein Ring)
    // =========================================================================
    // The razor-thin glowing sphere where trapped photons circle the singularity
    const photonRingGeo = new THREE.RingGeometry(eventHorizonRadius * 1.04, eventHorizonRadius * 1.18, 64);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    blackHoleGroup.add(photonRing);

    // Gargantua Vertical Lensing Halo (The iconic light bent over the poles from the rear accretion disk)
    const verticalLensingGeo = new THREE.TorusGeometry(eventHorizonRadius * 1.28, 0.16, 24, 80);
    const verticalLensingMat = new THREE.MeshBasicMaterial({
      color: BLACK_HOLE_MODES.gargantua.plasmaHex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const verticalLensing = new THREE.Mesh(verticalLensingGeo, verticalLensingMat);
    verticalLensing.rotation.y = Math.PI / 2;
    blackHoleGroup.add(verticalLensing);

    // Secondary concentric lensing halo
    const secondaryLensingGeo = new THREE.TorusGeometry(eventHorizonRadius * 1.48, 0.08, 16, 80);
    const secondaryLensingMat = new THREE.MeshBasicMaterial({
      color: BLACK_HOLE_MODES.gargantua.coreHex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const secondaryLensing = new THREE.Mesh(secondaryLensingGeo, secondaryLensingMat);
    secondaryLensing.rotation.y = Math.PI / 2;
    blackHoleGroup.add(secondaryLensing);

    // =========================================================================
    // 6. RELATIVISTIC ACCRETION DISK (Keplerian Swirling Particle Plasma)
    // =========================================================================
    // Generates a soft glowing circular particle sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 240, 255, 0.95)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(0.8, 'rgba(147, 51, 234, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    const accretionParticleCount = 420;
    const accretionGeo = new THREE.BufferGeometry();
    const accretionPositions = new Float32Array(accretionParticleCount * 3);
    const accretionColors = new Float32Array(accretionParticleCount * 3);

    interface AccretionParticle {
      radius: number;
      angle: number;
      angularSpeed: number;
      yOffset: number;
      size: number;
    }
    const accretionData: AccretionParticle[] = [];

    const colorCore = new THREE.Color(BLACK_HOLE_MODES.gargantua.coreHex);
    const colorPlasma = new THREE.Color(BLACK_HOLE_MODES.gargantua.plasmaHex);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < accretionParticleCount; i++) {
      // Radii range from ISCO (Innermost Stable Circular Orbit: 1.7) to outer disk: 5.0
      const normR = Math.pow(Math.random(), 0.65);
      const radius = THREE.MathUtils.lerp(1.7, 5.0, normR);
      const angle = Math.random() * Math.PI * 2;
      // Keplerian velocity: inner matter orbits significantly faster (v ~ 1/sqrt(r))
      const angularSpeed = (0.75 / Math.sqrt(radius)) * (0.85 + Math.random() * 0.3);
      const yOffset = (Math.random() - 0.5) * 0.16 * (radius / 3.0);
      const size = THREE.MathUtils.lerp(0.35, 0.18, normR);

      accretionData.push({ radius, angle, angularSpeed, yOffset, size });

      accretionPositions[i * 3] = Math.cos(angle) * radius;
      accretionPositions[i * 3 + 1] = yOffset;
      accretionPositions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color gradient: White-hot inner disk -> vibrant plasma mid-disk -> violet outer boundary
      const tempColor = new THREE.Color();
      if (normR < 0.25) {
        tempColor.lerpColors(colorWhite, colorPlasma, normR / 0.25);
      } else {
        tempColor.lerpColors(colorPlasma, colorCore, (normR - 0.25) / 0.75);
      }
      accretionColors[i * 3] = tempColor.r;
      accretionColors[i * 3 + 1] = tempColor.g;
      accretionColors[i * 3 + 2] = tempColor.b;
    }

    accretionGeo.setAttribute('position', new THREE.BufferAttribute(accretionPositions, 3));
    accretionGeo.setAttribute('color', new THREE.BufferAttribute(accretionColors, 3));

    const accretionMat = new THREE.PointsMaterial({
      size: 0.32,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const accretionMesh = new THREE.Points(accretionGeo, accretionMat);
    blackHoleGroup.add(accretionMesh);

    // =========================================================================
    // 7. RELATIVISTIC ASTROPHYSICAL POLAR JETS (Energetic Collimated Beams)
    // =========================================================================
    const jetGroup = new THREE.Group();
    blackHoleGroup.add(jetGroup);

    // Upper and lower beam core cylinders
    const jetCoreGeo = new THREE.CylinderGeometry(0.06, 0.42, 6.5, 24, 1, true);
    const jetCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const jetNorth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetNorth.position.y = 3.3;
    jetGroup.add(jetNorth);

    const jetSouth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetSouth.position.y = -3.3;
    jetSouth.rotation.x = Math.PI;
    jetGroup.add(jetSouth);

    // Outer helical magnetic plasma sheath
    const jetParticlesCount = 70;
    const jetGeo = new THREE.BufferGeometry();
    const jetPositions = new Float32Array(jetParticlesCount * 3);
    const jetParticlesData: { height: number; speed: number; angle: number; radius: number }[] = [];

    for (let i = 0; i < jetParticlesCount; i++) {
      const isNorth = i % 2 === 0;
      const height = (1.5 + Math.random() * 5.0) * (isNorth ? 1 : -1);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.12 + Math.abs(height) * 0.06;
      const speed = (2.2 + Math.random() * 2.0) * (isNorth ? 1 : -1);

      jetParticlesData.push({ height, speed, angle, radius });

      jetPositions[i * 3] = Math.cos(angle) * radius;
      jetPositions[i * 3 + 1] = height;
      jetPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
    const jetPointsMat = new THREE.PointsMaterial({
      size: 0.28,
      color: BLACK_HOLE_MODES.gargantua.plasmaHex,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const jetPoints = new THREE.Points(jetGeo, jetPointsMat);
    jetGroup.add(jetPoints);

    // =========================================================================
    // 8. TIDAL DISRUPTION & SPAGHETTIFICATION ENGINE ("Feed the Singularity")
    // =========================================================================
    // Active star matter clusters spiraling into the black hole and getting stretched
    const maxInfallingParticles = 60;
    const infallingGeo = new THREE.BufferGeometry();
    const infallingPositions = new Float32Array(maxInfallingParticles * 3);
    const infallingColors = new Float32Array(maxInfallingParticles * 3);

    interface InfallingCluster {
      id: number;
      radius: number;
      angle: number;
      y: number;
      speed: number;
      spread: number;
      color: THREE.Color;
    }
    const infallingClusters: InfallingCluster[] = [];

    infallingGeo.setAttribute('position', new THREE.BufferAttribute(infallingPositions, 3));
    infallingGeo.setAttribute('color', new THREE.BufferAttribute(infallingColors, 3));

    const infallingMat = new THREE.PointsMaterial({
      size: 0.42,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const infallingPoints = new THREE.Points(infallingGeo, infallingMat);
    blackHoleGroup.add(infallingPoints);

    // Gravitational Spacetime Ripple
    const waveRingGeo = new THREE.RingGeometry(1.4, 1.8, 64);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    blackHoleGroup.add(waveRing);
    let waveActive = false;
    let waveProgress = 0;

    const spawnInfallingStar = (customRadius = 5.6, customAngle = Math.random() * Math.PI * 2) => {
      // Add a celestial star matter cluster
      infallingClusters.push({
        id: Math.random(),
        radius: customRadius,
        angle: customAngle,
        y: (Math.random() - 0.5) * 0.4,
        speed: 0.45 + Math.random() * 0.3,
        spread: 0.05,
        color: new THREE.Color(0xfde047), // Stellar gold/amber
      });

      // Pulse spacetime wave
      waveActive = true;
      waveProgress = 0;
      waveRingMat.opacity = 0.9;

      accretionLight1.intensity = 8.5;
      accretionLight2.intensity = 7.5;
    };

    feedStarRef.current = () => {
      spawnInfallingStar();
      setMassConsumed((m) => m + 1);
    };

    triggerJetRef.current = () => {
      jetCoreMat.opacity = 1.0;
      jetLight.intensity = 9.0;
      waveActive = true;
      waveProgress = 0;
      waveRingMat.opacity = 0.9;
    };

    updateModeRef.current = (config: BlackHoleConfig) => {
      accretionLight1.color.setHex(config.coreHex);
      accretionLight2.color.setHex(config.plasmaHex);

      verticalLensingMat.color.setHex(config.plasmaHex);
      secondaryLensingMat.color.setHex(config.coreHex);
      jetPointsMat.color.setHex(config.plasmaHex);

      // Recalculate accretion disk colors
      const newCoreCol = new THREE.Color(config.coreHex);
      const newPlasmaCol = new THREE.Color(config.plasmaHex);
      const colorsArr = accretionGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < accretionParticleCount; i++) {
        const normR = (accretionData[i].radius - 1.7) / (5.0 - 1.7);
        const tempColor = new THREE.Color();
        if (normR < 0.25) {
          tempColor.lerpColors(colorWhite, newPlasmaCol, normR / 0.25);
        } else {
          tempColor.lerpColors(newPlasmaCol, newCoreCol, (normR - 0.25) / 0.75);
        }
        colorsArr[i * 3] = tempColor.r;
        colorsArr[i * 3 + 1] = tempColor.g;
        colorsArr[i * 3 + 2] = tempColor.b;
      }
      accretionGeo.attributes.color.needsUpdate = true;
    };

    // =========================================================================
    // 9. RELATIVISTIC FRAME DRAGGING & CURSOR GRAVITY WARP
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.38;
    let targetRotY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / height - 0.5) * 2;

      // Mouse tilts black hole along frame-dragging axis
      targetRotY = normX * 0.9;
      targetRotX = 0.38 + normY * 0.6;
    };

    const onPointerLeave = () => {
      targetRotX = 0.38;
      targetRotY = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / height - 0.5) * 2;

      // Spawn infalling star at pointer's angular coordinate
      const clickAngle = Math.atan2(normY, normX);
      spawnInfallingStar(5.2, clickAngle);
      setMassConsumed((m) => m + 1);
    };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerleave', onPointerLeave);
    mount.addEventListener('pointerdown', onPointerDown);

    // =========================================================================
    // 10. 60FPS RELATIVISTIC PHYSICS SIMULATION LOOP
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth Frame-Dragging Interpolation
      mouseX += (targetRotY - mouseX) * 0.06;
      mouseY += (targetRotX - mouseY) * 0.06;

      blackHoleGroup.rotation.y = time * 0.12 + mouseX;
      blackHoleGroup.rotation.x = mouseY;

      // Einstein Photon Ring Lensing Oscillation
      const lensPulse = 1.0 + Math.sin(time * 3.5) * 0.03;
      photonRing.scale.set(lensPulse, lensPulse, lensPulse);
      photonRing.lookAt(camera.position);

      verticalLensing.rotation.y = Math.PI / 2 + Math.sin(time * 0.6) * 0.08;

      // -----------------------------------------------------------------------
      // Keplerian Accretion Disk Simulation & Relativistic Doppler Beaming
      // -----------------------------------------------------------------------
      const posArr = accretionGeo.attributes.position.array as Float32Array;
      const colArr = accretionGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < accretionParticleCount; i++) {
        const p = accretionData[i];
        p.angle += p.angularSpeed * delta * 2.2;

        const px = Math.cos(p.angle) * p.radius;
        const pz = Math.sin(p.angle) * p.radius;
        const py = p.yOffset + Math.sin(time * 2.5 + p.radius * 2.0) * 0.03;

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = py;
        posArr[i * 3 + 2] = pz;

        // Relativistic Doppler Beaming: Matter approaching the camera glows brighter
        const dopplerFactor = Math.sin(p.angle + blackHoleGroup.rotation.y);
        const intensityShift = THREE.MathUtils.clamp(1.0 + dopplerFactor * 0.35, 0.6, 1.4);
        colArr[i * 3] = Math.min(1.0, colArr[i * 3] * intensityShift);
        colArr[i * 3 + 1] = Math.min(1.0, colArr[i * 3 + 1] * intensityShift);
        colArr[i * 3 + 2] = Math.min(1.0, colArr[i * 3 + 2] * intensityShift);
      }
      accretionGeo.attributes.position.needsUpdate = true;
      accretionGeo.attributes.color.needsUpdate = true;

      // -----------------------------------------------------------------------
      // Relativistic Polar Jets Animation
      // -----------------------------------------------------------------------
      const jPosArr = jetGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < jetParticlesCount; i++) {
        const jp = jetParticlesData[i];
        jp.height += jp.speed * delta;
        jp.angle += delta * 4.0;

        // Wrap around at jet extremities
        if (jp.height > 6.5) jp.height = 1.6;
        if (jp.height < -6.5) jp.height = -1.6;

        const currentRad = 0.08 + Math.abs(jp.height) * 0.07;
        jPosArr[i * 3] = Math.cos(jp.angle) * currentRad;
        jPosArr[i * 3 + 1] = jp.height;
        jPosArr[i * 3 + 2] = Math.sin(jp.angle) * currentRad;
      }
      jetGeo.attributes.position.needsUpdate = true;

      // -----------------------------------------------------------------------
      // Spaghettification of Infalling Celestial Matter (Tidal Disruption)
      // -----------------------------------------------------------------------
      const infPosArr = infallingGeo.attributes.position.array as Float32Array;
      const infColArr = infallingGeo.attributes.color.array as Float32Array;

      // Clear infalling buffer
      for (let k = 0; k < infPosArr.length; k++) {
        infPosArr[k] = 0;
        infColArr[k] = 0;
      }

      for (let cIdx = infallingClusters.length - 1; cIdx >= 0; cIdx--) {
        const cluster = infallingClusters[cIdx];
        // Accelerate inward as it approaches the gravitational singularity
        cluster.speed += delta * (4.2 / (cluster.radius * cluster.radius));
        cluster.radius -= cluster.speed * delta * 1.5;
        cluster.angle += (1.8 / Math.sqrt(cluster.radius)) * delta * 3.5;
        // Tidal stretching (Spaghettification): expands along orbital arc
        cluster.spread += delta * 0.45;

        // Plunge across the Event Horizon!
        if (cluster.radius <= eventHorizonRadius) {
          infallingClusters.splice(cIdx, 1);
          // Hawking flash on event horizon entry
          photonRingMat.opacity = 1.0;
          accretionLight1.intensity = 9.0;
          continue;
        }

        // Draw stretched spaghettified plasma trail
        const particlesPerCluster = 8;
        const baseIdx = cIdx * particlesPerCluster;
        if (baseIdx + particlesPerCluster <= maxInfallingParticles) {
          for (let p = 0; p < particlesPerCluster; p++) {
            const spreadAngle = cluster.angle - (p * cluster.spread * 0.08);
            const spreadRad = cluster.radius + (p * 0.04);
            const idx = (baseIdx + p) * 3;

            infPosArr[idx] = Math.cos(spreadAngle) * spreadRad;
            infPosArr[idx + 1] = cluster.y + (p - 4) * 0.02;
            infPosArr[idx + 2] = Math.sin(spreadAngle) * spreadRad;

            infColArr[idx] = 1.0;
            infColArr[idx + 1] = 0.9 - p * 0.08;
            infColArr[idx + 2] = 0.3;
          }
        }
      }
      infallingGeo.attributes.position.needsUpdate = true;
      infallingGeo.attributes.color.needsUpdate = true;

      // -----------------------------------------------------------------------
      // Spacetime Gravitational Wave Ripple
      // -----------------------------------------------------------------------
      if (waveActive) {
        waveProgress += delta * 2.2;
        const waveScale = 1.0 + waveProgress * 3.8;
        waveRing.scale.set(waveScale, waveScale, waveScale);
        waveRingMat.opacity = Math.max(0, 0.9 * (1.0 - waveProgress));

        if (waveProgress >= 1.0) {
          waveActive = false;
        }
      }

      // Lights and Jet intensity decay back to baseline
      if (jetCoreMat.opacity > 0.65) {
        jetCoreMat.opacity += (0.65 - jetCoreMat.opacity) * 0.05;
      }
      if (jetLight.intensity > 3.5) {
        jetLight.intensity += (3.5 - jetLight.intensity) * 0.06;
      }
      if (photonRingMat.opacity > 0.9) {
        photonRingMat.opacity += (0.9 - photonRingMat.opacity) * 0.05;
      }
      if (accretionLight1.intensity > 4.2) {
        accretionLight1.intensity += (4.2 - accretionLight1.intensity) * 0.05;
      }
      if (accretionLight2.intensity > 3.8) {
        accretionLight2.intensity += (3.8 - accretionLight2.intensity) * 0.05;
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

      horizonGeo.dispose();
      horizonMat.dispose();
      shadowHaloGeo.dispose();
      shadowHaloMat.dispose();
      photonRingGeo.dispose();
      photonRingMat.dispose();
      verticalLensingGeo.dispose();
      verticalLensingMat.dispose();
      secondaryLensingGeo.dispose();
      secondaryLensingMat.dispose();
      accretionGeo.dispose();
      accretionMat.dispose();
      jetCoreGeo.dispose();
      jetCoreMat.dispose();
      jetGeo.dispose();
      jetPointsMat.dispose();
      infallingGeo.dispose();
      infallingMat.dispose();
      waveRingGeo.dispose();
      waveRingMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // Handlers
  const handleSelectMode = (mode: BlackHoleType) => {
    setActiveMode(mode);
    const config = BLACK_HOLE_MODES[mode];
    updateModeRef.current?.(config);
  };

  const handleFeed = () => {
    setIsFeeding(true);
    feedStarRef.current?.();
    setTimeout(() => setIsFeeding(false), 600);
  };

  const handleJetSurge = () => {
    setJetOverdrive(true);
    triggerJetRef.current?.();
    setTimeout(() => setJetOverdrive(false), 500);
  };

  const currentMode = BLACK_HOLE_MODES[activeMode];

  return (
    <div
      className={`glass-card rounded-3xl p-6 sm:p-7 border border-purple-500/40 hover:border-purple-400/80 bg-gradient-to-b from-[#120824]/95 via-[#080314]/95 to-[#04010a]/95 backdrop-blur-2xl relative overflow-hidden group shadow-2xl shadow-purple-950/70 transition-all duration-300 ${className}`}
    >
      {/* 1. Header Astrophysics HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08] relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-purple-200 font-bold">
                Relativistic Singularity & Accretion Laboratory
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                KERR METRIC
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Interactive 3D Black Hole • Gravitational Lensing, Accretion Disk & Spaghettification
            </p>
          </div>
        </div>

        {/* Black Hole Spectrum Mode Selectors */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
          {(Object.keys(BLACK_HOLE_MODES) as BlackHoleType[]).map((mKey) => {
            const mode = BLACK_HOLE_MODES[mKey];
            const isActive = activeMode === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => handleSelectMode(mKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r text-white shadow-md font-semibold ' + mode.themeColor
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive 3D Black Hole Canvas */}
      <div className="relative w-full h-72 sm:h-80 my-2 z-10 flex items-center justify-center select-none">
        <div
          ref={mountRef}
          className="w-full h-full cursor-crosshair relative z-10"
          title="Move cursor to warp gravitational frame • Click canvas to drop stellar matter"
        />

        {/* Live Gravitational Lensing Indicator */}
        <div className="absolute top-3 left-3 pointer-events-none z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-400">
          <CircleDot className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>Einstein Ring: Warped</span>
        </div>

        {/* Live Relativistic Telemetry */}
        <div className="absolute top-3 right-3 pointer-events-none z-20 flex flex-col items-end gap-0.5 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 backdrop-blur-md text-[10px] font-mono">
          <span className="text-zinc-400">Spin Parameter:</span>
          <span className="text-purple-300 font-bold">{currentMode.spinParam}</span>
        </div>

        {/* Mid-canvas Interaction Guidance Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-300">
          <Orbit className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>Click anywhere in 3D space to feed stars into the singularity</span>
        </div>
      </div>

      {/* 3. Astrophysical Controls & Telemetry Dashboard */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs relative z-20">
        {/* Kinetic Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Feed Singularity (Tidal Disruption Event) */}
          <button
            type="button"
            onClick={handleFeed}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isFeeding
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-300 shadow-amber-500/50 scale-105'
                : 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 hover:border-purple-300 shadow-purple-900/40 hover:scale-[1.02]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isFeeding ? 'animate-bounce text-amber-200' : 'text-amber-400'}`} />
            <span>Feed Singularity (Tidal Disruption)</span>
          </button>

          {/* Relativistic Jet Overdrive */}
          <button
            type="button"
            onClick={handleJetSurge}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              jetOverdrive
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-105'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Jet Overdrive</span>
          </button>
        </div>

        {/* Live Astrophysical Telemetry Readout */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Accretion Speed:</span>
            <span className="text-cyan-400 font-bold">{currentMode.velocity}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="text-zinc-500">Solar Mass Consumed:</span>
            <strong className="text-amber-300">{massConsumed} M☉</strong>
          </div>
        </div>
      </div>

      {/* Ambient Cosmic Singularity Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />
    </div>
  );
}
