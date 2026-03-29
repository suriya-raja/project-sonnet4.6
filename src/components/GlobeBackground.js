'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b101e'); // Dark background
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Attempt to clean up before appending
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 1. CREATE DOT TEXTURE (for clear circular points)
    const createDotTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(0, 229, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };
    const dotTexture = createDotTexture();

    // 2. STARFIELD (Deep space effect)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    });
    const starsParticles = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsParticles);

    // 3. GLOBE GEOMETRY
    const radius = 2.5;
    const globe = new THREE.Group();
    scene.add(globe);

    const globeGeometry = new THREE.SphereGeometry(radius, 64, 64);
    
    // 4. DOTTED POINTS (Vertices of the geometry)
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.035,
      map: dotTexture,
      color: 0x00e5ff, 
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particlesMesh = new THREE.Points(globeGeometry, particlesMaterial);
    globe.add(particlesMesh);

    // 5. INNER NEURAL GLOW
    const innerGeometry = new THREE.SphereGeometry(radius * 0.98, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.02,
        wireframe: true
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    globe.add(innerMesh);

    // 6. FLOATING GEOMETRY (Data Nodes)
    const floatingShapes = new THREE.Group();
    scene.add(floatingShapes);
    
    for (let i = 0; i < 30; i++) {
        const geo = new THREE.OctahedronGeometry(Math.random() * 0.1 + 0.05, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const shape = new THREE.Mesh(geo, mat);
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const d = 4 + Math.random() * 3;
        shape.position.set(
            Math.cos(angle1) * Math.sin(angle2) * d,
            Math.sin(angle1) * Math.sin(angle2) * d,
            Math.cos(angle2) * d
        );
        shape.userData = {
            rx: Math.random() * 0.02,
            ry: Math.random() * 0.02,
            rz: Math.random() * 0.02,
            float_offset: Math.random() * Math.PI * 2
        };
        floatingShapes.add(shape);
    }

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    camera.position.z = 6; 

    // ANIMATION LOOP
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate Globe
      globe.rotation.y = elapsedTime * 0.1; 
      globe.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

      // Pulse Particles (Neural Wave)
      particlesMaterial.opacity = 0.6 + Math.sin(elapsedTime * 2) * 0.2;
      particlesMaterial.size = 0.035 + Math.sin(elapsedTime * 3) * 0.005;

      // Animate Stars
      starsParticles.rotation.y = -elapsedTime * 0.01;

      // Animate Floating Nodes
      floatingShapes.children.forEach(shape => {
        shape.rotation.x += shape.userData.rx;
        shape.rotation.y += shape.userData.ry;
        shape.position.y += Math.sin(elapsedTime + shape.userData.float_offset) * 0.005;
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current?.firstChild) {
        containerRef.current.removeChild(renderer.domElement);
      }
      globeGeometry.dispose();
      particlesMaterial.dispose();
      wireframeMaterial.dispose();
      occlusionMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }} 
    />
  );
}
