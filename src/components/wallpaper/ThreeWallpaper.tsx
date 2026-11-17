/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WallpaperTheme } from '../../types/os';

import mountainImg from '../../assets/images/lumeos_wallpaper_mountain_1792091519776.jpg';
import tokyoImg from '../../assets/images/lumeos_wallpaper_tokyo_dusk_1792091519886.jpg';
import abstractImg from '../../assets/images/lumeos_wallpaper_abstract_flow_1792091519153.jpg';
import nebulaImg from '../../assets/images/lumeos_wallpaper_cosmic_nebula_1792091519916.jpg';

// Generated High-Res Wallpapers (bundled statically for offline/ISO usage)
export const WALLPAPER_IMAGES: Record<string, string> = {
  'photo-mountain': mountainImg,
  'photo-tokyo': tokyoImg,
  'photo-abstract': abstractImg,
  'photo-nebula': nebulaImg,
};

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

interface WallpaperProps {
  theme: WallpaperTheme;
  isPaused?: boolean;
}

export const ThreeWallpaper: React.FC<WallpaperProps> = ({ theme, isPaused = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [webGLError, setWebGLError] = useState(false);

  const is3DTheme = theme.startsWith('3d-');
  const isPhotoTheme = theme.startsWith('photo-') || (is3DTheme && webGLError);

  useEffect(() => {
    if (!is3DTheme) return;

    if (!isWebGLAvailable()) {
      setWebGLError(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let roomEnvTexture: THREE.Texture | null = null;
    let animationFrameId: number;

    try {
      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(
        theme === '3d-dna-lattice' ? 0x07111a : theme === '3d-celestial' ? 0x090916 : 0x0c0f14,
        0.038
      );

      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 1.2, 7.5);

      // 2. Modern Renderer with safe context creation
      const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
        alpha: true,
        failIfMajorPerformanceCaveat: false,
      });

      renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = !isHeadless;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 3. Studio Environment Reflection (RoomEnvironment)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = roomEnvTexture;
      pmremGenerator.dispose();

      // 4. Studio Lighting Rig
      const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.8);
      keyLight.position.set(4, 7, 5);
      keyLight.castShadow = !isHeadless;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight(0x8ab4f8, 0x1f293d, 1.2);
      scene.add(hemiLight);

      const rimLight = new THREE.PointLight(0x38bdf8, 2.0, 12);
      rimLight.position.set(-5, 3, -4);
      scene.add(rimLight);

      // 5. Composite Procedural Models (THREE.Group)
      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Ground Contact Shadow Plane
      const shadowGeo = new THREE.PlaneGeometry(10, 10);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -2.2;
      scene.add(shadowPlane);

      // Materials
      const darkObsidianMat = new THREE.MeshPhysicalMaterial({
        color: 0x13171e,
        metalness: 0.85,
        roughness: 0.22,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      });

      const brushedGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.25,
        reflectivity: 0.9,
      });

      const crystalCoreMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 1.2,
        ior: 1.52,
        transparent: true,
        opacity: 0.92,
      });

      const bioBaseMatA = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        metalness: 0.4,
        roughness: 0.2,
      });

      const bioBaseMatB = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        metalness: 0.4,
        roughness: 0.2,
      });

      const backboneMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.3,
      });

      if (theme === '3d-zen-monolith') {
        const monolithGroup = new THREE.Group();
        const monolithGeo = new THREE.BoxGeometry(1.4, 3.2, 0.45, 2, 2, 2);
        const monolithMesh = new THREE.Mesh(monolithGeo, darkObsidianMat);
        monolithMesh.castShadow = true;
        monolithMesh.receiveShadow = true;
        monolithGroup.add(monolithMesh);

        const innerCoreGeo = new THREE.OctahedronGeometry(0.55, 0);
        const innerCoreMesh = new THREE.Mesh(innerCoreGeo, crystalCoreMat);
        innerCoreMesh.position.set(0, 0, 0.32);
        monolithGroup.add(innerCoreMesh);

        const trimGeo = new THREE.TorusGeometry(1.8, 0.028, 16, 100);
        const trimMesh = new THREE.Mesh(trimGeo, brushedGoldMat);
        trimMesh.rotation.x = Math.PI / 3;
        monolithGroup.add(trimMesh);

        const trimGeo2 = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
        const trimMesh2 = new THREE.Mesh(trimGeo2, darkObsidianMat);
        trimMesh2.rotation.y = Math.PI / 4;
        monolithGroup.add(trimMesh2);

        for (let i = 0; i < 6; i++) {
          const satGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
          const satMesh = new THREE.Mesh(satGeo, i % 2 === 0 ? brushedGoldMat : darkObsidianMat);
          const angle = (i / 6) * Math.PI * 2;
          satMesh.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 1.2, Math.sin(angle) * 0.8);
          satMesh.rotation.set(angle, angle * 0.5, 0);
          monolithGroup.add(satMesh);
        }
        rootGroup.add(monolithGroup);
      } else if (theme === '3d-dna-lattice') {
        const dnaGroup = new THREE.Group();
        const numRungs = 24;
        const heightSpan = 5.2;

        for (let i = 0; i < numRungs; i++) {
          const t = (i / numRungs) * Math.PI * 4;
          const y = (i / numRungs - 0.5) * heightSpan;
          const radius = 1.35;
          const x1 = Math.cos(t) * radius;
          const z1 = Math.sin(t) * radius;
          const x2 = Math.cos(t + Math.PI) * radius;
          const z2 = Math.sin(t + Math.PI) * radius;

          const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
          const s1 = new THREE.Mesh(sphereGeo, backboneMat);
          s1.position.set(x1, y, z1);
          dnaGroup.add(s1);

          const s2 = new THREE.Mesh(sphereGeo, backboneMat);
          s2.position.set(x2, y, z2);
          dnaGroup.add(s2);

          const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.04, radius, 12);
          const r1 = new THREE.Mesh(cylinderGeo, bioBaseMatA);
          r1.position.set(x1 * 0.5, y, z1 * 0.5);
          r1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1, 0, z1).normalize());
          dnaGroup.add(r1);

          const r2 = new THREE.Mesh(cylinderGeo, bioBaseMatB);
          r2.position.set(x2 * 0.5, y, z2 * 0.5);
          r2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2, 0, z2).normalize());
          dnaGroup.add(r2);
        }
        rootGroup.add(dnaGroup);
      } else if (theme === '3d-celestial') {
        const celestialGroup = new THREE.Group();
        const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
        const coreMesh = new THREE.Mesh(coreGeo, crystalCoreMat);
        celestialGroup.add(coreMesh);

        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 16, 80), brushedGoldMat);
        ring1.rotation.x = Math.PI / 4;
        celestialGroup.add(ring1);

        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.03, 16, 80), darkObsidianMat);
        ring2.rotation.y = Math.PI / 3;
        celestialGroup.add(ring2);

        const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.025, 16, 80), brushedGoldMat);
        ring3.rotation.z = Math.PI / 6;
        celestialGroup.add(ring3);

        rootGroup.add(celestialGroup);
      }

      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseRef.current.targetX = nx * 0.45;
        mouseRef.current.targetY = ny * 0.35;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer?.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      try {
        renderer.compile(scene, camera);
      } catch {}

      let lastTime = performance.now();

      const animate = (time: number) => {
        animationFrameId = requestAnimationFrame(animate);
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        if (!isPaused) {
          const dampFactor = 1 - Math.exp(-4.5 * dt);
          mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * dampFactor;
          mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * dampFactor;

          rootGroup.rotation.y += 0.35 * dt;
          rootGroup.rotation.x = Math.sin(time * 0.0006) * 0.12 + mouseRef.current.y * 0.6;
          rootGroup.rotation.z = Math.cos(time * 0.0005) * 0.08 + mouseRef.current.x * 0.4;

          camera.position.x = mouseRef.current.x * 0.8;
          camera.position.y = 1.2 + mouseRef.current.y * 0.6;
          camera.lookAt(0, 0, 0);
        }

        renderer?.render(scene, camera);
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer?.dispose();
        roomEnvTexture?.dispose();
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else if (obj.material) obj.material.dispose();
          }
        });
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('WebGL context creation failed, gracefully falling back to photo wallpaper', err);
      setWebGLError(true);
    }
  }, [theme, isPaused, is3DTheme]);

  // If Photographic Wallpaper or WebGL fallback
  if (isPhotoTheme) {
    const photoKey = is3DTheme ? 'photo-mountain' : theme;
    const imgUrl = WALLPAPER_IMAGES[photoKey] || WALLPAPER_IMAGES['photo-mountain'];
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-neutral-950">
        {/* Full bleed background image */}
        <img
          src={imgUrl}
          alt="LumeOS Wallpaper"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none scale-[1.02] transform transition-transform duration-1000"
        />

        {/* Ambient Dark Gradient Scrim for WCAG AA readability and glass contrast */}
        <div className="absolute inset-0 bg-neutral-950/25 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/20 to-black/60 pointer-events-none" />
      </div>
    );
  }

  // If 3D Theme and WebGL is functional
  if (is3DTheme) {
    return (
      <div
        ref={mountRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-neutral-950"
        style={{ touchAction: 'none' }}
      />
    );
  }

  // If Gradient Themes
  let bgClass = 'bg-neutral-950';
  if (theme === 'gradient-nordic') {
    bgClass = 'bg-radial-[ellipse_at_top] from-slate-900 via-neutral-950 to-neutral-950';
  } else if (theme === 'gradient-tokyo') {
    bgClass = 'bg-radial-[ellipse_at_center] from-indigo-950/80 via-neutral-950 to-neutral-950';
  } else if (theme === 'minimal-slate') {
    bgClass = 'bg-[#0b0d11]';
  }

  return (
    <div className={`fixed inset-0 pointer-events-none transition-colors duration-700 ${bgClass}`} />
  );
};
