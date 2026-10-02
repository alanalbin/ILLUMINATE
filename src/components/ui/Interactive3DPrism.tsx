'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Flame,
  Target,
  Sparkles,
  Gamepad2,
  Play,
  Pause,
} from 'lucide-react';

interface Interactive3DPrismProps {
  className?: string;
}

interface TargetData {
  mesh: THREE.Mesh;
  type: 'crystal' | 'spark' | 'bomb' | 'drone';
  points: number;
  rotSpeed: THREE.Vector3;
  velocity: THREE.Vector3;
  hp: number;
  maxHp: number;
  scale: number;
}

interface LaserBolt {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

interface DebrisParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

export default function Interactive3DPrism({ className = '' }: Interactive3DPrismProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game UI State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [empCharge, setEmpCharge] = useState(0);
  const [wave, setWave] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [floatingBonus, setFloatingBonus] = useState<{ text: string; id: number } | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Action Bridge Refs
  const fireLaserRef = useRef<((clientX: number, clientY: number) => void) | null>(null);
  const triggerEmpRef = useRef<(() => void) | null>(null);
  const resetGameRef = useRef<(() => void) | null>(null);
  const startGameRef = useRef<(() => void) | null>(null);

  // Sound Synthesizer via Web Audio API (zero external assets, crisp retro sci-fi SFX)
  const playSound = useCallback(
    (type: 'laser' | 'hit' | 'bomb' | 'emp' | 'combo') => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'laser') {
          // Sharp downward laser chirping sweep
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'hit') {
          // Crispy crystal shatter chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'bomb') {
          // Low resonant boom
          osc.type = 'sine';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'emp') {
          // Electric shockwave swell
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === 'combo') {
          // Ascending victory chord
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(660, now + 0.06);
          osc.frequency.setValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        }
      } catch {
        // Audio playback unavailable or restricted
      }
    },
    [soundEnabled]
  );

  // Load High Score from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('illuminate_blaster_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {}
  }, []);

  // Timer Tick during gameplay
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Update High Score when score exceeds it
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('illuminate_blaster_highscore', score.toString());
      } catch {}
    }
  }, [score, highScore]);

  // Main Three.js Game Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 360;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);
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

    // 2. Cyber Space Arena Lighting
    const ambientLight = new THREE.AmbientLight(0x180b2a, 1.8);
    scene.add(ambientLight);

    const cannonLight = new THREE.PointLight(0x38bdf8, 3.5, 20);
    cannonLight.position.set(0, -3.5, 4);
    scene.add(cannonLight);

    const arenaLight = new THREE.PointLight(0xa855f7, 3.0, 30);
    arenaLight.position.set(0, 5, -8);
    scene.add(arenaLight);

    // 3. Cyber Wireframe Boundary Grid (Arena Walls)
    const gridHelper = new THREE.GridHelper(26, 20, 0xa855f7, 0x311b5e);
    gridHelper.position.set(0, -5.2, -6);
    gridHelper.rotation.x = 0;
    scene.add(gridHelper);

    // 4. Player 3D Laser Turret Cannon (Bottom Center)
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, -4.2, 5.5);
    scene.add(turretGroup);

    const baseGeo = new THREE.CylinderGeometry(0.55, 0.85, 0.4, 16);
    const baseMat = new THREE.MeshPhongMaterial({
      color: 0x1f1338,
      emissive: 0x3b1d75,
      specular: 0x38bdf8,
      shininess: 80,
    });
    const turretBase = new THREE.Mesh(baseGeo, baseMat);
    turretGroup.add(turretBase);

    const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12);
    const barrelMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const barrelLeft = new THREE.Mesh(barrelGeo, barrelMat);
    barrelLeft.position.set(-0.24, 0.6, 0);
    turretGroup.add(barrelLeft);

    const barrelRight = new THREE.Mesh(barrelGeo, barrelMat);
    barrelRight.position.set(0.24, 0.6, 0);
    turretGroup.add(barrelRight);

    // 5. 3D Reticle Crosshair (Tracks user pointer in 3D)
    const reticleGroup = new THREE.Group();
    reticleGroup.position.set(0, 0, 0);
    scene.add(reticleGroup);

    const reticleRingGeo = new THREE.RingGeometry(0.38, 0.44, 32);
    const reticleRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const reticleRing = new THREE.Mesh(reticleRingGeo, reticleRingMat);
    reticleGroup.add(reticleRing);

    // Inner reticle dot
    const reticleDotGeo = new THREE.CircleGeometry(0.06, 16);
    const reticleDotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    const reticleDot = new THREE.Mesh(reticleDotGeo, reticleDotMat);
    reticleGroup.add(reticleDot);

    // 6. Active Game Objects Storage
    const targets: TargetData[] = [];
    const laserBolts: LaserBolt[] = [];
    const debris: DebrisParticle[] = [];

    // Particle Texture for explosions
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
      grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    // Debris Particle Buffer System
    const maxDebris = 180;
    const debrisGeo = new THREE.BufferGeometry();
    const debrisPositions = new Float32Array(maxDebris * 3);
    const debrisColors = new Float32Array(maxDebris * 3);

    debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
    debrisGeo.setAttribute('color', new THREE.BufferAttribute(debrisColors, 3));

    const debrisMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const debrisPoints = new THREE.Points(debrisGeo, debrisMat);
    scene.add(debrisPoints);

    // 7. Shockwave Ring for explosive impacts
    const shockwaveGeo = new THREE.RingGeometry(0.2, 0.6, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    scene.add(shockwaveMesh);
    let shockwaveActive = false;
    let shockwaveProgress = 0;

    const triggerShockwave = (pos: THREE.Vector3, colorHex = 0x38bdf8) => {
      shockwaveMesh.position.copy(pos);
      shockwaveMat.color.setHex(colorHex);
      shockwaveActive = true;
      shockwaveProgress = 0;
      shockwaveMat.opacity = 0.95;
    };

    // Explosion Particle Spawner
    const spawnExplosion = (pos: THREE.Vector3, count = 24, baseColor = new THREE.Color(0x38bdf8)) => {
      for (let i = 0; i < count; i++) {
        if (debris.length >= maxDebris) debris.shift();
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );
        const col = baseColor.clone();
        col.offsetHSL((Math.random() - 0.5) * 0.15, 0, (Math.random() - 0.5) * 0.2);
        debris.push({
          pos: pos.clone(),
          vel,
          life: 1.0,
          maxLife: 0.5 + Math.random() * 0.5,
          color: col,
          size: 0.3 + Math.random() * 0.3,
        });
      }
    };

    // 8. Target Spawner Engine
    const targetGeos = {
      crystal: new THREE.IcosahedronGeometry(0.72, 0),
      spark: new THREE.OctahedronGeometry(0.65, 0),
      bomb: new THREE.SphereGeometry(0.68, 16, 16),
      drone: new THREE.DodecahedronGeometry(1.15, 0),
    };

    const targetMats = {
      crystal: new THREE.MeshPhongMaterial({
        color: 0xa855f7,
        emissive: 0x581c87,
        specular: 0xffffff,
        shininess: 90,
        flatShading: true,
      }),
      spark: new THREE.MeshPhongMaterial({
        color: 0xf59e0b,
        emissive: 0x78350f,
        specular: 0xffffff,
        shininess: 100,
        flatShading: true,
      }),
      bomb: new THREE.MeshPhongMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        specular: 0xffffff,
        shininess: 80,
      }),
      drone: new THREE.MeshPhongMaterial({
        color: 0x06b6d4,
        emissive: 0x0e7490,
        specular: 0xffffff,
        wireframe: false,
        flatShading: true,
      }),
    };

    const spawnTarget = () => {
      // Determine target type probabilistically
      const rand = Math.random();
      let type: 'crystal' | 'spark' | 'bomb' | 'drone' = 'crystal';
      let points = 100;
      let hp = 1;

      if (rand > 0.88) {
        type = 'bomb';
        points = 250;
      } else if (rand > 0.72) {
        type = 'spark';
        points = 200;
      } else if (rand > 0.6) {
        type = 'drone';
        points = 400;
        hp = 2;
      }

      const mesh = new THREE.Mesh(targetGeos[type], targetMats[type].clone());
      const spawnX = (Math.random() - 0.5) * 11;
      const spawnY = THREE.MathUtils.lerp(-1.5, 4.0, Math.random());
      const spawnZ = THREE.MathUtils.lerp(-24, -16, Math.random());

      mesh.position.set(spawnX, spawnY, spawnZ);
      scene.add(mesh);

      // Add wireframe edge glow
      const wire = new THREE.Mesh(
        targetGeos[type],
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        })
      );
      mesh.add(wire);

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      );

      // Drift gently forward toward the player
      const forwardSpeed = 2.5 + Math.random() * 2.0;
      const velocity = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, forwardSpeed);

      targets.push({
        mesh,
        type,
        points,
        rotSpeed,
        velocity,
        hp,
        maxHp: hp,
        scale: 1.0,
      });
    };

    // Pre-populate with targets
    for (let i = 0; i < 6; i++) {
      spawnTarget();
    }

    // 9. Laser Bolt Spawner & Raycasting
    const laserBoltGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
    laserBoltGeo.rotateX(Math.PI / 2);
    const laserBoltMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending,
    });

    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2();

    const shootLaser = (targetWorldPos: THREE.Vector3) => {
      // Recoil animation on cannon
      turretGroup.position.z = 5.2;
      cannonLight.intensity = 8.0;

      // Spawn left & right laser bolts
      const leftStart = turretGroup.position.clone().add(new THREE.Vector3(-0.24, 0.6, 0));
      const rightStart = turretGroup.position.clone().add(new THREE.Vector3(0.24, 0.6, 0));

      [leftStart, rightStart].forEach((startPos) => {
        const bolt = new THREE.Mesh(laserBoltGeo, laserBoltMat);
        bolt.position.copy(startPos);
        bolt.lookAt(targetWorldPos);

        const dir = targetWorldPos.clone().sub(startPos).normalize();
        const velocity = dir.multiplyScalar(45);

        scene.add(bolt);
        laserBolts.push({ mesh: bolt, velocity, life: 1.2 });
      });

      playSound('laser');
    };

    // 10. Direct Click / Tap Hit Detection
    fireLaserRef.current = (clientX: number, clientY: number) => {
      const rect = mount.getBoundingClientRect();
      mouseNorm.x = ((clientX - rect.left) / width) * 2 - 1;
      mouseNorm.y = -((clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, camera);

      // Calculate target point in 3D space
      const targetDist = 12;
      const targetPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(targetDist));

      shootLaser(targetPoint);

      // Check intersections with active target meshes
      const targetMeshes = targets.map((t) => t.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const targetIdx = targets.findIndex((t) => t.mesh === hitMesh);

        if (targetIdx !== -1) {
          const t = targets[targetIdx];
          t.hp -= 1;

          if (t.hp <= 0) {
            // Target Destroyed!
            const hitPos = t.mesh.position.clone();
            scene.remove(t.mesh);
            targets.splice(targetIdx, 1);

            // Explosions and SFX
            if (t.type === 'bomb') {
              playSound('bomb');
              triggerShockwave(hitPos, 0xef4444);
              spawnExplosion(hitPos, 36, new THREE.Color(0xef4444));

              // Chain reaction: destroy all nearby targets within radius 4.5
              for (let j = targets.length - 1; j >= 0; j--) {
                const other = targets[j];
                if (other.mesh.position.distanceTo(hitPos) < 4.5) {
                  scene.remove(other.mesh);
                  targets.splice(j, 1);
                  spawnExplosion(other.mesh.position, 18, new THREE.Color(0xf59e0b));
                  setScore((s) => s + other.points * 2);
                }
              }
            } else if (t.type === 'spark') {
              playSound('combo');
              triggerShockwave(hitPos, 0xf59e0b);
              spawnExplosion(hitPos, 28, new THREE.Color(0xf59e0b));
            } else {
              playSound('hit');
              triggerShockwave(hitPos, 0xa855f7);
              spawnExplosion(hitPos, 22, new THREE.Color(0xa855f7));
            }

            // Update Score & Combos
            setScore((s) => s + t.points);
            setCombo((c) => {
              const nextCombo = c + 1;
              if (nextCombo % 5 === 0) playSound('combo');
              return nextCombo;
            });
            setEmpCharge((charge) => Math.min(100, charge + 15));
            setTimeLeft((time) => Math.min(60, time + 2)); // Extra time reward!

            setFloatingBonus({
              text: `+${t.points} PTS`,
              id: Date.now(),
            });

            // Replenish target
            spawnTarget();
          } else {
            // Partial hit on armored drone
            t.mesh.scale.multiplyScalar(0.9);
            playSound('hit');
            spawnExplosion(t.mesh.position, 10, new THREE.Color(0x06b6d4));
          }
        }
      } else {
        // Missed shot resets combo streak
        setCombo(0);
      }
    };

    // EMP Shockwave Special Ability
    triggerEmpRef.current = () => {
      playSound('emp');
      const origin = new THREE.Vector3(0, 0, -6);
      triggerShockwave(origin, 0x38bdf8);
      shockwaveMesh.scale.set(15, 15, 15);

      let totalEarned = 0;
      // Detonate all active targets in screen
      while (targets.length > 0) {
        const t = targets.pop()!;
        scene.remove(t.mesh);
        spawnExplosion(t.mesh.position, 16, new THREE.Color(0x38bdf8));
        totalEarned += t.points;
      }
      setScore((s) => s + totalEarned * 2);
      setEmpCharge(0);

      // Respawn fresh batch
      for (let i = 0; i < 6; i++) {
        spawnTarget();
      }
    };

    resetGameRef.current = () => {
      setScore(0);
      setCombo(0);
      setEmpCharge(0);
      setTimeLeft(45);
      setWave(1);
      setGameState('playing');

      // Clear existing targets
      while (targets.length > 0) {
        const t = targets.pop()!;
        scene.remove(t.mesh);
      }
      for (let i = 0; i < 6; i++) {
        spawnTarget();
      }
    };

    startGameRef.current = () => {
      setGameState('playing');
    };

    // 11. Mouse / Pointer Crosshair Tracking
    let targetReticleX = 0;
    let targetReticleY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / height) * 2 + 1;

      // Project onto reticle plane at z = 0
      targetReticleX = normX * 6.5;
      targetReticleY = normY * 3.8;

      // Cannon aims smoothly at cursor
      turretGroup.rotation.y = -normX * 0.45;
      turretGroup.rotation.x = normY * 0.25;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (gameState === 'idle') {
        setGameState('playing');
      }
      if (gameState === 'playing') {
        fireLaserRef.current?.(e.clientX, e.clientY);
      }
    };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerdown', onPointerDown);

    // 12. 60FPS Game Physics Loop
    let animId: number;
    const clock = new THREE.Clock();
    let spawnTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth Reticle tracking
      reticleGroup.position.x += (targetReticleX - reticleGroup.position.x) * 0.2;
      reticleGroup.position.y += (targetReticleY - reticleGroup.position.y) * 0.2;
      reticleRing.rotation.z = time * 1.5;

      // Cannon recoil recovery
      if (turretGroup.position.z < 5.5) {
        turretGroup.position.z += (5.5 - turretGroup.position.z) * 0.15;
      }
      if (cannonLight.intensity > 3.5) {
        cannonLight.intensity += (3.5 - cannonLight.intensity) * 0.08;
      }

      // Shockwave ring expansion
      if (shockwaveActive) {
        shockwaveProgress += delta * 3.2;
        const scale = 1.0 + shockwaveProgress * 8.0;
        shockwaveMesh.scale.set(scale, scale, scale);
        shockwaveMat.opacity = Math.max(0, 0.95 * (1.0 - shockwaveProgress));
        if (shockwaveProgress >= 1.0) shockwaveActive = false;
      }

      // Laser Bolt Movement
      for (let i = laserBolts.length - 1; i >= 0; i--) {
        const bolt = laserBolts[i];
        bolt.mesh.position.addScaledVector(bolt.velocity, delta);
        bolt.life -= delta;
        if (bolt.life <= 0 || bolt.mesh.position.z < -30) {
          scene.remove(bolt.mesh);
          laserBolts.splice(i, 1);
        }
      }

      // Targets Update & Spawning
      spawnTimer += delta;
      if (spawnTimer > 1.8 && targets.length < 8) {
        spawnTarget();
        spawnTimer = 0;
      }

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        t.mesh.rotation.x += t.rotSpeed.x * delta;
        t.mesh.rotation.y += t.rotSpeed.y * delta;
        t.mesh.rotation.z += t.rotSpeed.z * delta;

        t.mesh.position.addScaledVector(t.velocity, delta);

        // Target flew past player boundary without being destroyed
        if (t.mesh.position.z > 8.0) {
          scene.remove(t.mesh);
          targets.splice(i, 1);
          spawnTarget();
        }
      }

      // Explosion Debris Particle Physics
      const dPosArr = debrisGeo.attributes.position.array as Float32Array;
      const dColArr = debrisGeo.attributes.color.array as Float32Array;

      for (let k = 0; k < dPosArr.length; k++) {
        dPosArr[k] = 0;
        dColArr[k] = 0;
      }

      for (let i = debris.length - 1; i >= 0; i--) {
        const p = debris[i];
        p.pos.addScaledVector(p.vel, delta);
        p.vel.multiplyScalar(0.92); // air resistance
        p.life -= delta / p.maxLife;

        if (p.life <= 0) {
          debris.splice(i, 1);
          continue;
        }

        const idx = i * 3;
        dPosArr[idx] = p.pos.x;
        dPosArr[idx + 1] = p.pos.y;
        dPosArr[idx + 2] = p.pos.z;

        dColArr[idx] = p.color.r * p.life;
        dColArr[idx + 1] = p.color.g * p.life;
        dColArr[idx + 2] = p.color.b * p.life;
      }
      debrisGeo.attributes.position.needsUpdate = true;
      debrisGeo.attributes.color.needsUpdate = true;

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
      mount.removeEventListener('pointerdown', onPointerDown);

      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      // Cleanup
      baseGeo.dispose();
      baseMat.dispose();
      barrelGeo.dispose();
      barrelMat.dispose();
      reticleRingGeo.dispose();
      reticleRingMat.dispose();
      reticleDotGeo.dispose();
      reticleDotMat.dispose();
      gridHelper.dispose();
      debrisGeo.dispose();
      debrisMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      laserBoltGeo.dispose();
      laserBoltMat.dispose();
      particleTex.dispose();

      Object.values(targetGeos).forEach((g) => g.dispose());
      Object.values(targetMats).forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [gameState, playSound]);

  return (
    <div
      className={`glass-card rounded-3xl p-6 sm:p-7 border border-purple-500/40 hover:border-purple-400/80 bg-gradient-to-b from-[#130926]/95 via-[#0a0418]/95 to-[#04010a]/95 backdrop-blur-2xl relative overflow-hidden group shadow-2xl shadow-purple-950/70 transition-all duration-300 ${className}`}
    >
      {/* 1. Arcade Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08] relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono uppercase tracking-wider text-purple-200 font-bold flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                Venture Blaster 3D
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ARCADE LIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Interactive 3D Target Shooter • Aim with Cursor, Tap to Shoot & Trigger EMPs
            </p>
          </div>
        </div>

        {/* Arcade Status Readout & Sound Control */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Best Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[11px] text-zinc-400">BEST:</span>
            <strong className="text-white font-bold">{highScore}</strong>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Mount */}
      <div className="relative w-full h-72 sm:h-80 my-2 z-10 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-[#06020e]/60 border border-white/[0.06]">
        <div
          ref={mountRef}
          className="w-full h-full cursor-crosshair relative z-10"
          title="Aim with mouse • Click or tap to shoot laser bolts"
        />

        {/* Live Floating Bonus Text Animation */}
        {floatingBonus && (
          <div
            key={floatingBonus.id}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-bounce font-mono text-lg font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
          >
            {floatingBonus.text}
          </div>
        )}

        {/* In-Game HUD: Score & Streak */}
        <div className="absolute top-3 left-3 pointer-events-none z-20 flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs text-zinc-400">SCORE:</span>
            <strong className="font-mono text-sm text-white tracking-wider">{score}</strong>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold animate-pulse">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>STREAK {combo}x COMBO!</span>
            </div>
          )}
        </div>

        {/* In-Game HUD: Time Clock */}
        <div className="absolute top-3 right-3 pointer-events-none z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md font-mono text-xs">
          <span className="text-zinc-400">TIME:</span>
          <strong className={`text-sm ${timeLeft <= 10 ? 'text-rose-400 animate-ping font-black' : 'text-emerald-400 font-bold'}`}>
            {timeLeft}s
          </strong>
        </div>

        {/* Overlay: Game Start Prompt */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/40 mb-3 animate-pulse">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Venture Blaster 3D</h3>
            <p className="text-xs text-zinc-300 max-w-sm mt-1 mb-4 leading-relaxed">
              Blast the cosmic obstacles! Crystals (+100), Golden Sparks (+200), and Red Plasma Bombs (+Chain Reaction)!
            </p>
            <button
              type="button"
              onClick={() => {
                resetGameRef.current?.();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Game</span>
            </button>
          </div>
        )}

        {/* Overlay: Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2 font-bold uppercase tracking-wider">
              Mission Completed
            </span>
            <h3 className="text-2xl font-black text-white">Final Score: {score}</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Best Run: <strong className="text-amber-300">{highScore} PTS</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                resetGameRef.current?.();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {/* Guidance tip on bottom */}
        {gameState === 'playing' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-400">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Tap or Click anywhere to fire lasers • Chain bombs for mega points!</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Controls & EMP Ability Dock */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs relative z-20">
        {/* EMP Weapon Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (empCharge >= 100) triggerEmpRef.current?.();
            }}
            disabled={empCharge < 100}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              empCharge >= 100
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-300 shadow-cyan-500/50 hover:scale-105 animate-pulse'
                : 'bg-white/[0.03] text-zinc-500 border-white/5 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${empCharge >= 100 ? 'text-amber-300 fill-amber-300 animate-bounce' : 'text-zinc-500'}`} />
            <span>{empCharge >= 100 ? '⚡ DETONATE EMP NOVA!' : `EMP Charging (${empCharge}%)`}</span>
          </button>

          {/* Restart Game */}
          <button
            type="button"
            onClick={() => resetGameRef.current?.()}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title="Restart round"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>

        {/* EMP Progress Meter */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-zinc-400">EMP ENERGY:</span>
            <div className="w-28 sm:w-36 h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-300"
                style={{ width: `${empCharge}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />
    </div>
  );
}
