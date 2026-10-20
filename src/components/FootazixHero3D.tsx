import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface FootazixHero3DProps {
  className?: string;
}

export const FootazixHero3D: React.FC<FootazixHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLowPower, setIsLowPower] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Interaction refs (kept in refs for 60fps performance without React re-renders)
  const isDraggingRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.35 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.35 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const mouseParallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // WebGL Lifecycle & Scene
  useEffect(() => {
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (mediaReduced) {
      setIsLowPower(true);
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Verify WebGL availability safely
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;
    let isVisible = true;

    // Disposables registry to ensure absolute zero memory leaks
    const disposables: { dispose: () => void }[] = [];

    try {
      const width = currentMount.clientWidth || 400;
      const height = currentMount.clientHeight || 400;

      // Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.2);

      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const domElement = renderer.domElement;
      domElement.style.width = '100%';
      domElement.style.height = '100%';
      domElement.style.display = 'block';
      domElement.style.touchAction = 'pan-y'; // Allow smooth page scrolling on vertical touch
      currentMount.appendChild(domElement);

      // Root interactive assembly group
      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // ==========================================
      // MATERIALS (Premium obsidian, titanium & #B1FF00)
      // ==========================================
      const darkTitaniumMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0e110e),
        metalness: 0.92,
        roughness: 0.18,
      });
      disposables.push(darkTitaniumMaterial);

      const satinObsidianMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x131713),
        metalness: 0.85,
        roughness: 0.28,
      });
      disposables.push(satinObsidianMaterial);

      const limeAccentMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1a2114),
        emissive: new THREE.Color(0x99e600),
        emissiveIntensity: 0.55,
        metalness: 0.88,
        roughness: 0.2,
      });
      disposables.push(limeAccentMaterial);

      const limeWireMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xb1ff00),
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      disposables.push(limeWireMaterial);

      const limeEdgeLineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0xb1ff00),
        transparent: true,
        opacity: 0.65,
      });
      disposables.push(limeEdgeLineMaterial);

      // ==========================================
      // 1. CENTRAL FLOATING GEOMETRIC BEVELED CUBE
      // ==========================================
      const cubeSize = 1.25;
      const cornerRadius = 0.1;
      const cubeShape = new THREE.Shape();
      cubeShape.moveTo(-cubeSize / 2 + cornerRadius, -cubeSize / 2);
      cubeShape.lineTo(cubeSize / 2 - cornerRadius, -cubeSize / 2);
      cubeShape.quadraticCurveTo(cubeSize / 2, -cubeSize / 2, cubeSize / 2, -cubeSize / 2 + cornerRadius);
      cubeShape.lineTo(cubeSize / 2, cubeSize / 2 - cornerRadius);
      cubeShape.quadraticCurveTo(cubeSize / 2, cubeSize / 2, cubeSize / 2 - cornerRadius, cubeSize / 2);
      cubeShape.lineTo(-cubeSize / 2 + cornerRadius, cubeSize / 2);
      cubeShape.quadraticCurveTo(-cubeSize / 2, cubeSize / 2, -cubeSize / 2, cubeSize / 2 - cornerRadius);
      cubeShape.lineTo(-cubeSize / 2, -cubeSize / 2 + cornerRadius);
      cubeShape.quadraticCurveTo(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2 + cornerRadius, -cubeSize / 2);

      const cubeExtrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: cubeSize - cornerRadius * 2,
        bevelEnabled: true,
        bevelSegments: isMobile ? 2 : 4,
        steps: 1,
        bevelSize: cornerRadius,
        bevelThickness: cornerRadius,
      };

      const cubeGeometry = new THREE.ExtrudeGeometry(cubeShape, cubeExtrudeSettings);
      cubeGeometry.center();
      disposables.push(cubeGeometry);

      const centralCube = new THREE.Mesh(cubeGeometry, darkTitaniumMaterial);
      rootGroup.add(centralCube);

      // Luminous bevel wireframe outline catching light
      const cubeEdgesGeom = new THREE.EdgesGeometry(cubeGeometry, 26);
      disposables.push(cubeEdgesGeom);
      const cubeEdgesLine = new THREE.LineSegments(cubeEdgesGeom, limeEdgeLineMaterial);
      centralCube.add(cubeEdgesLine);

      // Inner floating concentric core inside the cube
      const innerCoreGeom = new THREE.OctahedronGeometry(0.38, 0);
      disposables.push(innerCoreGeom);
      const innerCoreMesh = new THREE.Mesh(innerCoreGeom, limeAccentMaterial);
      centralCube.add(innerCoreMesh);

      // ==========================================
      // 2. ELEGANT ORBITAL RINGS (Gimbal Timelines)
      // ==========================================
      // Primary ring
      const ring1Geom = new THREE.TorusGeometry(1.88, 0.026, 16, isMobile ? 48 : 96);
      disposables.push(ring1Geom);
      const ring1 = new THREE.Mesh(ring1Geom, satinObsidianMaterial);
      ring1.rotation.x = Math.PI / 3.2;
      ring1.rotation.y = Math.PI / 6;
      rootGroup.add(ring1);

      // Secondary intersecting ring (offset orbital angle)
      const ring2Geom = new THREE.TorusGeometry(2.18, 0.016, 12, isMobile ? 40 : 80);
      disposables.push(ring2Geom);
      const ring2 = new THREE.Mesh(ring2Geom, limeWireMaterial);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.y = Math.PI / 3;
      rootGroup.add(ring2);

      // Precision timeline node anchors along ring 1
      const nodeCount = isMobile ? 3 : 5;
      const nodeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      disposables.push(nodeGeom);
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const node = new THREE.Mesh(nodeGeom, limeAccentMaterial);
        node.position.set(Math.cos(angle) * 1.88, Math.sin(angle) * 1.88, 0);
        node.rotation.z = angle;
        ring1.add(node);
      }

      // ==========================================
      // 3. ABSTRACT VIDEO EDITING TIMELINE SEGMENTS & MOTION GRAPHICS
      // ==========================================
      const timelineGroup = new THREE.Group();
      rootGroup.add(timelineGroup);

      // Timeline track clips (rectangular editorial blocks)
      const clipGeom1 = new THREE.BoxGeometry(0.36, 0.07, 0.04);
      const clipGeom2 = new THREE.BoxGeometry(0.52, 0.07, 0.04);
      disposables.push(clipGeom1, clipGeom2);

      const playheadLineGeom = new THREE.BoxGeometry(0.016, 0.11, 0.045);
      disposables.push(playheadLineGeom);

      // Clip A
      const clipA = new THREE.Mesh(clipGeom1, darkTitaniumMaterial);
      clipA.position.set(1.4, 0.85, 0.3);
      clipA.rotation.set(0.2, 0.4, 0.15);
      const playheadA = new THREE.Mesh(playheadLineGeom, limeAccentMaterial);
      playheadA.position.set(0.08, 0, 0.005);
      clipA.add(playheadA);
      timelineGroup.add(clipA);

      // Clip B
      const clipB = new THREE.Mesh(clipGeom2, darkTitaniumMaterial);
      clipB.position.set(-1.35, -0.9, 0.4);
      clipB.rotation.set(-0.3, -0.2, -0.1);
      const playheadB = new THREE.Mesh(playheadLineGeom, limeAccentMaterial);
      playheadB.position.set(-0.12, 0, 0.005);
      clipB.add(playheadB);
      timelineGroup.add(clipB);

      // Animation Keyframe Diamonds (Octahedrons representing AE/Premiere keyframes)
      const keyframeGeom = new THREE.OctahedronGeometry(0.075, 0);
      disposables.push(keyframeGeom);

      const keyframe1 = new THREE.Mesh(keyframeGeom, limeAccentMaterial);
      keyframe1.position.set(0.9, -1.2, -0.4);
      timelineGroup.add(keyframe1);

      const keyframe2 = new THREE.Mesh(keyframeGeom, darkTitaniumMaterial);
      keyframe2.position.set(-1.1, 1.1, -0.3);
      timelineGroup.add(keyframe2);

      // ==========================================
      // 4. SUBTLE PLAY-BUTTON GEOMETRY INTEGRATED INTO COMPOSITION
      // ==========================================
      const playShape = new THREE.Shape();
      const ps = 0.22;
      playShape.moveTo(-ps * 0.5, -ps * 0.6);
      playShape.lineTo(ps * 0.85, 0);
      playShape.lineTo(-ps * 0.5, ps * 0.6);
      playShape.closePath();

      const playExtrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: 0.05,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.015,
        bevelThickness: 0.015,
      };
      const playGeom = new THREE.ExtrudeGeometry(playShape, playExtrudeSettings);
      playGeom.center();
      disposables.push(playGeom);

      const playButtonMesh = new THREE.Mesh(playGeom, limeAccentMaterial);
      playButtonMesh.position.set(0.72, 0.6, 0.85);
      playButtonMesh.rotation.set(0.1, -0.2, 0.05);
      rootGroup.add(playButtonMesh);

      // ==========================================
      // 5. MINIMAL ELEMENTS REPRESENTING CONTENT GROWTH
      // ==========================================
      // Ascending metric bars (symbolizing audience reach and exponential growth)
      const growthGroup = new THREE.Group();
      growthGroup.position.set(-1.5, 0.35, -0.2);
      rootGroup.add(growthGroup);

      const barHeights = [0.14, 0.24, 0.38, 0.52];
      const barGeomBase = new THREE.BoxGeometry(0.045, 1, 0.045);
      disposables.push(barGeomBase);

      barHeights.forEach((h, idx) => {
        const bar = new THREE.Mesh(
          barGeomBase,
          idx === barHeights.length - 1 ? limeAccentMaterial : satinObsidianMaterial
        );
        bar.scale.set(1, h, 1);
        bar.position.set(idx * 0.09, h / 2, 0);
        growthGroup.add(bar);
      });

      // Floating spark node
      const sparkGeom = new THREE.TetrahedronGeometry(0.05, 0);
      disposables.push(sparkGeom);
      const sparkMesh = new THREE.Mesh(sparkGeom, limeAccentMaterial);
      sparkMesh.position.set(-1.25, 1.05, -0.2);
      growthGroup.add(sparkMesh);

      // ==========================================
      // LIGHTING RIG (Studio PBR with Neon Lime Glints)
      // ==========================================
      // Ambient soft fill
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      // Directional cool key light
      const keyLight = new THREE.DirectionalLight(0xf5f7f2, 1.9);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      // Signature Footazix Lime Back/Rim Light
      const limeRimLight = new THREE.DirectionalLight(0xb1ff00, 2.8);
      limeRimLight.position.set(-4, -3, -3);
      scene.add(limeRimLight);

      // Dynamic cursor-following specular light
      const cursorLight = new THREE.PointLight(0xb1ff00, 2.2, 8);
      cursorLight.position.set(0, 0, 3.2);
      scene.add(cursorLight);

      // Secondary subtle white fill
      const softFill = new THREE.PointLight(0xffffff, 0.8, 6);
      softFill.position.set(-2, 3, 2);
      scene.add(softFill);

      // ==========================================
      // INTERACTION & ANIMATION LOGIC
      // ==========================================
      const handleWindowPointerMove = (e: MouseEvent) => {
        const rect = currentMount.getBoundingClientRect();
        // Normalized cursor coords (-1 to +1) relative to canvas center
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        mouseParallaxRef.current = {
          x: Math.max(-1.2, Math.min(1.2, nx)),
          y: Math.max(-1.2, Math.min(1.2, ny)),
        };

        // Move dynamic light to track pointer in 3D
        cursorLight.position.x = mouseParallaxRef.current.x * 2.5;
        cursorLight.position.y = mouseParallaxRef.current.y * 2.5;
      };

      window.addEventListener('mousemove', handleWindowPointerMove, { passive: true });

      // Resize Observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        const { width: newW, height: newH } = entries[0].contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      });
      resizeObserver.observe(currentMount);

      // Intersection Observer (Pauses animation when scrolled away to save 100% CPU/GPU)
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(currentMount);

      // Tab visibility listener
      const handleVisibilityChange = () => {
        isVisible = document.visibilityState === 'visible';
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Animation clock
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Skip render computations if offscreen or tab hidden
        if (!isVisible) return;

        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsedTime = clock.getElapsedTime();
        const now = Date.now();
        const timeSinceInteraction = now - lastInteractionTimeRef.current;

        // 1. Idle auto-spin and harmonic bobbing
        const isDragging = isDraggingRef.current;
        const baseSpinSpeed = isLowPower ? 0.001 : 0.0035;

        if (!isDragging) {
          // If not actively dragged, gently increment baseline rotation
          targetRotationRef.current.y += baseSpinSpeed;

          // Apply gentle momentum decay if recently released
          if (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001) {
            targetRotationRef.current.y += velocityRef.current.x;
            targetRotationRef.current.x += velocityRef.current.y;
            velocityRef.current.x *= 0.92;
            velocityRef.current.y *= 0.92;
          }

          // Return smoothly to natural pitch/tilt resting angle if idle for > 2 seconds
          if (timeSinceInteraction > 2000) {
            const restingPitch = 0.2 + mouseParallaxRef.current.y * 0.15;
            targetRotationRef.current.x += (restingPitch - targetRotationRef.current.x) * 0.02;
          }
        }

        // Clamp pitch to avoid gimbal flip
        targetRotationRef.current.x = Math.max(
          -Math.PI / 2.3,
          Math.min(Math.PI / 2.3, targetRotationRef.current.x)
        );

        // Smooth damping interpolation
        const dampingFactor = isDragging ? 0.2 : 0.07;
        currentRotationRef.current.x +=
          (targetRotationRef.current.x - currentRotationRef.current.x) * dampingFactor;
        currentRotationRef.current.y +=
          (targetRotationRef.current.y - currentRotationRef.current.y) * dampingFactor;

        // Apply to root group with subtle mouse parallax addition
        const parallaxX = isDragging ? 0 : mouseParallaxRef.current.y * 0.08;
        const parallaxY = isDragging ? 0 : mouseParallaxRef.current.x * 0.12;

        rootGroup.rotation.x = currentRotationRef.current.x + parallaxX;
        rootGroup.rotation.y = currentRotationRef.current.y + parallaxY;

        // 2. Harmonic organic idle animations of sub-components
        if (!isLowPower) {
          // Subtle floating bob
          rootGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.06;

          // Central cube micro-nod
          centralCube.rotation.z = Math.sin(elapsedTime * 0.8) * 0.04;
          innerCoreMesh.rotation.y = elapsedTime * 0.6;
          innerCoreMesh.rotation.x = elapsedTime * 0.4;

          // Counter-rotating rings
          ring1.rotation.z = elapsedTime * 0.12;
          ring2.rotation.z = -elapsedTime * 0.08;

          // Play button gentle pulse/float
          playButtonMesh.position.y = 0.6 + Math.sin(elapsedTime * 2.0) * 0.03;
          playButtonMesh.rotation.y = -0.2 + Math.cos(elapsedTime * 1.5) * 0.08;

          // Keyframes orbit flutter
          keyframe1.rotation.y = elapsedTime * 1.2;
          keyframe2.rotation.x = elapsedTime * 0.9;

          // Growth bars dynamic harmonic wave
          growthGroup.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh) {
              child.position.y = (barHeights[i] || 0.2) / 2 + Math.sin(elapsedTime * 2.5 + i * 0.6) * 0.015;
            }
          });
        }

        renderer.render(scene, camera);
      };

      animate();

      // ==========================================
      // CLEANUP
      // ==========================================
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleWindowPointerMove);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();

        // Dispose all GPU geometries, materials and buffers
        disposables.forEach((item) => {
          try {
            item.dispose();
          } catch {
            // ignore cleanup errors
          }
        });

        renderer.dispose();
        if (domElement.parentElement === currentMount) {
          currentMount.removeChild(domElement);
        }
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to CSS preview', err);
      setHasWebGL(false);
    }
  }, [isLowPower]);

  // ==========================================
  // UNIFIED POINTER DRAGGING (Mouse, Trackpad & Touch)
  // ==========================================
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    setIsInteracting(true);
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    rotStartRef.current = {
      x: targetRotationRef.current.x,
      y: targetRotationRef.current.y,
    };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    velocityRef.current = { x: 0, y: 0 };
    lastInteractionTimeRef.current = Date.now();

    // Capture pointer so drag continues smoothly even if user moves outside element
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if pointer capture fails
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;

    // Rotation sensitivity
    const sensitivity = 0.0075;
    targetRotationRef.current.y = rotStartRef.current.y + deltaX * sensitivity;
    targetRotationRef.current.x = rotStartRef.current.x + deltaY * sensitivity;

    // Track velocity for inertia release
    const now = Date.now();
    const dt = Math.max(1, now - lastPointerRef.current.time);
    const vx = ((e.clientX - lastPointerRef.current.x) / dt) * 0.08;
    const vy = ((e.clientY - lastPointerRef.current.y) / dt) * 0.08;
    velocityRef.current = { x: vx, y: vy };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
    lastInteractionTimeRef.current = now;
  }, []);

  const handlePointerUpOrCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsInteracting(false);
    lastInteractionTimeRef.current = Date.now();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      role="region"
      aria-label="Footazix interactive 3D studio experience"
      className={`relative flex items-center justify-center overflow-hidden select-none pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Interactive Drag Hint (fades out during interaction) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md ${
          isInteracting ? 'opacity-0' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#B1FF00] animate-pulse" />
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#A7AEA0]">
          Drag to Rotate
        </span>
      </div>

      {/* Clean Black / Agency Fallback if WebGL unsupported */}
      {!hasWebGL && (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#B1FF00]/20 animate-spin [animation-duration:30s]" />
            <div className="absolute inset-4 rounded-2xl border border-[#B1FF00]/30 rotate-45 transform-gpu" />
            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-zinc-900 via-[#101310] to-[#151915] border border-[#B1FF00]/30 shadow-2xl flex items-center justify-center glow-lime-sm">
              <div className="w-16 h-16 border-2 border-[#B1FF00]/80 rotate-12 flex items-center justify-center">
                <span className="text-[#B1FF00] font-display font-extrabold text-sm tracking-widest">
                  FX
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
