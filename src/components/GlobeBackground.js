'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#03050a'); // Very deep space background
    
    // Subtle stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1500;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        // distribute stars randomly
      posArray[i] = (Math.random() - 0.5) * 80;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffecec, // Slightly warm stars
      transparent: true,
      opacity: 0.7
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // CINEMATIC COLOR ENCODING & TONE MAPPING FOR REALISTIC CONTRAST
    // (Helps colors pop and shadows look deep without washing out)
    if (THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      renderer.outputEncoding = 3001; // Legacy sRGBEncoding
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2; // Huge boost to brightness and contrast
    
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();
    
    // High Quality Earth Textures
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    if (THREE.SRGBColorSpace) {
      earthMap.colorSpace = THREE.SRGBColorSpace;
    } else {
      earthMap.encoding = 3001; // Legacy
    }
    
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const cloudMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_2048.png');

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. MAIN EARTH SPHERE (PBR or High-quality Phong)
    const radius = 2.5;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      normalMap: earthNormal,
      specular: new THREE.Color(0x333333), // Sharp sun reflections on oceans
      shininess: 35, // High shininess for water
      normalScale: new THREE.Vector2(0.85, 0.85) // Pop the terrain relief more
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    
    // Slight axial tilt for realism (~23.5 degrees)
    earthMesh.rotation.z = 23.5 * Math.PI / 180;
    earthGroup.add(earthMesh);

    // 2. CLOUDS SHELL
    const cloudGeometry = new THREE.SphereGeometry(radius + 0.04, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.rotation.z = 23.5 * Math.PI / 180;
    earthGroup.add(cloudMesh);

    // 3. ATMOSPHERE GLOW
    const atmosGeometry = new THREE.SphereGeometry(radius + 0.15, 64, 64);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff, // Blue scattering
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    earthGroup.add(atmosMesh);

    // LIGHTS
    // Moderate ambient light so the night side of Earth isn't totally black
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);
    
    // Strong primary sun light
    const sunLight = new THREE.DirectionalLight(0xffeedd, 5.0); // Very warm and bright sun
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    
    // Strong blue rim light to outline the dark side brightly
    const backLight = new THREE.PointLight(0x00aaff, 3.5, 50);
    backLight.position.set(-6, -2, -6);
    scene.add(backLight);

    camera.position.z = 3.8; // Move camera much closer to make the globe massive and central

    // ANIMATION LOOP
    let animationId;
    const animate = () => {
      // Rotation around the tilted Y axis
      earthMesh.rotateY(0.001);
      // Clouds rotate slightly faster
      cloudMesh.rotateY(0.0012); 

      // Slowly drift the camera or group for dynamic feeling
      earthGroup.rotation.y += 0.0001;

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
        background: '#03050a'
      }} 
    />
  );
}
