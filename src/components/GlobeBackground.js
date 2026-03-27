'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Very dark space blue/black
    
    // Add some subtle stars to the background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Cleanup any existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();
    
    // Realistic Earth Textures (Hotlinked from Three.js official examples)
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const cloudMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_2048.png');

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. MAIN EARTH SPHERE
    const radius = 2.5;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      normalMap: earthNormal,
      specular: new THREE.Color(0x333333),
      shininess: 15
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    earthGroup.add(earthMesh);

    // 2. CLOUDS SHELL
    const cloudGeometry = new THREE.SphereGeometry(radius + 0.03, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(cloudMesh);

    // 3. ATMOSPHERE GLOW (Blueish edge)
    const atmosGeometry = new THREE.SphereGeometry(radius + 0.15, 64, 64);
    // Standard basic glow technique
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d2ff, // Wave blue tint for the atmosphere
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    earthGroup.add(atmosMesh);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Low ambient light for realism
    scene.add(ambientLight);
    
    // Sun light (Directional)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5); // Light coming from top right
    scene.add(sunLight);
    
    // Subtle blue backlight to preserve wave-blue theme aesthetics
    const backLight = new THREE.PointLight(0x00d2ff, 0.4, 50);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    camera.position.z = 6.5;

    // ANIMATION LOOP
    let animationId;
    const animate = () => {
      // Rotation speeds
      earthMesh.rotation.y += 0.001; 
      // Clouds rotate slightly faster than the earth for realism
      cloudMesh.rotation.y += 0.0012; 
      
      // Slight atmospheric tilt
      earthGroup.rotation.x = 0.1;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // RESIZE HANDLER
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
      
      geometry.dispose();
      material.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosGeometry.dispose();
      atmosMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      
      earthMap.dispose();
      earthSpecular.dispose();
      earthNormal.dispose();
      cloudMap.dispose();
      
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
        background: '#030712'
      }} 
    />
  );
}
