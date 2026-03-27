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

    // GLOBE
    const radius = 2.5;
    const segments = 64;
    
    // Base solid sphere (dark ocean/base)
    const baseGeometry = new THREE.SphereGeometry(radius, segments, segments);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x051b24,
      emissive: 0x00111a,
      specular: 0x111111,
      shininess: 10,
    });
    const globe = new THREE.Mesh(baseGeometry, baseMaterial);
    scene.add(globe);

    // Wireframe overlay to look like holographic earth geometry
    const wireframeGeometry = new THREE.SphereGeometry(radius + 0.02, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff, // Wave blue
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const wireframeGlobe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globe.add(wireframeGlobe);

    // DOTTED MANNER: Random "continents" points or bumps using a points layer
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i=0; i<particlesCount * 3; i+=3) {
      // Random points on a sphere
      const r = radius + 0.05;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i+2] = r * Math.cos(phi);
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00d2ff, // Bright Wave blue
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    globe.add(particlesMesh);

    // FLOATING GEOMETRY
    const floatingShapes = new THREE.Group();
    scene.add(floatingShapes);
    
    for (let i = 0; i < 20; i++) {
        const geo = new THREE.IcosahedronGeometry(Math.random() * 0.15 + 0.05, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00d2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00d2ff, 3, 60); 
    pointLight.position.set(10, 5, 10);
    scene.add(pointLight);

    camera.position.z = 5.0; // Zoomed in closer

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

    // RESIZE
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
      baseGeometry.dispose();
      baseMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
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
        // Transparent background so we don't block anything
      }} 
    />
  );
}
