'use client';

import { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationId;
    let cleanupFn;

    const initThree = async () => {
      const THREE = await import('three');
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Data streams / Particles (Aqua Blue theme)
      const particlesGeo = new THREE.BufferGeometry();
      const particleCount = 2000;
      const pos = new Float32Array(particleCount * 3);
      for(let i=0; i<particleCount*3; i++) {
        pos[i] = (Math.random() - 0.5) * 60;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particlesMat = new THREE.PointsMaterial({
        color: 0x00e5ff,
        size: 0.08,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particles);

      camera.position.z = 5;

      let mouseX = 0, mouseY = 0;
      const onMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      const animate = () => {
        particles.rotation.y += 0.0005;
        const positions = particlesGeo.attributes.position.array;
        for (let i = 1; i < particleCount * 3; i += 3) {
          positions[i] += 0.02; // Slower, elegant floating
          if (positions[i] > 30) positions[i] = -30;
        }
        particlesGeo.attributes.position.needsUpdate = true;
        
        camera.position.x += (mouseX * 1.0 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

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

      cleanupFn = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        particlesGeo.dispose();
        particlesMat.dispose();
        renderer.dispose();
      };
    };

    initThree();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', backgroundColor: '#05070a' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
