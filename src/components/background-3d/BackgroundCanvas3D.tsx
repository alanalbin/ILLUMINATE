'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

interface Asteroid {
  mesh: THREE.Mesh;
  angle: number;
  radius: number;
  speed: number;
  tilt: number;
  rotSpeed: THREE.Vector3;
  baseY: number;
  velocity: THREE.Vector3;
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

    // 2. Scene & Deep Moody Atmospheric Space Fog
    const scene = new THREE.Scene();
    // Eerie deep space gloom fog
    const spaceFogColor = 0x04020a;
    scene.fog = new THREE.FogExp2(spaceFogColor, isMobile ? 0.0032 : 0.0022);

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      1600
    );
    camera.position.set(0, 2, 120);

    // 4. Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 5. Procedural Texture Generators for Gloomy Planets
    // A. Ringed Gas Giant Surface Texture (moody stormy atmospheric bands)
    const generateGasGiantTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep gloomy cosmic palette
      const bands = [
        '#080415', '#130a2a', '#1e103d', '#140c2e', '#2a144e',
        '#181033', '#10162f', '#221244', '#0d0720', '#1b1b38',
        '#28164a', '#120a27', '#080415'
      ];

      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      bands.forEach((color, idx) => {
        grad.addColorStop(idx / (bands.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Atmospheric turbulent cloud wisps
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      for (let y = 10; y < 250; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 512; x += 32) {
          const dy = Math.sin((x / 512) * Math.PI * 6 + y) * 5;
          ctx.lineTo(x, y + dy);
        }
        ctx.lineTo(512, y + 6);
        ctx.lineTo(0, y + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Cold cyan storm streak
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.beginPath();
      ctx.ellipse(340, 110, 48, 14, 0.1, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    };

    // B. Planetary Ring Texture (Concentric translucent icy dusty bands)
    const generateRingTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0.0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.12, 'rgba(139, 92, 246, 0.15)');
      grad.addColorStop(0.25, 'rgba(167, 139, 250, 0.6)');
      grad.addColorStop(0.42, 'rgba(56, 189, 248, 0.45)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.05)'); // Cassini Division gap
      grad.addColorStop(0.62, 'rgba(192, 132, 252, 0.55)');
      grad.addColorStop(0.85, 'rgba(124, 58, 237, 0.35)');
      grad.addColorStop(0.96, 'rgba(148, 163, 184, 0.15)');
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 1);

      return new THREE.CanvasTexture(canvas);
    };

    // C. Rocky Cratered Moon Texture
    const generateMoonTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Dark basalt stone base
      ctx.fillStyle = '#0f0c1b';
      ctx.fillRect(0, 0, 256, 256);

      // Impact crater maria & rings
      for (let i = 0; i < 45; i++) {
        const cx = Math.random() * 256;
        const cy = Math.random() * 256;
        const r = 3 + Math.random() * 18;

        const craterGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
        craterGrad.addColorStop(0, '#07050d');
        craterGrad.addColorStop(0.7, '#181329');
        craterGrad.addColorStop(1, '#2d2247');

        ctx.fillStyle = craterGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // D. Star/Ember Particle Sprite
    const generateStarSprite = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(224, 231, 255, 0.85)');
        grad.addColorStop(0.5, 'rgba(167, 139, 250, 0.45)');
        grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const gasGiantTexture = generateGasGiantTexture();
    const ringTexture = generateRingTexture();
    const moonTexture = generateMoonTexture();
    const starSprite = generateStarSprite();

    // 6. Planetary Systems Setup
    // A. PRIMARY GLOOMY RINGED PLANET (Placed in top-right / upper horizon to frame hero text!)
    const planet1Group = new THREE.Group();
    // Offset to upper-right so it never occludes left-column hero headlines and copy
    planet1Group.position.set(isMobile ? 18 : 36, isMobile ? 12 : 18, -45);
    scene.add(planet1Group);

    const planetRadius = isMobile ? 15 : 21;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      map: gasGiantTexture,
      roughness: 0.65,
      metalness: 0.2,
      emissive: 0x0d0720,
      emissiveIntensity: 0.35,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planet1Group.add(planetMesh);

    // Ethereal Planetary Atmosphere / Limb Glow Shell
    const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.025, 36, 36);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    planet1Group.add(atmoMesh);

    // Planetary Rings
    const ringInnerR = planetRadius * 1.45;
    const ringOuterR = planetRadius * 2.55;
    const ringGeo = new THREE.RingGeometry(ringInnerR, ringOuterR, 96);

    // Map 1D radial texture across the ring geometry
    const ringPos = ringGeo.attributes.position;
    const ringUVs = ringGeo.attributes.uv;
    for (let i = 0; i < ringPos.count; i++) {
      const x = ringPos.getX(i);
      const y = ringPos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - ringInnerR) / (ringOuterR - ringInnerR);
      ringUVs.setXY(i, u, 0.5);
    }
    ringGeo.attributes.uv.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4,
      metalness: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = -Math.PI / 6.5;
    planet1Group.add(ringMesh);

    // B. SECONDARY MOODY PLANET / MOON (Positioned in deep bottom-left perimeter)
    const moonGroup = new THREE.Group();
    moonGroup.position.set(isMobile ? -28 : -48, isMobile ? -22 : -28, -60);
    scene.add(moonGroup);

    const moonRadius = isMobile ? 8.5 : 12;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 36, 36);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x080414,
      emissiveIntensity: 0.2,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Crescent Atmosphere Glow on Moon
    const moonAtmoGeo = new THREE.SphereGeometry(moonRadius * 1.03, 32, 32);
    const moonAtmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const moonAtmoMesh = new THREE.Mesh(moonAtmoGeo, moonAtmoMat);
    moonGroup.add(moonAtmoMesh);

    // C. DISTANT ECLIPSED EXOPLANET / DWARF MOON
    const distantPlanetGroup = new THREE.Group();
    distantPlanetGroup.position.set(-8, 38, -110);
    scene.add(distantPlanetGroup);

    const distantGeo = new THREE.SphereGeometry(6, 28, 28);
    const distantMat = new THREE.MeshBasicMaterial({
      color: 0x181030,
    });
    const distantMesh = new THREE.Mesh(distantGeo, distantMat);
    distantPlanetGroup.add(distantMesh);

    // Eerie Eclipse Ring Corona around distant planet
    const eclipseGeo = new THREE.RingGeometry(6.1, 7.8, 48);
    const eclipseMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const eclipseMesh = new THREE.Mesh(eclipseGeo, eclipseMat);
    distantPlanetGroup.add(eclipseMesh);

    // 7. Dynamic Orbiting Asteroid Belt (Around the Main Planet)
    const asteroids: Asteroid[] = [];
    const asteroidCount = isMobile ? 24 : 52;
    const asteroidGeos = [
      () => new THREE.DodecahedronGeometry(0.8 + Math.random() * 1.2, 0),
      () => new THREE.OctahedronGeometry(0.7 + Math.random() * 1.0, 0),
      () => new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.9, 0),
    ];

    for (let a = 0; a < asteroidCount; a++) {
      const geo = asteroidGeos[a % asteroidGeos.length]();
      const mat = new THREE.MeshStandardMaterial({
        color: 0x161028,
        roughness: 0.85,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in an inclined asteroid belt plane
      const angle = (a / asteroidCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radius = planetRadius * 1.8 + Math.random() * (planetRadius * 1.4);
      const tilt = Math.PI / 2.3 + (Math.random() - 0.5) * 0.15;
      const speed = 0.25 + Math.random() * 0.35;
      const baseY = (Math.random() - 0.5) * 4;

      planet1Group.add(mesh);

      asteroids.push({
        mesh,
        angle,
        radius,
        speed,
        tilt,
        baseY,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.02
        ),
        velocity: new THREE.Vector3(0, 0, 0),
      });
    }

    // 8. Swirling Cosmic Dust & Starlight Field (Interactive particles)
    const starCount = isMobile ? 1200 : 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starBasePos = new Float32Array(starCount * 3);
    const starSpeeds = new Float32Array(starCount);

    for (let s = 0; s < starCount; s++) {
      const s3 = s * 3;
      // Spread across wide starry abyss with center text corridor reduced
      const angle = Math.random() * Math.PI * 2;
      const u = Math.random();
      const r = 24 + Math.pow(u, 1.3) * 110;

      const px = Math.cos(angle) * r * 1.4;
      const py = (Math.random() - 0.5) * 130;
      const pz = -120 + Math.random() * 160;

      starPos[s3] = px;
      starPos[s3 + 1] = py;
      starPos[s3 + 2] = pz;

      starBasePos[s3] = px;
      starBasePos[s3 + 1] = py;
      starBasePos[s3 + 2] = pz;

      starSpeeds[s] = 0.3 + Math.random() * 0.7;

      // Color gradation: spectral pale violet, cold cyan, and faint distant ember
      const colType = Math.random();
      const col = new THREE.Color();
      if (colType < 0.55) {
        col.lerpColors(new THREE.Color(0xa78bfa), new THREE.Color(0x818cf8), Math.random());
      } else if (colType < 0.88) {
        col.lerpColors(new THREE.Color(0x38bdf8), new THREE.Color(0x93c5fd), Math.random());
      } else {
        col.lerpColors(new THREE.Color(0xd97706), new THREE.Color(0xf59e0b), Math.random());
      }

      starColors[s3] = col.r;
      starColors[s3 + 1] = col.g;
      starColors[s3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: isMobile ? 3.2 : 3.8,
      map: starSprite,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 9. Lighting Setup (Gloomy Space Contrast with Eerie Spectral Illumination)
    // Shadowy ambient light
    const ambientLight = new THREE.AmbientLight(0x0e071c, 1.5);
    scene.add(ambientLight);

    // Distant Star Light (Casting dramatic crescent shadow on the planets)
    const starSunLight = new THREE.DirectionalLight(0xdbeafe, 2.8);
    starSunLight.position.set(70, 45, 60);
    scene.add(starSunLight);

    // Moody Atmospheric Backlight
    const rimLight = new THREE.DirectionalLight(0x7c3aed, 1.4);
    rimLight.position.set(-60, -40, -50);
    scene.add(rimLight);

    // Interactive 3D Cursor Probe Light - illuminates the night sides of planets in 3D!
    const cursorProbeLight = new THREE.PointLight(0xa78bfa, 3.8, 160);
    cursorProbeLight.position.set(0, 0, 30);
    scene.add(cursorProbeLight);

    // 10. Click Shockwave / Planetary Flare Ring
    const flareGeo = new THREE.RingGeometry(1, 4.0, 64);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    flareMesh.position.set(0, 0, 10);
    scene.add(flareMesh);

    let flareActive = false;
    let flareScale = 1.0;

    // 11. Interactive Pointer & Raycasting Physics
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
        targetDragRot.y = (deltaX / window.innerWidth) * 0.6;
        targetDragRot.x = (deltaY / window.innerHeight) * 0.5;
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
      // Trigger celestial shockwave pulse
      flareActive = true;
      flareScale = 1.0;
      flareMat.opacity = 0.95;
      flareMesh.position.set(mouse3D.x, mouse3D.y, 5);

      cursorProbeLight.intensity = 8.5;

      // Burst spin to planets and asteroids
      planetMesh.rotation.y += 0.35;
      ringMesh.rotation.z += 0.25;
      moonMesh.rotation.y += 0.4;

      for (const ast of asteroids) {
        ast.speed += 0.4;
        ast.rotSpeed.x += (Math.random() - 0.5) * 0.08;
        ast.rotSpeed.y += (Math.random() - 0.5) * 0.08;
      }
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

    // 12. 60FPS Planetary Simulation Loop
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

      // Cursor Light smoothly tracks coordinates and dims back to ambient
      cursorProbeLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 24);
      cursorProbeLight.intensity = Math.max(3.4, cursorProbeLight.intensity * 0.96);

      // Smooth 3D Camera Parallax
      const targetCamX = mouse.x * 14 + dragRotOffset.y * 22;
      const targetCamY = mouse.y * 9 - (scrollY * 0.02) - dragRotOffset.x * 18;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.015), -20);

      // Rotate Main Planet & Rings
      planetMesh.rotation.y += delta * 0.12;
      ringMesh.rotation.z += delta * 0.06;
      atmoMesh.rotation.y += delta * 0.15;

      // Subtle planetary floating harmonic oscillation
      planet1Group.position.y = (isMobile ? 12 : 18) + Math.sin(elapsedTime * 0.6) * 2.2;
      planet1Group.rotation.z = Math.sin(elapsedTime * 0.4) * 0.04 + mouse.x * 0.06;
      planet1Group.rotation.x = Math.cos(elapsedTime * 0.3) * 0.03 + mouse.y * 0.05;

      // Rotate Moon
      moonMesh.rotation.y -= delta * 0.08;
      moonGroup.position.y = (isMobile ? -22 : -28) + Math.cos(elapsedTime * 0.5) * 2.0;

      // Distant Planet corona shimmer
      eclipseMesh.rotation.z += delta * 0.1;
      const coronaPulse = 1.0 + Math.sin(elapsedTime * 2.2) * 0.06;
      eclipseMesh.scale.set(coronaPulse, coronaPulse, 1);

      // Update Orbiting Asteroids in the Belt
      for (const ast of asteroids) {
        ast.angle += ast.speed * delta;
        ast.speed = Math.max(0.2, ast.speed * 0.995); // return to normal orbit speed

        const cosA = Math.cos(ast.angle);
        const sinA = Math.sin(ast.angle);

        const x = cosA * ast.radius;
        const z = sinA * ast.radius;
        const y = Math.sin(ast.angle * 2) * (ast.radius * 0.15) + ast.baseY;

        // Apply belt tilt
        ast.mesh.position.set(x, y * Math.cos(ast.tilt) - z * Math.sin(ast.tilt), z * Math.cos(ast.tilt) + y * Math.sin(ast.tilt));

        ast.mesh.rotation.x += ast.rotSpeed.x;
        ast.mesh.rotation.y += ast.rotSpeed.y;
        ast.mesh.rotation.z += ast.rotSpeed.z;
      }

      // Update Flare Shockwave
      if (flareActive) {
        flareScale += 60.0 * delta;
        flareMesh.scale.set(flareScale, flareScale, 1);
        flareMat.opacity = Math.max(0, 0.95 - flareScale / 85.0);
        if (flareScale >= 85.0) {
          flareActive = false;
        }
      }

      // Update Swirling Cosmic Dust & Starlight Field (Interactive fluid wake)
      const sPosAttr = starGeo.attributes.position as THREE.BufferAttribute;
      const sPosArr = sPosAttr.array as Float32Array;

      for (let s = 0; s < starCount; s++) {
        const s3 = s * 3;
        const spd = starSpeeds[s];

        // Ambient gentle drift
        const oscY = Math.sin(elapsedTime * spd + s) * 2.0;
        const oscX = Math.cos(elapsedTime * (spd * 0.8) + s) * 1.6;

        let px = starBasePos[s3] + oscX;
        let py = starBasePos[s3 + 1] + oscY;
        let pz = starBasePos[s3 + 2];

        // Cursor Repulsion & Swirl Wake
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dz = pz - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 1900 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 43.0) * 18.0;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          // Swirl around pointer
          px += (-dy / dist) * (force * 0.45);
          py += (dx / dist) * (force * 0.45);
          pz += (dz / dist) * force * 0.3;
        }

        sPosArr[s3] = px;
        sPosArr[s3 + 1] = py;
        sPosArr[s3 + 2] = pz;
      }
      sPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 13. Resource Cleanup
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
      atmoGeo.dispose();
      atmoMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      moonAtmoGeo.dispose();
      moonAtmoMat.dispose();
      distantGeo.dispose();
      distantMat.dispose();
      eclipseGeo.dispose();
      eclipseMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      flareGeo.dispose();
      flareMat.dispose();
      gasGiantTexture.dispose();
      ringTexture.dispose();
      moonTexture.dispose();
      starSprite.dispose();

      for (const ast of asteroids) {
        ast.mesh.geometry.dispose();
        if (Array.isArray(ast.mesh.material)) {
          ast.mesh.material.forEach((m) => m.dispose());
        } else {
          ast.mesh.material.dispose();
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
        // Deep space cosmic gradient with atmospheric vignette ensuring 100% crystal text visibility
        background:
          'radial-gradient(ellipse at 75% 20%, #110726 0%, #06030f 50%, #030107 100%)',
      }}
      aria-hidden="true"
    >
      {/* Central Content Dark Vignette Overlay: Guarantees that hero typography and cards are 100% visible and razor sharp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 35% 45%, rgba(4, 2, 10, 0.65) 0%, rgba(3, 2, 7, 0.3) 55%, rgba(2, 1, 5, 0.85) 100%)',
        }}
      />

      {/* Atmospheric cosmic nebula dust / starry rim glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.18) 0%, transparent 60%), radial-gradient(circle at 15% 75%, rgba(56, 189, 248, 0.12) 0%, transparent 55%)',
        }}
      />
    </div>
  );
}
