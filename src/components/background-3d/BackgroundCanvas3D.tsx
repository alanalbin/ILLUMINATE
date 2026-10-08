'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

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

    // 2. Scene & Deep Atmospheric Cosmic Gloom Fog
    const scene = new THREE.Scene();
    const gloomFogColor = 0x05030c;
    scene.fog = new THREE.FogExp2(gloomFogColor, isMobile ? 0.0034 : 0.0024);

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      1400
    );
    camera.position.set(0, 0, 110);

    // 4. Renderer with High Dynamic Range Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 5. Procedural Texture Generators
    // A. Center Planet Surface Texture (High-res moody stormy gas/obsidian bands with bioluminescent fissures)
    const generateCenterPlanetTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep gloomy cosmic gradient bands
      const bands = [
        '#04020a', '#0b0618', '#140c2c', '#0d0720', '#1c1038',
        '#12182c', '#221242', '#0f0924', '#181b36', '#261445',
        '#100824', '#15112e', '#05020c'
      ];

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      bands.forEach((color, idx) => {
        grad.addColorStop(idx / (bands.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Turbulent cloud swirl belts
      ctx.fillStyle = 'rgba(168, 85, 247, 0.09)';
      for (let y = 30; y < 490; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 32) {
          const dy = Math.sin((x / 1024) * Math.PI * 8 + y) * 8;
          ctx.lineTo(x, y + dy);
        }
        ctx.lineTo(1024, y + 10);
        ctx.lineTo(0, y + 10);
        ctx.closePath();
        ctx.fill();
      }

      // Deep moonlight cyan storm vortex
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.ellipse(680, 220, 110, 32, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Delicate bioluminescent nocturnal filament veins
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.22)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 18; i++) {
        let vx = (i * 58) % 1024;
        let vy = 120 + ((i * 47) % 280);
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        for (let step = 0; step < 7; step++) {
          vx += (Math.random() - 0.4) * 28;
          vy += (Math.random() - 0.5) * 16;
          ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    };

    // B. Massive Center Planetary Rings Texture
    const generateRingTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0.0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.08, 'rgba(139, 92, 246, 0.12)');
      grad.addColorStop(0.2, 'rgba(168, 85, 247, 0.55)');
      grad.addColorStop(0.38, 'rgba(56, 189, 248, 0.45)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.05)'); // Cassini Division gap
      grad.addColorStop(0.56, 'rgba(192, 132, 252, 0.6)');
      grad.addColorStop(0.75, 'rgba(124, 58, 237, 0.35)');
      grad.addColorStop(0.9, 'rgba(148, 163, 184, 0.2)');
      grad.addColorStop(0.98, 'rgba(56, 189, 248, 0.1)');
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1);

      return new THREE.CanvasTexture(canvas);
    };

    // C. Particle Mote Texture
    const generateParticleSprite = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(224, 231, 255, 0.85)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
        grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = generateCenterPlanetTexture();
    const ringTexture = generateRingTexture();
    const particleSprite = generateParticleSprite();

    // 6. THE CENTER PLANET SYSTEM
    // Positioned dead-center in the background (z: -28)
    const centerPlanetGroup = new THREE.Group();
    centerPlanetGroup.position.set(0, -1, -26);
    scene.add(centerPlanetGroup);

    // Planet Sphere
    const planetRadius = isMobile ? 18 : 26;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.72,
      metalness: 0.15,
      emissive: 0x060312,
      emissiveIntensity: 0.35,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    // Axial planet tilt
    planetMesh.rotation.z = 0.22;
    centerPlanetGroup.add(planetMesh);

    // Atmospheric Ethereal Limb Glow Shell (Moody Aurora Border)
    const atmosphereGeo = new THREE.SphereGeometry(planetRadius * 1.03, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    centerPlanetGroup.add(atmosphereMesh);

    // Dynamic Atmospheric Cloud / Shroud Layer
    const cloudGeo = new THREE.SphereGeometry(planetRadius * 1.012, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x181036,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      roughness: 0.8,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    centerPlanetGroup.add(cloudMesh);

    // 7. Center Planet Majestic Rings (Multi-layered, tilted at a dramatic angle)
    const ringInnerR = planetRadius * 1.45;
    const ringOuterR = planetRadius * 2.75;
    const ringGeo = new THREE.RingGeometry(ringInnerR, ringOuterR, 128);

    // UV mapping for radial gradient
    const ringPositions = ringGeo.attributes.position;
    const ringUVs = ringGeo.attributes.uv;
    for (let i = 0; i < ringPositions.count; i++) {
      const rx = ringPositions.getX(i);
      const ry = ringPositions.getY(i);
      const dist = Math.sqrt(rx * rx + ry * ry);
      const u = (dist - ringInnerR) / (ringOuterR - ringInnerR);
      ringUVs.setXY(i, u, 0.5);
    }
    ringGeo.attributes.uv.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      roughness: 0.35,
      metalness: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.35;
    ringMesh.rotation.y = -Math.PI / 8;
    centerPlanetGroup.add(ringMesh);

    // Secondary Thin Outer Gossamer Halo Ring
    const haloRingGeo = new THREE.RingGeometry(planetRadius * 2.85, planetRadius * 3.25, 96);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRingMesh.rotation.x = ringMesh.rotation.x;
    haloRingMesh.rotation.y = ringMesh.rotation.y;
    centerPlanetGroup.add(haloRingMesh);

    // 8. Orbiting Planetary Ring Particles & Accretion Dust (No floating balls, only ring dust!)
    const ringParticleCount = isMobile ? 1200 : 2800;
    const ringParticleGeo = new THREE.BufferGeometry();
    const ringParticlePos = new Float32Array(ringParticleCount * 3);
    const ringParticleColors = new Float32Array(ringParticleCount * 3);
    const ringParticleRadii = new Float32Array(ringParticleCount);
    const ringParticleAngles = new Float32Array(ringParticleCount);
    const ringParticleSpeeds = new Float32Array(ringParticleCount);
    const ringParticleHeights = new Float32Array(ringParticleCount);

    for (let p = 0; p < ringParticleCount; p++) {
      const p3 = p * 3;
      const angle = Math.random() * Math.PI * 2;
      // Between inner and outer ring
      const rRatio = Math.random();
      const r = ringInnerR * 0.95 + rRatio * (ringOuterR * 1.12 - ringInnerR * 0.95);
      const h = (Math.random() - 0.5) * 2.5;

      ringParticleAngles[p] = angle;
      ringParticleRadii[p] = r;
      // Keplerian speed: closer orbits faster
      ringParticleSpeeds[p] = (0.28 / Math.sqrt(r / planetRadius)) * (0.85 + Math.random() * 0.3);
      ringParticleHeights[p] = h;

      // Ring coordinate in ring plane
      const rx = Math.cos(angle) * r;
      const rz = Math.sin(angle) * r;
      const ry = h;

      // Rotate to match ring tilt (Math.PI / 2.35 around X, -Math.PI / 8 around Y)
      const cosX = Math.cos(Math.PI / 2.35);
      const sinX = Math.sin(Math.PI / 2.35);
      const cosY = Math.cos(-Math.PI / 8);
      const sinY = Math.sin(-Math.PI / 8);

      const y1 = ry * cosX - rz * sinX;
      const z1 = ry * sinX + rz * cosX;
      const x2 = rx * cosY + z1 * sinY;
      const z2 = -rx * sinY + z1 * cosY;

      ringParticlePos[p3] = x2;
      ringParticlePos[p3 + 1] = y1;
      ringParticlePos[p3 + 2] = z2;

      // Color gradation: Pale Violet, Moonlight Teal, and Soft Starlight
      const col = new THREE.Color();
      if (rRatio < 0.4) {
        col.lerpColors(new THREE.Color(0xa78bfa), new THREE.Color(0x818cf8), Math.random());
      } else if (rRatio < 0.8) {
        col.lerpColors(new THREE.Color(0x38bdf8), new THREE.Color(0xa5f3fc), Math.random());
      } else {
        col.lerpColors(new THREE.Color(0xc084fc), new THREE.Color(0xf59e0b), Math.random() * 0.4);
      }

      ringParticleColors[p3] = col.r;
      ringParticleColors[p3 + 1] = col.g;
      ringParticleColors[p3 + 2] = col.b;
    }

    ringParticleGeo.setAttribute('position', new THREE.BufferAttribute(ringParticlePos, 3));
    ringParticleGeo.setAttribute('color', new THREE.BufferAttribute(ringParticleColors, 3));

    const ringParticleMat = new THREE.PointsMaterial({
      size: isMobile ? 2.6 : 3.4,
      map: particleSprite,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const ringParticlesMesh = new THREE.Points(ringParticleGeo, ringParticleMat);
    centerPlanetGroup.add(ringParticlesMesh);

    // 9. Ambient Gloomy Stardust (Deep background starlight)
    const stardustCount = isMobile ? 800 : 1800;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPos = new Float32Array(stardustCount * 3);
    const stardustColors = new Float32Array(stardustCount * 3);

    for (let s = 0; s < stardustCount; s++) {
      const s3 = s * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 75 + Math.random() * 160;

      stardustPos[s3] = rad * Math.sin(phi) * Math.cos(theta) * 1.5;
      stardustPos[s3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      stardustPos[s3 + 2] = -50 - rad * Math.abs(Math.cos(phi));

      const col = new THREE.Color();
      col.lerpColors(new THREE.Color(0x8b5cf6), new THREE.Color(0x38bdf8), Math.random());
      stardustColors[s3] = col.r;
      stardustColors[s3 + 1] = col.g;
      stardustColors[s3 + 2] = col.b;
    }

    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));
    stardustGeo.setAttribute('color', new THREE.BufferAttribute(stardustColors, 3));

    const stardustMat = new THREE.PointsMaterial({
      size: isMobile ? 2.2 : 2.8,
      map: particleSprite,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stardustField = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustField);

    // 10. Ethereal 3D Lighting Setup (Gloomy High Contrast)
    // Deep gloomy ambient light
    const ambientLight = new THREE.AmbientLight(0x0e081e, 1.4);
    scene.add(ambientLight);

    // Distant Cold Sun / Starlight (Casts crescent shadow terminator across the Center Planet)
    const sunLight = new THREE.DirectionalLight(0xdbeafe, 2.8);
    sunLight.position.set(65, 40, 50);
    scene.add(sunLight);

    // Rim Backlight (Accentuates the silhouette edges)
    const rimLight = new THREE.DirectionalLight(0x7c3aed, 1.6);
    rimLight.position.set(-60, -45, -40);
    scene.add(rimLight);

    // Interactive 3D Cursor Probe Light - illuminates the night side of the center planet!
    const cursorProbeLight = new THREE.PointLight(0xa78bfa, 3.8, 160);
    cursorProbeLight.position.set(0, 0, 30);
    scene.add(cursorProbeLight);

    // 11. Interactive Shockwave (Expanding Planetary Auroral Ring)
    const shockwaveGeo = new THREE.RingGeometry(1, 4.0, 64);
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

    // 12. Pointer, Raycasting & Drag Interaction
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
        targetDragRot.y = (deltaX / window.innerWidth) * 0.9;
        targetDragRot.x = (deltaY / window.innerHeight) * 0.7;
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

    const onWindowClick = () => {
      // Trigger auroral shockwave on click
      shockwaveActive = true;
      shockwaveScale = 1.0;
      shockwaveMat.opacity = 0.95;
      shockwaveMesh.position.set(mouse3D.x, mouse3D.y, 5);

      cursorProbeLight.intensity = 8.5;

      // Burst of angular acceleration to planet and rings
      planetMesh.rotation.y += 0.4;
      cloudMesh.rotation.y += 0.6;
      ringMesh.rotation.z += 0.3;
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

    // 13. 60FPS Planetary Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer easing
      mouse.x += (targetMouse.x - mouse.x) * 0.055;
      mouse.y += (targetMouse.y - mouse.y) * 0.055;
      scrollY += (targetScrollY - scrollY) * 0.05;

      dragRotOffset.x += (targetDragRot.x - dragRotOffset.x) * 0.05;
      dragRotOffset.y += (targetDragRot.y - dragRotOffset.y) * 0.05;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Interactive Cursor Probe Light glides with pointer
      cursorProbeLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 24);
      cursorProbeLight.intensity = Math.max(3.4, cursorProbeLight.intensity * 0.96);

      // Smooth 3D Camera Parallax
      const targetCamX = mouse.x * 12 + dragRotOffset.y * 20;
      const targetCamY = mouse.y * 8 - (scrollY * 0.02) - dragRotOffset.x * 16;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.015), -26);

      // Rotate Center Planet & Cloud Layer
      planetMesh.rotation.y += delta * 0.12;
      cloudMesh.rotation.y += delta * 0.18;
      atmosphereMesh.rotation.y += delta * 0.06;

      // Center Planet subtle harmonic breathing
      const breath = 1.0 + Math.sin(elapsedTime * 0.8) * 0.015;
      planetMesh.scale.set(breath, breath, breath);

      // Interactive Gyroscopic Tilt of the entire Center Planet System toward cursor & drag
      const targetTiltY = mouse.x * 0.25 + dragRotOffset.y * 0.5;
      const targetTiltX = mouse.y * 0.2 + dragRotOffset.x * 0.4;
      centerPlanetGroup.rotation.y += (targetTiltY - centerPlanetGroup.rotation.y) * 0.04;
      centerPlanetGroup.rotation.x += (targetTiltX - centerPlanetGroup.rotation.x) * 0.04;

      // Rotate Rings
      ringMesh.rotation.z += delta * 0.05;
      haloRingMesh.rotation.z += delta * 0.03;

      // Update Shockwave Ripple
      if (shockwaveActive) {
        shockwaveScale += 62.0 * delta;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
        shockwaveMat.opacity = Math.max(0, 0.95 - shockwaveScale / 85.0);
        if (shockwaveScale >= 85.0) {
          shockwaveActive = false;
        }
      }

      // Update Orbiting Ring Particles in Keplerian Orbits
      const rPosAttr = ringParticleGeo.attributes.position as THREE.BufferAttribute;
      const rPosArr = rPosAttr.array as Float32Array;

      // Matrix transforms for ring plane
      const cosX = Math.cos(Math.PI / 2.35);
      const sinX = Math.sin(Math.PI / 2.35);
      const cosY = Math.cos(-Math.PI / 8);
      const sinY = Math.sin(-Math.PI / 8);

      for (let p = 0; p < ringParticleCount; p++) {
        const p3 = p * 3;
        ringParticleAngles[p] += ringParticleSpeeds[p] * delta * 0.8;
        const angle = ringParticleAngles[p];
        const r = ringParticleRadii[p];
        const h = ringParticleHeights[p];

        const rx = Math.cos(angle) * r;
        const rz = Math.sin(angle) * r;
        const ry = h;

        // Rotate into inclined ring plane
        const y1 = ry * cosX - rz * sinX;
        const z1 = ry * sinX + rz * cosX;
        let px = rx * cosY + z1 * sinY;
        let py = y1;
        let pz = -rx * sinY + z1 * cosY;

        // Interactive cursor repulsion in ring space
        const worldX = px + centerPlanetGroup.position.x;
        const worldY = py + centerPlanetGroup.position.y;
        const worldZ = pz + centerPlanetGroup.position.z;

        const dx = worldX - mouse3D.x;
        const dy = worldY - mouse3D.y;
        const dz = worldZ - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 1600 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 40.0) * 14.0;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          pz += (dz / dist) * force * 0.4;
        }

        rPosArr[p3] = px;
        rPosArr[p3 + 1] = py;
        rPosArr[p3 + 2] = pz;
      }
      rPosAttr.needsUpdate = true;

      // Stardust slow ambient drift
      stardustField.rotation.y += delta * 0.015;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 14. Resource Cleanup
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

      planetGeo.dispose();
      planetMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      haloRingGeo.dispose();
      haloRingMat.dispose();
      ringParticleGeo.dispose();
      ringParticleMat.dispose();
      stardustGeo.dispose();
      stardustMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      planetTexture.dispose();
      ringTexture.dispose();
      particleSprite.dispose();

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
        // Deep moody cosmic abyss gradient with central planetary depth
        background:
          'radial-gradient(ellipse at 50% 35%, #0f0722 0%, #06030e 55%, #020106 100%)',
      }}
      aria-hidden="true"
    >
      {/* Central Content Dark Vignette Overlay: Guarantees that hero typography and cards are 100% visible and razor sharp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(4, 2, 10, 0.62) 0%, rgba(3, 2, 7, 0.25) 50%, rgba(2, 1, 5, 0.85) 100%)',
        }}
      />

      {/* Atmospheric planetary cosmic rim glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
