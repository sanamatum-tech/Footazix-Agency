import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface FootazixHero3DProps {
  className?: string;
}

export const FootazixHero3D: React.FC<FootazixHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLowPower, setIsLowPower] = useState<boolean>(false);

  useEffect(() => {
    // Check for prefers-reduced-motion or mobile low-power
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && window.innerWidth < 768;
    if (mediaReduced) {
      setIsLowPower(true);
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Verify WebGL availability safely
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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

    try {
      const width = currentMount.clientWidth || 400;
      const height = currentMount.clientHeight || 400;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.8);

      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      currentMount.appendChild(renderer.domElement);

      // Group holding the abstract dark metallic identity
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // Primary dark metallic titanium material
      const titaniumMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x121319),
        metalness: 0.94,
        roughness: 0.18,
        wireframe: false,
      });

      // Accent cobalt edge material
      const accentCobaltMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0f172a),
        emissive: new THREE.Color(0x1d4ed8),
        emissiveIntensity: 0.35,
        metalness: 0.88,
        roughness: 0.22,
      });

      // Subtle wireframe halo
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x3b82f6),
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });

      // 1. Central faceted monolith prism (Octahedron with chamfered scale)
      const coreGeometry = new THREE.OctahedronGeometry(1.35, 1);
      const coreMesh = new THREE.Mesh(coreGeometry, titaniumMaterial);
      mainGroup.add(coreMesh);

      // 2. Outer intersecting orbital ring (representing editorial cutting / timeline focus)
      const ringGeometry = new THREE.TorusGeometry(1.85, 0.04, 16, 100);
      const ringMesh = new THREE.Mesh(ringGeometry, accentCobaltMaterial);
      ringMesh.rotation.x = Math.PI / 3;
      mainGroup.add(ringMesh);

      const secondaryRingGeometry = new THREE.TorusGeometry(2.1, 0.02, 12, 80);
      const secondaryRingMesh = new THREE.Mesh(secondaryRingGeometry, wireMaterial);
      secondaryRingMesh.rotation.y = Math.PI / 4;
      mainGroup.add(secondaryRingMesh);

      // 3. Precision satellite nodes (symbolizing the raw-to-final anchors)
      const nodeGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const node = new THREE.Mesh(nodeGeometry, accentCobaltMaterial);
        node.position.set(Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, 0);
        ringMesh.add(node);
      }

      // Studio Lighting
      // Soft ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      // Directional cool white key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      // Vibrant Electric Cobalt Rim / Fill Light
      const blueRimLight = new THREE.PointLight(0x2563eb, 3.5, 15);
      blueRimLight.position.set(-3, -2, 3);
      scene.add(blueRimLight);

      // Dynamic cursor tracking light
      const cursorLight = new THREE.PointLight(0x60a5fa, 1.2, 10);
      cursorLight.position.set(0, 0, 3);
      scene.add(cursorLight);

      // Mouse and Scroll tracking with smooth damping
      let targetRotX = 0;
      let targetRotY = 0;
      let currentRotX = 0;
      let currentRotY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = currentMount.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = x * 0.8;
        targetRotX = y * 0.8;
        cursorLight.position.x = x * 4;
        cursorLight.position.y = -y * 4;
      };

      const handleScroll = () => {
        const scrollY = window.scrollY;
        mainGroup.position.y = -scrollY * 0.0008;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Resize observer
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

      // Animation loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Continuous slow cinematic spin
        const baseSpin = isLowPower ? 0.002 : 0.005;
        mainGroup.rotation.y += baseSpin;

        // Interactive damping
        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        coreMesh.rotation.x = currentRotX * 0.6 + Math.sin(elapsedTime * 0.5) * 0.08;
        coreMesh.rotation.z = currentRotY * 0.6 + Math.cos(elapsedTime * 0.4) * 0.06;

        ringMesh.rotation.z += 0.004;
        secondaryRingMesh.rotation.x -= 0.003;

        // Subtle pulsing of the blue rim light
        blueRimLight.intensity = 3.2 + Math.sin(elapsedTime * 1.5) * 0.6;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();

        // Memory cleanup
        coreGeometry.dispose();
        ringGeometry.dispose();
        secondaryRingGeometry.dispose();
        nodeGeometry.dispose();
        titaniumMaterial.dispose();
        accentCobaltMaterial.dispose();
        wireMaterial.dispose();
        renderer.dispose();
        if (currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('WebGL init failed, using CSS fallback', err);
      setHasWebGL(false);
    }
  }, [isLowPower]);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {(!hasWebGL || isLowPower) && (
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* High-end CSS metallic fallback */}
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin [animation-duration:30s]" />
          <div className="absolute inset-4 rounded-2xl border border-blue-500/30 rotate-45 transform-gpu transition-transform" />
          <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-950 to-blue-950 border border-white/10 shadow-2xl flex items-center justify-center glow-blue-sm">
            <div className="w-16 h-16 border-2 border-blue-500/80 rotate-12 flex items-center justify-center">
              <span className="text-blue-400 font-display font-bold text-xs tracking-widest">FX</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
