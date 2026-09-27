import * as THREE from 'three';

export interface PhoneMeshes {
  rootGroup: THREE.Group;
  frameMesh: THREE.Mesh;
  frontGlassMesh: THREE.Mesh;
  screenMesh: THREE.Mesh;
  rearGlassMesh: THREE.Mesh;
  cameraPlateau: THREE.Mesh;
  cameraLensesGroup: THREE.Group;
  sideButtonsGroup: THREE.Group;
  antennaBandsGroup: THREE.Group;
  screenTextureCanvas: HTMLCanvasElement;
  updateScreenTexture: (progress: number) => void;
}

/**
 * Creates a high-definition 2D rounded rectangle Shape with high bezier segment smoothness.
 */
function createSuperSmoothRoundedRect(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

/**
 * Generates an ultra-premium, realistic iPhone-Pro inspired smartphone with independent 3D meshes,
 * micro-beveled titanium band, triple sapphire camera assembly, and high-DPI OLED screen.
 */
export function createProceduralPhone(): PhoneMeshes {
  const rootGroup = new THREE.Group();

  // Flagship iPhone Pro realistic proportions
  const phoneWidth = 2.38;
  const phoneHeight = 4.96;
  const phoneDepth = 0.175; // Slim, elegant modern flagship profile
  const cornerRadius = 0.44;

  // ========================================================
  // 1. TITANIUM CHASSIS / FRAME
  // ========================================================
  const frameShape = createSuperSmoothRoundedRect(phoneWidth, phoneHeight, cornerRadius);
  const frameExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: phoneDepth,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: 0.022,
    bevelThickness: 0.022,
  };

  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, frameExtrudeSettings);
  frameGeometry.center();

  // Premium Space Titanium material with subtle micro-roughness & clearcoat
  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x221a30,
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 0.25,
    clearcoatRoughness: 0.15,
    reflectivity: 0.85,
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  rootGroup.add(frameMesh);

  // Antenna bands on frame (micro insets for realism)
  const antennaBandsGroup = new THREE.Group();
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x110c1c });
  const bandPositions = [
    [-phoneWidth / 2 - 0.023, 1.4, 0],
    [-phoneWidth / 2 - 0.023, -1.4, 0],
    [phoneWidth / 2 + 0.023, 1.4, 0],
    [phoneWidth / 2 + 0.023, -1.4, 0],
  ];
  bandPositions.forEach(([bx, by, bz]) => {
    const bandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, phoneDepth + 0.04), bandMat);
    bandMesh.position.set(bx, by, bz);
    antennaBandsGroup.add(bandMesh);
  });
  frameMesh.add(antennaBandsGroup);

  // ========================================================
  // 2. REAR MATTE FROSTED GLASS PANEL
  // ========================================================
  const rearShape = createSuperSmoothRoundedRect(phoneWidth - 0.02, phoneHeight - 0.02, cornerRadius - 0.01);
  const rearExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.012,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.008,
    bevelThickness: 0.008,
  };
  const rearGeometry = new THREE.ExtrudeGeometry(rearShape, rearExtrudeSettings);
  rearGeometry.center();

  // Dark matte violet-black frosted glass
  const rearGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0c0717,
    roughness: 0.42,
    metalness: 0.2,
    clearcoat: 0.1,
    reflectivity: 0.5,
  });

  const rearGlassMesh = new THREE.Mesh(rearGeometry, rearGlassMaterial);
  rearGlassMesh.position.z = -phoneDepth / 2 - 0.025;
  rearGlassMesh.rotation.y = Math.PI;
  rearGlassMesh.castShadow = true;
  rootGroup.add(rearGlassMesh);

  // ========================================================
  // 3. CAMERA ISLAND (Elevated Chamfered Plateau)
  // ========================================================
  const plateauSize = 0.98;
  const plateauRadius = 0.26;
  const plateauShape = createSuperSmoothRoundedRect(plateauSize, plateauSize, plateauRadius);
  const plateauExtrude: THREE.ExtrudeGeometryOptions = {
    depth: 0.038,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 0.02,
    bevelThickness: 0.016,
  };

  const cameraPlateauGeo = new THREE.ExtrudeGeometry(plateauShape, plateauExtrude);
  cameraPlateauGeo.center();

  const cameraPlateauMat = new THREE.MeshPhysicalMaterial({
    color: 0x160f24,
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 0.5,
  });

  const cameraPlateau = new THREE.Mesh(cameraPlateauGeo, cameraPlateauMat);
  // Upper-left corner of the rear panel (mirrored along X because rotated PI)
  cameraPlateau.position.set(-0.52, 1.62, -phoneDepth / 2 - 0.052);
  cameraPlateau.rotation.y = Math.PI;
  rootGroup.add(cameraPlateau);

  // ========================================================
  // 4. TRIPLE SAPPHIRE CAMERA SYSTEM
  // ========================================================
  const cameraLensesGroup = new THREE.Group();
  cameraLensesGroup.position.set(-0.52, 1.62, -phoneDepth / 2 - 0.052);
  cameraLensesGroup.rotation.y = Math.PI;

  const lensCoordinates = [
    [-0.24, 0.24],   // Top-left
    [-0.24, -0.24],  // Bottom-left
    [0.24, 0.0],     // Right center
  ];

  // Precision metallic ring
  const lensBezelGeo = new THREE.CylinderGeometry(0.185, 0.195, 0.045, 36);
  lensBezelGeo.rotateX(Math.PI / 2);
  const lensBezelMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea,
    metalness: 0.98,
    roughness: 0.12,
  });

  // Inner black aperture rim
  const innerRimGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.048, 36);
  innerRimGeo.rotateX(Math.PI / 2);
  const innerRimMat = new THREE.MeshBasicMaterial({ color: 0x05020a });

  // Sapphire glass lens cover
  const opticCoverGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 36);
  opticCoverGeo.rotateX(Math.PI / 2);
  const opticCoverMat = new THREE.MeshPhysicalMaterial({
    color: 0x1b0a2f,
    roughness: 0.03,
    transmission: 0.72,
    thickness: 0.18,
    reflectivity: 0.95,
    ior: 1.6,
  });

  // Sensor aperture pupil inside
  const pupilGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.052, 24);
  pupilGeo.rotateX(Math.PI / 2);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x010003 });

  lensCoordinates.forEach(([lx, ly]) => {
    const singleLensGroup = new THREE.Group();
    singleLensGroup.position.set(lx, ly, 0.024);

    const bezel = new THREE.Mesh(lensBezelGeo, lensBezelMat);
    const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
    const optic = new THREE.Mesh(opticCoverGeo, opticCoverMat);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);

    singleLensGroup.add(bezel);
    singleLensGroup.add(innerRim);
    singleLensGroup.add(optic);
    singleLensGroup.add(pupil);

    cameraLensesGroup.add(singleLensGroup);
  });

  // True Tone Flash & LiDAR Scanner
  const flashRing = new THREE.Mesh(
    new THREE.RingGeometry(0.04, 0.09, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe6b0, side: THREE.DoubleSide })
  );
  flashRing.position.set(0.24, 0.3, 0.022);
  cameraLensesGroup.add(flashRing);

  const lidarMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.065, 32),
    new THREE.MeshBasicMaterial({ color: 0x030205, side: THREE.DoubleSide })
  );
  lidarMesh.position.set(0.24, -0.28, 0.022);
  cameraLensesGroup.add(lidarMesh);

  rootGroup.add(cameraLensesGroup);

  // ========================================================
  // 5. HIGH-DPI OLED DISPLAY CANVAS TEXTURE
  // ========================================================
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 2500;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  const screenTexture = new THREE.CanvasTexture(canvas);
  screenTexture.generateMipmaps = true;
  screenTexture.minFilter = THREE.LinearMipmapLinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  // Screen geometry: slim symmetrical 0.06 bezel
  const screenW = phoneWidth - 0.12;
  const screenH = phoneHeight - 0.12;
  const screenCornerR = cornerRadius - 0.05;

  const screenShape = createSuperSmoothRoundedRect(screenW, screenH, screenCornerR);
  const screenGeometry = new THREE.ShapeGeometry(screenShape);
  screenGeometry.center();

  // Exact UV mapping
  const posAttr = screenGeometry.attributes.position;
  const uvArray = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    uvArray[i * 2] = (px + screenW / 2) / screenW;
    uvArray[i * 2 + 1] = (py + screenH / 2) / screenH;
  }
  screenGeometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

  const screenMaterial = new THREE.MeshBasicMaterial({
    map: screenTexture,
  });

  const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  screenMesh.position.z = phoneDepth / 2 + 0.024;
  rootGroup.add(screenMesh);

  // ========================================================
  // 6. FRONT CERAMIC SHIELD GLASS
  // ========================================================
  const frontGlassShape = createSuperSmoothRoundedRect(phoneWidth, phoneHeight, cornerRadius);
  const frontGlassGeo = new THREE.ShapeGeometry(frontGlassShape);
  frontGlassGeo.center();

  const frontGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.16,
    roughness: 0.05,
    transmission: 0.94,
    reflectivity: 0.88,
    ior: 1.5,
  });

  const frontGlassMesh = new THREE.Mesh(frontGlassGeo, frontGlassMaterial);
  frontGlassMesh.position.z = phoneDepth / 2 + 0.028;
  rootGroup.add(frontGlassMesh);

  // ========================================================
  // 7. SIDE BUTTONS (Action, Volume, Power)
  // ========================================================
  const sideButtonsGroup = new THREE.Group();
  const btnMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2756,
    metalness: 0.95,
    roughness: 0.25,
  });

  // Power Button (Right side)
  const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.58, 0.055), btnMaterial);
  powerBtn.position.set(phoneWidth / 2 + 0.025, 0.55, 0);
  sideButtonsGroup.add(powerBtn);

  // Action Button (Left upper)
  const actionBtn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.055), btnMaterial);
  actionBtn.position.set(-phoneWidth / 2 - 0.025, 1.25, 0);
  sideButtonsGroup.add(actionBtn);

  // Volume Up
  const volUpBtn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.055), btnMaterial);
  volUpBtn.position.set(-phoneWidth / 2 - 0.025, 0.72, 0);
  sideButtonsGroup.add(volUpBtn);

  // Volume Down
  const volDownBtn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.055), btnMaterial);
  volDownBtn.position.set(-phoneWidth / 2 - 0.025, 0.22, 0);
  sideButtonsGroup.add(volDownBtn);

  rootGroup.add(sideButtonsGroup);

  // ========================================================
  // 8. DYNAMIC SCREEN INTERFACE RENDERER
  // ========================================================
  const updateScreenTexture = (progress: number) => {
    // Ultra deep OLED black background
    ctx.fillStyle = '#06030c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle atmospheric ambient violet glow
    const radialGlow = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.38,
      120,
      canvas.width * 0.5,
      canvas.height * 0.45,
      850
    );
    radialGlow.addColorStop(0, 'rgba(147, 51, 234, 0.24)');
    radialGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
    radialGlow.addColorStop(1, 'rgba(6, 3, 12, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // DYNAMIC ISLAND (Sleek, pill-shaped cutout with micro camera lenses)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 135, 75, 270, 70, 35);
    ctx.fill();

    // Dual micro sensors inside Dynamic Island
    ctx.fillStyle = '#0c0714';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 75, 110, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 55, 110, 14, 0, Math.PI * 2);
    ctx.fill();

    // STATUS BAR
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('9:41', 120, 125);
    ctx.textAlign = 'right';
    ctx.fillText('5G  100%', canvas.width - 120, 125);
    ctx.textAlign = 'left';

    // APP INTERFACE HEADER
    ctx.fillStyle = '#c084fc';
    ctx.font = '700 34px -apple-system, system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('E-CELL, IIT BOMBAY', 110, 360);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 106px -apple-system, system-ui, sans-serif';
    ctx.fillText('ILLUMINATE', 105, 475);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 42px -apple-system, system-ui, sans-serif';
    ctx.fillText('KMCT Kasaragod • 6-Hour Offline Masterclass', 110, 545);

    // DYNAMIC CARDS BASED ON SCROLL STAGE
    if (progress < 0.5) {
      // Stage A: Workshop Overview Card
      ctx.fillStyle = '#140c26';
      ctx.beginPath();
      ctx.roundRect(100, 650, canvas.width - 200, 380, 32);
      ctx.fill();

      // Card border
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f3e8ff';
      ctx.font = '700 46px -apple-system, system-ui, sans-serif';
      ctx.fillText('Hands-On Startup Sprints', 145, 750);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 36px -apple-system, system-ui, sans-serif';
      ctx.fillText('• Official Certificate from E-Cell IIT Bombay', 145, 830);
      ctx.fillText('• Physical Illuminate Startup Kit Included', 145, 895);
      ctx.fillText('• Interactive Mentorship from Founders', 145, 960);

      // Card B: Fee & Cohort
      ctx.fillStyle = '#100921';
      ctx.beginPath();
      ctx.roundRect(100, 1070, canvas.width - 200, 320, 32);
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '800 46px -apple-system, system-ui, sans-serif';
      ctx.fillText('₹700 Workshop Pass', 145, 1170);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 36px -apple-system, system-ui, sans-serif';
      ctx.fillText('Minimum 70 Attendees Cohort Target', 145, 1240);
      ctx.fillText('Special E-Summit Passes Eligibility', 145, 1305);
    } else {
      // Stage B: Fast Registration Card
      ctx.fillStyle = '#140c28';
      ctx.beginPath();
      ctx.roundRect(100, 660, canvas.width - 200, 480, 36);
      ctx.fill();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 48px -apple-system, system-ui, sans-serif';
      ctx.fillText('SEAT RESERVATION READY', 150, 770);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 38px -apple-system, system-ui, sans-serif';
      ctx.fillText('• Fast UPI & Razorpay Checkout', 150, 860);
      ctx.fillText('• Instant Digital Pass with Pass ID', 150, 935);
      ctx.fillText('• KMCT College Student Allocation', 150, 1010);

      // CTA button on screen
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.roundRect(140, 1230, canvas.width - 280, 140, 28);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 50px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLAIM YOUR SEAT (₹700)', canvas.width / 2, 1320);
      ctx.textAlign = 'left';
    }

    // HOME INDICATOR BAR
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 160, canvas.height - 70, 320, 14, 7);
    ctx.fill();

    screenTexture.needsUpdate = true;
  };

  updateScreenTexture(0);

  return {
    rootGroup,
    frameMesh,
    frontGlassMesh,
    screenMesh,
    rearGlassMesh,
    cameraPlateau,
    cameraLensesGroup,
    sideButtonsGroup,
    antennaBandsGroup,
    screenTextureCanvas: canvas,
    updateScreenTexture,
  };
}
