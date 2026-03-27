'use client';

import { useEffect, useRef, useState } from 'react';

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let animationId;
    let THREE;

    const initThree = async () => {
      THREE = await import('three');

      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x0a0e1a, 1);

      // Create particles
      const particleCount = 2000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        // Emerald and amber colors
        const isEmerald = Math.random() > 0.4;
        if (isEmerald) {
          colors[i * 3] = 0.06 + Math.random() * 0.1;
          colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
          colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
        } else {
          colors[i * 3] = 0.9 + Math.random() * 0.1;
          colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
          colors[i * 3 + 2] = 0.04;
        }

        sizes[i] = Math.random() * 3 + 1;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Create glowing center orb
      const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.6,
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      scene.add(orb);

      // Outer glow ring
      const ringGeometry = new THREE.RingGeometry(1.2, 1.5, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);

      camera.position.z = 5;

      const startTime = Date.now();
      const duration = 3500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Rotate particles
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;

        // Pulse orb
        const scale = 1 + Math.sin(elapsed * 0.003) * 0.2;
        orb.scale.set(scale, scale, scale);

        // Rotate ring
        ring.rotation.x += 0.01;
        ring.rotation.z += 0.005;

        // Camera zoom in
        camera.position.z = 5 - progress * 2;

        // Fade out near end
        if (progress > 0.7) {
          const fadeProgress = (progress - 0.7) / 0.3;
          particleMaterial.opacity = 0.8 * (1 - fadeProgress);
          orbMaterial.opacity = 0.6 * (1 - fadeProgress);
          ringMaterial.opacity = 0.3 * (1 - fadeProgress);
        }

        renderer.render(scene, camera);

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          setVisible(false);
          setTimeout(() => {
            onComplete?.();
          }, 800);

          // Cleanup
          particleGeometry.dispose();
          particleMaterial.dispose();
          orbGeometry.dispose();
          orbMaterial.dispose();
          ringGeometry.dispose();
          ringMaterial.dispose();
          renderer.dispose();
        }
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
        if (animationId) cancelAnimationFrame(animationId);
      };
    };

    initThree();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  return (
    <div className={`intro-overlay ${!visible ? 'hidden' : ''}`}>
      <canvas ref={canvasRef} className="intro-canvas" />
      <div style={{
        position: 'absolute',
        zIndex: 10,
        textAlign: 'center',
        animation: 'fadeInUp 1s ease 0.5s both',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #34d399, #fbbf24, #10b981)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s linear infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.04em',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.3))',
        }}>
          NOGIRR
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          fontWeight: 300,
          marginTop: '8px',
          letterSpacing: '0.1em',
          animation: 'fadeIn 1s ease 1s both',
        }}>
          SHARE FOOD • SHARE LOVE
        </p>
      </div>
    </div>
  );
}
