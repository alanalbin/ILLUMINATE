'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

interface FloatingShard {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  floatSpeed: number;
  floatAmp: number;
  phase: number;
  highlightMat: THREE.LineBasicMaterial;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [interactiveHint, setInteractiveHint] = useState<boolean>(false);

  useEffect(() => {
    // 1. WebGL Support Check
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

    // 2. Scene with Deep Moody Abyssal Fog (Beautiful Gloomy Atmosphere)
    const scene = new THREE.Scene();
    // Atmospheric dark fog: deep indigo-charcoal gloom that obscures distant objects gently
    const gloomFogColor = 0x05030c;
    scene.fog = new THREE.FogExp2(gloomFogColor, isMobile ? 0.0035 : 0.0026);

    // 3. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      1400
    );
    camera.position.set(0, 3, 115);

    // 4. WebGL Renderer with High Performance & Rich Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 5. Root Abyssal Anchor (Positioned slightly deep and offset to preserve text visibility)
    const abyssalVoidGroup = new THREE.Group();
    abyssalVoidGroup.position.set(0, -2, -35);
    scene.add(abyssalVoidGroup);

    // 6. Moody, Ethereal 3D Lighting Setup
    // Deep gloomy ambient light - keeps darkness rich without complete pitch-black
    const ambientLight = new THREE.AmbientLight(0x0e091e, 1.6);
    scene.add(ambientLight);

    // Monolith Core Void Light - deep spectral violet glow
    const voidCoreLight = new THREE.PointLight(0x7c3aed, 3.2, 180);
    voidCoreLight.position.set(0, 0, 0);
    abyssalVoidGroup.add(voidCoreLight);

    // Distant Cold Moonlight / Spectral Rim Light - cuts through gloom at an angle
    const spectralMoonLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    spectralMoonLight.position.set(45, 60, -30);
    scene.add(spectralMoonLight);

    // Gloomy Volcanic Ember Under-Glow from deep below
    const emberUnderLight = new THREE.PointLight(0xd97706, 1.2, 170);
    emberUnderLight.position.set(-40, -45, -25);
    scene.add(emberUnderLight);

    // Interactive Spectral Cursor Light - follows mouse in 3D world space, lighting nearby shards
    const cursorSpectralLight = new THREE.PointLight(0xa78bfa, 3.6, 140);
    cursorSpectralLight.position.set(0, 0, 30);
    scene.add(cursorSpectralLight);

    // 7. Procedural Particle Textures (Custom Smoky Mist & Luminous Spectral Point)
    // A. Soft Volumetric Gloomy Mist Texture (smoky falloff)
    const mistCanvas = document.createElement('canvas');
    mistCanvas.width = 128;
    mistCanvas.height = 128;
    const mCtx = mistCanvas.getContext('2d');
    if (mCtx) {
      const grad = mCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      grad.addColorStop(0.25, 'rgba(99, 102, 241, 0.25)');
      grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(0.82, 'rgba(15, 10, 30, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      mCtx.fillStyle = grad;
      mCtx.fillRect(0, 0, 128, 128);
    }
    const mistTexture = new THREE.CanvasTexture(mistCanvas);

    // B. Sharp Spectral Starlight / Ember Texture
    const emberCanvas = document.createElement('canvas');
    emberCanvas.width = 64;
    emberCanvas.height = 64;
    const eCtx = emberCanvas.getContext('2d');
    if (eCtx) {
      const grad = eCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(224, 231, 255, 0.9)');
      grad.addColorStop(0.45, 'rgba(167, 139, 250, 0.5)');
      grad.addColorStop(0.75, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      eCtx.fillStyle = grad;
      eCtx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(emberCanvas);

    // 8. Central Gloomy Artifact: The Abyssal Obsidian Monolith
    // Designed to look atmospheric, mysterious, and monolithic without obstructing foreground text
    const monolithGroup = new THREE.Group();
    abyssalVoidGroup.add(monolithGroup);

    // Dark Faceted Obsidian Core Spire
    const coreGeo = new THREE.OctahedronGeometry(13, 0);
    coreGeo.scale(1.0, 1.65, 1.0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x05030c,
      roughness: 0.2,
      metalness: 0.95,
      transparent: true,
      opacity: 0.88,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    monolithGroup.add(coreMesh);

    // Glowing Ethereal Edges for the Monolith
    const coreEdgeGeo = new THREE.EdgesGeometry(coreGeo);
    const coreEdgeMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const coreEdges = new THREE.LineSegments(coreEdgeGeo, coreEdgeMat);
    monolithGroup.add(coreEdges);

    // Outer Moody Wireframe Geodesic Shroud (Soft atmospheric shell)
    const shroudGeo = new THREE.IcosahedronGeometry(22, 1);
    const shroudMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const shroudMesh = new THREE.Mesh(shroudGeo, shroudMat);
    monolithGroup.add(shroudMesh);

    // Inner Glowing Singularity Sphere (haunting, subtle breathing core)
    const singularityGeo = new THREE.SphereGeometry(4.5, 32, 32);
    const singularityMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const singularityMesh = new THREE.Mesh(singularityGeo, singularityMat);
    monolithGroup.add(singularityMesh);

    // 9. Three Gloomy Gyroscopic Eclipse Rings (Tilted & Precessing)
    // Ring 1: Spectral Moonlight Cyan
    const ringGeo1 = new THREE.TorusGeometry(32, 0.28, 12, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = Math.PI / 7;
    abyssalVoidGroup.add(ring1);

    // Ring 2: Deep Twilight Violet
    const ringGeo2 = new THREE.TorusGeometry(40, 0.32, 12, 110);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2.8;
    ring2.rotation.z = Math.PI / 5;
    abyssalVoidGroup.add(ring2);

    // Ring 3: Ghostly Platinum/Silver Outer Halo
    const ringGeo3 = new THREE.TorusGeometry(48, 0.36, 12, 120);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.y = Math.PI / 2.2;
    ring3.rotation.z = -Math.PI / 6;
    abyssalVoidGroup.add(ring3);

    // Orbiting Gloomy Wisps / Spectral Satellite Shards
    const wispCount = 6;
    const wisps: Array<{
      mesh: THREE.Mesh;
      ringIndex: number;
      speed: number;
      angle: number;
      radius: number;
    }> = [];

    for (let w = 0; w < wispCount; w++) {
      const wispGeo = new THREE.OctahedronGeometry(1.1, 0);
      const wispMat = new THREE.MeshBasicMaterial({
        color: w % 2 === 0 ? 0x38bdf8 : 0xa78bfa,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const wispMesh = new THREE.Mesh(wispGeo, wispMat);
      abyssalVoidGroup.add(wispMesh);

      wisps.push({
        mesh: wispMesh,
        ringIndex: w % 3,
        speed: 0.6 + Math.random() * 0.5,
        angle: (w / wispCount) * Math.PI * 2,
        radius: w % 3 === 0 ? 32 : w % 3 === 1 ? 40 : 48,
      });
    }

    // 10. Floating Dark Obsidian Shards (Positioned on the PERIPHERY to keep text crystal clear)
    // When the mouse approaches, they tilt and magnetically respond!
    const shards: FloatingShard[] = [];
    const shardCount = isMobile ? 8 : 16;

    const shardGeometries = [
      () => {
        const g = new THREE.ConeGeometry(3.2, 7.5, 4);
        g.rotateX(Math.PI);
        return g;
      },
      () => new THREE.OctahedronGeometry(3.5, 0),
      () => new THREE.IcosahedronGeometry(3.2, 0),
      () => {
        const g = new THREE.CylinderGeometry(0.8, 2.8, 7.0, 5);
        return g;
      },
    ];

    const shardEdgeColors = [0x8b5cf6, 0x38bdf8, 0xa78bfa, 0x6366f1, 0xd97706];

    for (let i = 0; i < shardCount; i++) {
      const geo = shardGeometries[i % shardGeometries.length]();
      const col = shardEdgeColors[i % shardEdgeColors.length];

      const mat = new THREE.MeshStandardMaterial({
        color: 0x060410,
        roughness: 0.22,
        metalness: 0.9,
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const highlightMat = new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      const edges = new THREE.LineSegments(edgeGeo, highlightMat);

      const group = new THREE.Group();
      group.add(mesh);
      group.add(edges);

      // Peripheral distribution: strictly outside center area so text in center/left-center is pristine
      // Distribute along left rim, right rim, upper corners, lower corners
      const side = i % 2 === 0 ? -1 : 1;
      const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const xDistance = 46 + Math.random() * 42;
      const posX = side * xDistance;
      const posY = Math.sin(angle) * 44 + (Math.random() - 0.5) * 20;
      const posZ = -15 + (Math.random() - 0.5) * 45;

      group.position.set(posX, posY, posZ);
      scene.add(group);

      shards.push({
        group,
        mesh,
        edges,
        highlightMat,
        basePos: new THREE.Vector3(posX, posY, posZ),
        velocity: new THREE.Vector3(0, 0, 0),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.01
        ),
        floatSpeed: 0.4 + Math.random() * 0.45,
        floatAmp: 2.0 + Math.random() * 3.0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 11. Gloomy Volumetric Mist Layer (Soft atmospheric drifting fog)
    const mistCount = isMobile ? 180 : 380;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    const mistColors = new Float32Array(mistCount * 3);
    const mistVels = new Float32Array(mistCount * 3);

    for (let i = 0; i < mistCount; i++) {
      const i3 = i * 3;
      // Spread across wide atmospheric space
      mistPos[i3] = (Math.random() - 0.5) * 260;
      mistPos[i3 + 1] = (Math.random() - 0.5) * 160;
      mistPos[i3 + 2] = -120 + Math.random() * 180;

      // Drift velocities
      mistVels[i3] = (Math.random() - 0.5) * 0.05;
      mistVels[i3 + 1] = (Math.random() - 0.5) * 0.03;
      mistVels[i3 + 2] = (Math.random() - 0.5) * 0.04;

      // Dark moody mist colors (deep violet, shadowy cyan, midnight grey)
      const t = Math.random();
      const col = new THREE.Color();
      if (t < 0.45) {
        col.setRGB(0.08, 0.04, 0.16);
      } else if (t < 0.8) {
        col.setRGB(0.04, 0.08, 0.15);
      } else {
        col.setRGB(0.12, 0.06, 0.18);
      }

      mistColors[i3] = col.r;
      mistColors[i3 + 1] = col.g;
      mistColors[i3 + 2] = col.b;
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    mistGeo.setAttribute('color', new THREE.BufferAttribute(mistColors, 3));

    const mistMat = new THREE.PointsMaterial({
      size: isMobile ? 38 : 56,
      map: mistTexture,
      transparent: true,
      opacity: 0.38,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const mistField = new THREE.Points(mistGeo, mistMat);
    scene.add(mistField);

    // 12. Interactive Spectral Embers & Constellation Field (Responds to cursor fluidly!)
    const emberCount = isMobile ? 1200 : 2600;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberBasePos = new Float32Array(emberCount * 3);
    const emberPhases = new Float32Array(emberCount);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;

      // Radial distribution with a gentle center void so hero text is unobstructed
      const angle = Math.random() * Math.PI * 2;
      const u = Math.random();
      // Radius biased outwards: 18 min to 110 max
      const r = 18 + Math.pow(u, 1.2) * 92;
      const px = Math.cos(angle) * r * 1.35;
      const py = (Math.random() - 0.5) * 110;
      const pz = -50 + Math.random() * 110;

      emberPos[i3] = px;
      emberPos[i3 + 1] = py;
      emberPos[i3 + 2] = pz;

      emberBasePos[i3] = px;
      emberBasePos[i3 + 1] = py;
      emberBasePos[i3 + 2] = pz;

      emberPhases[i] = Math.random() * Math.PI * 2;
      emberSpeeds[i] = 0.4 + Math.random() * 0.7;

      // Color gradation: spectral pale violet -> cold moonlight cyan -> faint ember gold
      const colType = Math.random();
      const col = new THREE.Color();
      if (colType < 0.5) {
        col.lerpColors(new THREE.Color(0xa78bfa), new THREE.Color(0x818cf8), Math.random());
      } else if (colType < 0.85) {
        col.lerpColors(new THREE.Color(0x38bdf8), new THREE.Color(0xa5f3fc), Math.random());
      } else {
        col.lerpColors(new THREE.Color(0xf59e0b), new THREE.Color(0xd97706), Math.random());
      }

      emberColors[i3] = col.r;
      emberColors[i3 + 1] = col.g;
      emberColors[i3 + 2] = col.b;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 3.0 : 3.8,
      map: emberTexture,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const emberCloud = new THREE.Points(emberGeo, emberMat);
    scene.add(emberCloud);

    // 13. Interactive Spectral Gloom Shockwave (Click & Tap Ripple)
    const shockwaveGeo = new THREE.RingGeometry(1, 4.5, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0, 10);
    scene.add(shockwaveMesh);

    let shockwaveActive = false;
    let shockwaveScale = 1.0;

    // 14. Pointer Physics, 3D Raycasting & Drag Interaction
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    let isPointerDown = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragRotOffset = { x: 0, y: 0 };
    let targetDragRot = { x: 0, y: 0 };

    let scrollY = 0;
    let targetScrollY = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;

      if (isPointerDown) {
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;
        targetDragRot.y = (deltaX / window.innerWidth) * 0.8;
        targetDragRot.x = (deltaY / window.innerHeight) * 0.6;
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartX = clientX;
      dragStartY = clientY;
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    const triggerShockwave = (atX?: number, atY?: number) => {
      // Trigger ethereal shockwave expanding from pointer location
      shockwaveActive = true;
      shockwaveScale = 1.0;
      shockwaveMat.opacity = 0.9;

      // Position shockwave at current 3D cursor position if available
      shockwaveMesh.position.set(mouse3D.x, mouse3D.y, 5);

      // Burst cursor spectral light and void core
      cursorSpectralLight.intensity = 8.5;
      voidCoreLight.intensity = 7.0;

      // Accelerate floating shards with angular momentum burst
      for (const shard of shards) {
        shard.rotSpeed.x += (Math.random() - 0.5) * 0.08;
        shard.rotSpeed.y += (Math.random() - 0.5) * 0.08;
        shard.rotSpeed.z += (Math.random() - 0.5) * 0.06;

        // Push shards outward slightly from shockwave center
        const dx = shard.group.position.x - mouse3D.x;
        const dy = shard.group.position.y - mouse3D.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        shard.velocity.x += (dx / dist) * 12.0;
        shard.velocity.y += (dy / dist) * 12.0;
      }

      // Gyroscopic ring acceleration
      ring1.rotation.z += 0.35;
      ring2.rotation.z -= 0.45;
      ring3.rotation.z += 0.3;
    };

    const onWindowClick = (e: MouseEvent) => {
      // Only trigger if click wasn't a significant drag
      triggerShockwave();
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('click', onWindowClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 15. 60FPS Abyssal Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer & drag easing
      mouse.x += (targetMouse.x - mouse.x) * 0.055;
      mouse.y += (targetMouse.y - mouse.y) * 0.055;
      scrollY += (targetScrollY - scrollY) * 0.05;

      dragRotOffset.x += (targetDragRot.x - dragRotOffset.x) * 0.05;
      dragRotOffset.y += (targetDragRot.y - dragRotOffset.y) * 0.05;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Interactive Cursor Light smoothly tracks coordinates
      cursorSpectralLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 20);
      cursorSpectralLight.intensity = Math.max(3.2, cursorSpectralLight.intensity * 0.95);
      voidCoreLight.intensity = Math.max(2.8, voidCoreLight.intensity * 0.96);

      // Smooth 3D Camera Parallax (Cinematic Gloomy Tilt & Drift)
      const targetCamX = mouse.x * 16 + dragRotOffset.y * 25;
      const targetCamY = mouse.y * 10 - (scrollY * 0.02) - dragRotOffset.x * 20;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.015), -15);

      // Rotate and breathe the Abyssal Monolith
      const monolithPulse = 1.0 + Math.sin(elapsedTime * 1.4) * 0.05;
      coreMesh.scale.set(monolithPulse, monolithPulse * 1.65, monolithPulse);
      monolithGroup.rotation.y += delta * 0.22;
      monolithGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.12 + mouse.y * 0.25;
      monolithGroup.rotation.z = Math.cos(elapsedTime * 0.4) * 0.08 + mouse.x * 0.2;

      shroudMesh.rotation.y -= delta * 0.18;
      shroudMesh.rotation.z += delta * 0.12;

      // Breathing Singularity
      const singPulse = 1.0 + Math.sin(elapsedTime * 3.2) * 0.15;
      singularityMesh.scale.set(singPulse, singPulse, singPulse);

      // Gyroscopic Eclipse Rings Rotation
      ring1.rotation.z += delta * 0.45;
      ring1.rotation.x += delta * 0.05;
      ring2.rotation.z -= delta * 0.38;
      ring2.rotation.y += delta * 0.08;
      ring3.rotation.z += delta * 0.28;

      // Orbiting Wisps
      for (const wisp of wisps) {
        wisp.angle += wisp.speed * delta;
        const wx = Math.cos(wisp.angle) * wisp.radius;
        const wy = Math.sin(wisp.angle) * wisp.radius * 0.35;
        const wz = Math.sin(wisp.angle) * wisp.radius;
        wisp.mesh.position.set(wx, wy, wz);
        wisp.mesh.rotation.x += delta * 2.0;
        wisp.mesh.rotation.y += delta * 2.4;
      }

      // Update Shockwave Ripple
      if (shockwaveActive) {
        shockwaveScale += 65.0 * delta;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
        shockwaveMat.opacity = Math.max(0, 0.9 - shockwaveScale / 80.0);
        if (shockwaveScale >= 80.0) {
          shockwaveActive = false;
        }
      }

      // Update Drifting Volumetric Mist
      const mPosAttr = mistGeo.attributes.position as THREE.BufferAttribute;
      const mPosArr = mPosAttr.array as Float32Array;
      for (let i = 0; i < mistCount; i++) {
        const i3 = i * 3;
        mPosArr[i3] += mistVels[i3];
        mPosArr[i3 + 1] += mistVels[i3 + 1];
        mPosArr[i3 + 2] += mistVels[i3 + 2];

        // Wrap around bounds
        if (mPosArr[i3] > 140) mPosArr[i3] = -140;
        if (mPosArr[i3] < -140) mPosArr[i3] = 140;
        if (mPosArr[i3 + 1] > 90) mPosArr[i3 + 1] = -90;
        if (mPosArr[i3 + 1] < -90) mPosArr[i3 + 1] = 90;
      }
      mPosAttr.needsUpdate = true;

      // Update Interactive Spectral Embers (Fluid Magnetic Wake & Repulsion)
      const ePosAttr = emberGeo.attributes.position as THREE.BufferAttribute;
      const ePosArr = ePosAttr.array as Float32Array;

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        const spd = emberSpeeds[i];
        const phase = emberPhases[i];

        // Harmonic ambient drift around base position
        const oscY = Math.sin(elapsedTime * spd + phase) * 2.2;
        const oscX = Math.cos(elapsedTime * (spd * 0.7) + phase) * 1.8;

        let px = emberBasePos[i3] + oscX;
        let py = emberBasePos[i3 + 1] + oscY;
        let pz = emberBasePos[i3 + 2];

        // Interactive Cursor Magnetic Fluid Wake
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dz = pz - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 1850 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          // Fluid repulsion force
          const force = (1 - dist / 43.0) * 18.0;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          // Swirl torque around cursor
          px += (-dy / dist) * (force * 0.5);
          py += (dx / dist) * (force * 0.5);
          pz += (dz / dist) * force * 0.35;
        }

        ePosArr[i3] = px;
        ePosArr[i3 + 1] = py;
        ePosArr[i3 + 2] = pz;
      }
      ePosAttr.needsUpdate = true;

      // Update Floating Peripheral Shards (Kinetic Bobbing & Magnetic Proximity)
      for (let i = 0; i < shards.length; i++) {
        const shard = shards[i];

        shard.group.rotation.x += shard.rotSpeed.x;
        shard.group.rotation.y += shard.rotSpeed.y;
        shard.group.rotation.z += shard.rotSpeed.z;

        // Damping
        shard.rotSpeed.x *= 0.994;
        shard.rotSpeed.y *= 0.994;

        // Harmonic bobbing
        const floatY = Math.sin(elapsedTime * shard.floatSpeed + shard.phase) * shard.floatAmp;
        const targetX = shard.basePos.x;
        const targetY = shard.basePos.y + floatY;
        const targetZ = shard.basePos.z;

        // Magnetic Attraction/Repulsion with cursor
        const dx = shard.group.position.x - mouse3D.x;
        const dy = shard.group.position.y - mouse3D.y;
        const dz = shard.group.position.z - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 2600 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const repel = (1 - dist / 51.0) * 22.0;
          shard.velocity.x += (dx / dist) * repel * delta;
          shard.velocity.y += (dy / dist) * repel * delta;
          shard.velocity.z += (dz / dist) * (repel * 0.4) * delta;

          // Shard points slightly toward cursor when close
          shard.rotSpeed.x += (Math.random() - 0.5) * 0.015;
          shard.rotSpeed.y += (Math.random() - 0.5) * 0.015;

          // Increase edge glow when cursor is near
          shard.highlightMat.opacity = Math.min(1.0, 0.7 + (1 - dist / 51.0) * 0.3);
        } else {
          shard.highlightMat.opacity = 0.65;
        }

        // Spring force returning to base position
        shard.velocity.x += (targetX - shard.group.position.x) * 0.035;
        shard.velocity.y += (targetY - shard.group.position.y) * 0.035;
        shard.velocity.z += (targetZ - shard.group.position.z) * 0.035;
        shard.velocity.multiplyScalar(0.92);

        shard.group.position.add(shard.velocity);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 16. Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      coreGeo.dispose();
      coreMat.dispose();
      coreEdgeGeo.dispose();
      coreEdgeMat.dispose();
      shroudGeo.dispose();
      shroudMat.dispose();
      singularityGeo.dispose();
      singularityMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      mistGeo.dispose();
      mistMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      mistTexture.dispose();
      emberTexture.dispose();

      for (const shard of shards) {
        shard.mesh.geometry.dispose();
        if (Array.isArray(shard.mesh.material)) {
          shard.mesh.material.forEach((m) => m.dispose());
        } else {
          shard.mesh.material.dispose();
        }
        shard.edges.geometry.dispose();
        shard.highlightMat.dispose();
      }

      for (const wisp of wisps) {
        wisp.mesh.geometry.dispose();
        if (Array.isArray(wisp.mesh.material)) {
          wisp.mesh.material.forEach((m) => m.dispose());
        } else {
          wisp.mesh.material.dispose();
        }
      }

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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        // Beautiful gloomy atmospheric gradient with dark vignette ensuring 100% crystal text visibility
        background:
          'radial-gradient(ellipse at 50% 25%, #0d061e 0%, #06030e 55%, #030107 100%)',
      }}
      aria-hidden="true"
    >
      {/* Central Content Dark Vignette Overlay: Guarantees that hero typography and cards are 100% visible and razor sharp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 35% 40%, rgba(4, 2, 10, 0.6) 0%, rgba(3, 2, 7, 0.25) 50%, rgba(2, 1, 5, 0.8) 100%)',
        }}
      />

      {/* Subtle gloomy atmospheric grain / mist overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.09) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
