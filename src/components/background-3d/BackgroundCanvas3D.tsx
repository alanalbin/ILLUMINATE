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

    const isMobile = window.innerWidth < 768;

    // 2. Scene, Camera & Deep Cosmic Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030208, 0.0022);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      1400
    );
    camera.position.set(0, 6, 120);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Root 3D group for black hole system (allows collective tilt & spin)
    const blackHoleGroup = new THREE.Group();
    scene.add(blackHoleGroup);

    // 3. High-Quality Glowing Star Sprite Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.18, 'rgba(235, 245, 255, 0.95)');
      grad.addColorStop(0.42, 'rgba(168, 85, 247, 0.55)');
      grad.addColorStop(0.72, 'rgba(6, 182, 212, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // 4. The Event Horizon (Pure Black Void Singularity)
    // Absolute pitch-black sphere that absorbs all light and occludes objects behind it
    const horizonRadius = 15.2;
    const horizonGeo = new THREE.SphereGeometry(horizonRadius, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    blackHoleGroup.add(horizonMesh);

    // 5. The Photon Sphere / Inner Relativistic Rings
    // Intense glowing razor-sharp rings hugging the event horizon
    const photonRingGeo1 = new THREE.RingGeometry(15.1, 16.6, 128);
    const photonRingMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const photonRing1 = new THREE.Mesh(photonRingGeo1, photonRingMat1);
    photonRing1.rotation.x = Math.PI / 2.3;
    blackHoleGroup.add(photonRing1);

    const photonRingGeo2 = new THREE.RingGeometry(16.5, 19.8, 128);
    const photonRingMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const photonRing2 = new THREE.Mesh(photonRingGeo2, photonRingMat2);
    photonRing2.rotation.x = Math.PI / 2.3;
    blackHoleGroup.add(photonRing2);

    // Subtle spherical outer corona halo around event horizon
    const coronaGeo = new THREE.RingGeometry(15.1, 18.2, 96);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    // Faces camera directly
    coronaMesh.position.z = 0.1;
    blackHoleGroup.add(coronaMesh);

    // 6. Equatorial Accretion Disk (Swirling Superheated Plasma Particles)
    const diskParticleCount = isMobile ? 2200 : 4500;
    const diskGeo = new THREE.BufferGeometry();
    const diskPositions = new Float32Array(diskParticleCount * 3);
    const diskColors = new Float32Array(diskParticleCount * 3);

    // Particle state tracking
    const diskRadii = new Float32Array(diskParticleCount);
    const diskAngles = new Float32Array(diskParticleCount);
    const diskSpeeds = new Float32Array(diskParticleCount);
    const diskHeights = new Float32Array(diskParticleCount);
    const diskInfallSpeeds = new Float32Array(diskParticleCount);

    const minRadius = 16.5;
    const maxRadius = 78.0;

    for (let i = 0; i < diskParticleCount; i++) {
      const i3 = i * 3;

      // Concentration distribution: more dense near the event horizon
      const u = Math.random();
      const radius = minRadius + Math.pow(u, 1.8) * (maxRadius - minRadius);
      const angle = Math.random() * Math.PI * 2;

      // Keplerian differential rotation: v ~ 1 / sqrt(r)
      const speed = (0.75 / Math.sqrt(radius)) * (0.85 + Math.random() * 0.3);
      // Vertical flare thickness increases toward outer edge
      const height = (Math.random() - 0.5) * (1.2 + (radius / maxRadius) * 4.5);

      diskRadii[i] = radius;
      diskAngles[i] = angle;
      diskSpeeds[i] = speed;
      diskHeights[i] = height;
      diskInfallSpeeds[i] = 0.02 + Math.random() * 0.04;

      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;

      diskPositions[i3] = x;
      diskPositions[i3 + 1] = y;
      diskPositions[i3 + 2] = z;

      // Radial color grading:
      // Inner edge: Incandescent White / Electric Cyan (superhot)
      // Middle: High-energy Violet / Magenta
      // Outer rim: Radiant Amber Gold / Cosmic Plasma
      const t = (radius - minRadius) / (maxRadius - minRadius);
      let col = new THREE.Color();

      if (t < 0.2) {
        col.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0x00f0ff), t / 0.2);
      } else if (t < 0.6) {
        col.lerpColors(new THREE.Color(0x00f0ff), new THREE.Color(0xa855f7), (t - 0.2) / 0.4);
      } else {
        col.lerpColors(new THREE.Color(0xa855f7), new THREE.Color(0xf59e0b), (t - 0.6) / 0.4);
      }

      diskColors[i3] = col.r;
      diskColors[i3 + 1] = col.g;
      diskColors[i3 + 2] = col.b;
    }

    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));

    const diskMat = new THREE.PointsMaterial({
      size: isMobile ? 3.4 : 4.0,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: 0.9,
    });

    const accretionDisk = new THREE.Points(diskGeo, diskMat);
    accretionDisk.rotation.x = Math.PI / 2.3;
    blackHoleGroup.add(accretionDisk);

    // 7. Gravitational Lensing Light Halo (The Iconic Interstellar Upper/Lower Light Arc)
    // Light from the back of the accretion disk gravitationally bent over the event horizon
    const haloParticleCount = isMobile ? 900 : 1800;
    const haloGeo = new THREE.BufferGeometry();
    const haloPositions = new Float32Array(haloParticleCount * 3);
    const haloColors = new Float32Array(haloParticleCount * 3);

    const haloAngles = new Float32Array(haloParticleCount);
    const haloRadii = new Float32Array(haloParticleCount);
    const haloSpeeds = new Float32Array(haloParticleCount);
    const haloIsUpper = new Uint8Array(haloParticleCount);

    for (let i = 0; i < haloParticleCount; i++) {
      const i3 = i * 3;
      const isUpper = Math.random() > 0.45 ? 1 : 0;
      haloIsUpper[i] = isUpper;

      // Arc spans over the top/bottom behind the horizon
      const angle = isUpper
        ? 0.1 + Math.random() * (Math.PI - 0.2)
        : Math.PI + 0.1 + Math.random() * (Math.PI - 0.2);

      const r = 16.5 + Math.pow(Math.random(), 1.5) * 26.0;
      haloAngles[i] = angle;
      haloRadii[i] = r;
      haloSpeeds[i] = (0.55 / Math.sqrt(r)) * (0.8 + Math.random() * 0.4);

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = (Math.random() - 0.5) * 6.0 - 5.0; // Behind black hole equator

      haloPositions[i3] = x;
      haloPositions[i3 + 1] = y;
      haloPositions[i3 + 2] = z;

      // Glowing cyan & violet lens light
      const t = (r - 16.5) / 26.0;
      const col = new THREE.Color().lerpColors(
        new THREE.Color(0x00f0ff),
        new THREE.Color(0xa855f7),
        t
      );

      haloColors[i3] = col.r;
      haloColors[i3 + 1] = col.g;
      haloColors[i3 + 2] = col.b;
    }

    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
    haloGeo.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));

    const haloMat = new THREE.PointsMaterial({
      size: isMobile ? 3.6 : 4.4,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: 0.85,
    });

    const lensingHalo = new THREE.Points(haloGeo, haloMat);
    blackHoleGroup.add(lensingHalo);

    // 8. Relativistic Polar Jet Filaments (Subtle high-energy plasma along rotation axis)
    const jetCount = isMobile ? 120 : 260;
    const jetGeo = new THREE.BufferGeometry();
    const jetPositions = new Float32Array(jetCount * 3);
    const jetColors = new Float32Array(jetCount * 3);

    for (let i = 0; i < jetCount; i++) {
      const i3 = i * 3;
      const dir = i % 2 === 0 ? 1 : -1;
      const dist = 14 + Math.random() * 85;
      const spread = (dist / 85) * 5.0;

      jetPositions[i3] = (Math.random() - 0.5) * spread;
      jetPositions[i3 + 1] = dir * dist;
      jetPositions[i3 + 2] = (Math.random() - 0.5) * spread;

      const col = new THREE.Color(0x00f0ff).lerp(new THREE.Color(0xffffff), 0.5);
      jetColors[i3] = col.r;
      jetColors[i3 + 1] = col.g;
      jetColors[i3 + 2] = col.b;
    }

    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
    jetGeo.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));

    const jetMat = new THREE.PointsMaterial({
      size: 2.8,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.55,
    });
    const polarJets = new THREE.Points(jetGeo, jetMat);
    polarJets.rotation.x = Math.PI / 2.3;
    blackHoleGroup.add(polarJets);

    // 9. Deep Field Ambient Stars (Subtle background starfield)
    const starCount = isMobile ? 260 : 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 360;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 260;
      starPositions[i3 + 2] = -50 - Math.random() * 180;

      const isGold = Math.random() > 0.6;
      starColors[i3] = isGold ? 0.96 : 0.45;
      starColors[i3 + 1] = isGold ? 0.75 : 0.65;
      starColors[i3 + 2] = isGold ? 0.35 : 0.98;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.6,
    });
    const backgroundStars = new THREE.Points(starGeo, starMat);
    scene.add(backgroundStars);

    // 10. Singularity Shockwave Ring (Click trigger)
    const shockwaveGeo = new THREE.RingGeometry(15.2, 16.5, 96);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2.3;
    blackHoleGroup.add(shockwaveMesh);

    let shockwaveActive = false;
    let shockwaveRadius = 15.2;

    // 11. Interactive Mouse & Tracking State
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    let scrollY = 0;
    let targetScrollY = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      // Trigger relativistic Hawking flare / gravitational shockwave
      shockwaveActive = true;
      shockwaveRadius = 15.2;
      shockwaveMat.opacity = 0.95;
      photonRingMat1.opacity = 1.0;
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
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 12. 60FPS Relativistic Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer easing
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;
      scrollY += (targetScrollY - scrollY) * 0.05;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Camera Parallax
      const targetCamX = mouse.x * 20;
      const targetCamY = mouse.y * 12 - (scrollY * 0.02);
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.015), 0);

      // Smooth interactive Black Hole Group Tilt based on cursor
      // Warps the entire spacetime system toward pointer
      const targetRotX = (mouse.y * 0.28) + (Math.sin(elapsedTime * 0.3) * 0.04);
      const targetRotY = (mouse.x * 0.38) + (elapsedTime * 0.06);
      blackHoleGroup.rotation.x += (targetRotX - blackHoleGroup.rotation.x) * 0.05;
      blackHoleGroup.rotation.y += (targetRotY - blackHoleGroup.rotation.y) * 0.05;

      // Photon Rings subtle breath
      const pulse = 1.0 + Math.sin(elapsedTime * 3.5) * 0.04;
      coronaMesh.scale.set(pulse, pulse, 1);
      photonRingMat1.opacity = Math.max(0.75, photonRingMat1.opacity * 0.98);

      // Update Singularity Shockwave
      if (shockwaveActive) {
        shockwaveRadius += 65.0 * delta;
        shockwaveMesh.scale.set(
          shockwaveRadius / 15.2,
          shockwaveRadius / 15.2,
          1
        );
        shockwaveMat.opacity = Math.max(0, 1 - shockwaveRadius / 95.0);
        if (shockwaveRadius >= 95.0) {
          shockwaveActive = false;
        }
      }

      // Update Equatorial Accretion Disk Simulation
      const dPosAttr = diskGeo.attributes.position as THREE.BufferAttribute;
      const dColAttr = diskGeo.attributes.color as THREE.BufferAttribute;
      const dPos = dPosAttr.array as Float32Array;
      const dCol = dColAttr.array as Float32Array;

      for (let i = 0; i < diskParticleCount; i++) {
        const i3 = i * 3;

        // Differential Keplerian orbital angular velocity
        let spd = diskSpeeds[i];
        let angle = diskAngles[i] + spd * delta * 2.8;

        // Gravitational infalling spiral toward event horizon
        let r = diskRadii[i] - diskInfallSpeeds[i] * delta * 12.0;

        // If particle falls beyond event horizon, recycle to outer disk boundary
        if (r < minRadius) {
          r = maxRadius - Math.random() * 4.0;
          angle = Math.random() * Math.PI * 2;
          diskSpeeds[i] = (0.75 / Math.sqrt(r)) * (0.85 + Math.random() * 0.3);
        }

        diskRadii[i] = r;
        diskAngles[i] = angle;

        // Spiral arm modulation
        const spiralPhase = angle * 2.0 - r * 0.12 + elapsedTime * 0.8;
        const armDensity = Math.sin(spiralPhase);
        const yOffset = diskHeights[i] + armDensity * 0.45;

        dPos[i3] = Math.cos(angle) * r;
        dPos[i3 + 1] = yOffset;
        dPos[i3 + 2] = Math.sin(angle) * r;

        // Relativistic Doppler Beaming: Particles moving towards camera are boosted
        // (x-component of velocity: -sin(angle) * r)
        const vTowards = -Math.sin(angle);
        const dopplerBoost = 1.0 + vTowards * 0.38;

        // Base color according to current radius
        const t = (r - minRadius) / (maxRadius - minRadius);
        let cr = 1, cg = 1, cb = 1;

        if (t < 0.2) {
          cr = 0.85; cg = 0.95; cb = 1.0;
        } else if (t < 0.6) {
          cr = 0.45 + (t - 0.2) * 0.8;
          cg = 0.35;
          cb = 0.95;
        } else {
          cr = 0.95;
          cg = 0.62;
          cb = 0.18;
        }

        dCol[i3] = Math.min(1.0, cr * dopplerBoost);
        dCol[i3 + 1] = Math.min(1.0, cg * dopplerBoost);
        dCol[i3 + 2] = Math.min(1.0, cb * dopplerBoost);
      }

      dPosAttr.needsUpdate = true;
      dColAttr.needsUpdate = true;

      // Update Gravitational Lensing Halo (Upper & Lower bent arcs)
      const hPosAttr = haloGeo.attributes.position as THREE.BufferAttribute;
      const hPos = hPosAttr.array as Float32Array;

      for (let i = 0; i < haloParticleCount; i++) {
        const i3 = i * 3;
        const spd = haloSpeeds[i];
        let angle = haloAngles[i] + spd * delta * 2.2;
        haloAngles[i] = angle;

        const r = haloRadii[i];
        hPos[i3] = Math.cos(angle) * r;
        hPos[i3 + 1] = Math.sin(angle) * r;
      }
      hPosAttr.needsUpdate = true;

      // Polar jet subtle pulse
      polarJets.rotation.y = elapsedTime * 0.8;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 13. Resource Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      horizonGeo.dispose();
      horizonMat.dispose();
      photonRingGeo1.dispose();
      photonRingMat1.dispose();
      photonRingGeo2.dispose();
      photonRingMat2.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      jetGeo.dispose();
      jetMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#040208]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #0e051c 0%, #05020c 60%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
