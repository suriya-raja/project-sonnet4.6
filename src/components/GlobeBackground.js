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
      gradient.addColorStop(0.2, 'rgba(0, 210, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 210, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };
    const dotTexture = createDotTexture();

    // 2. GLOBE GEOMETRY
    const radius = 2.5;
    const globe = new THREE.Group();
    scene.add(globe);

    // High-resolution sphere geometry for structured look
    const globeGeometry = new THREE.SphereGeometry(radius, 48, 48);
    
    // 3. DOTTED POINTS (Vertices of the geometry)
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.025, // Tiny crisp dots
      map: dotTexture,
      color: 0x00d2ff, // Bright Wave blue
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particlesMesh = new THREE.Points(globeGeometry, particlesMaterial);
    globe.add(particlesMesh);

    // 4. DELICATE WIREFRAME (Subtle lines)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12, 
    });
    const wireframeMesh = new THREE.Mesh(globeGeometry, wireframeMaterial);
    globe.add(wireframeMesh);

    // 5. OCCLUSION SPHERE (Very dark/invisible center)
    const occlusionMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2, 
    });
    const occlusionMesh = new THREE.Mesh(globeGeometry, occlusionMaterial);
    globe.add(occlusionMesh);

    // 6. FLOATING GEOMETRY
    const floatingShapes = new THREE.Group();
    scene.add(floatingShapes);
    
    for (let i = 0; i < 20; i++) {
        const geo = new THREE.IcosahedronGeometry(Math.random() * 0.12 + 0.05, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00d2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const shape = new THREE.Mesh(geo, mat);
        shape.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8 - 3
        );
        shape.userData = {
            rx: Math.random() * 0.01,
            ry: Math.random() * 0.01,
            rz: Math.random() * 0.01
        };
        floatingShapes.add(shape);
    }

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00d2ff, 4, 60); 
    pointLight.position.set(10, 5, 10);
    scene.add(pointLight);

    camera.position.z = 5.2; 

    // ANIMATION LOOP
    let animationId;
    const animate = () => {
      globe.rotation.y += 0.0015; 
      globe.rotation.x = 0.2; 
      floatingShapes.children.forEach(shape => {
        shape.rotation.x += shape.userData.rx;
        shape.rotation.y += shape.userData.ry;
        shape.rotation.z += shape.userData.rz;
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
