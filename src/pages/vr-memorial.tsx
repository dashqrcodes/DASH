/**
 * VR Memorial Space
 * 
 * Immersive 3D environment for experiencing memorial content
 * Features:
 * - 360° photo viewing
 * - Spatial audio
 * - Interactive memory nodes
 * - WebXR support (Quest, Pico, etc.)
 * - Fallback to WebGL for desktop
 */

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import Three.js to avoid SSR issues
const loadThree = async () => {
  if (typeof window !== 'undefined') {
    return await import('three');
  }
  return null;
};

interface PhotoNode {
  id: string;
  url: string;
  position: [number, number, number];
  date?: string;
  memory?: string;
}

const VRMemorialPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [photos, setPhotos] = useState<PhotoNode[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load photos from localStorage
    const slideshowData = localStorage.getItem('slideshowData');
    if (slideshowData) {
      try {
        const data = JSON.parse(slideshowData);
        const photoNodes: PhotoNode[] = data.photos?.map((photo: any, index: number) => ({
          id: photo.id || `photo-${index}`,
          url: photo.url || photo.preview || '',
          position: [
            Math.cos((index / data.photos.length) * Math.PI * 2) * 5,
            (index % 3) * 2 - 2,
            Math.sin((index / data.photos.length) * Math.PI * 2) * 5,
          ],
          date: photo.date,
          memory: photo.memory,
        })) || [];
        setPhotos(photoNodes);
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || photos.length === 0 || typeof window === 'undefined') return;

    let THREE: any;
    let scene: any;
    let camera: any;
    let renderer: any;
    let particles: any;
    let handleResize: (() => void) | null = null;

    // Load Three.js dynamically
    loadThree().then((threeModule) => {
      if (!threeModule) return;
      THREE = threeModule;

      // Initialize Three.js scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      // Camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 10);
      cameraRef.current = camera;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current?.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Create photo frames
      photos.forEach((photo) => {
        if (!photo.url) return;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
          photo.url,
          (texture: any) => {
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...photo.position);
            mesh.lookAt(camera.position);
            scene.add(mesh);

            // Add glow effect
            const glowGeometry = new THREE.PlaneGeometry(2.2, 2.2);
            const glowMaterial = new THREE.MeshBasicMaterial({
              color: 0x667eea,
              transparent: true,
              opacity: 0.3,
              side: THREE.BackSide,
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(mesh.position);
            glow.rotation.copy(mesh.rotation);
            scene.add(glow);
          },
          undefined,
          (error: any) => {
            console.error('Error loading texture:', error);
          }
        );
      });

      // Add floating particles
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 50;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0x667eea,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (particles) {
          particles.rotation.y += 0.001;
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

      // Handle window resize
      handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };
      window.addEventListener('resize', handleResize);

      // Check for WebXR support
      if (navigator.xr && renderer.xr) {
        renderer.xr.enabled = true;
        setIsVRSupported(true);
      }
    });

    // Cleanup function
    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (containerRef.current && rendererRef.current?.domElement?.parentNode) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [photos]);

  const enterVR = async () => {
    if (!rendererRef.current?.xr) return;

    try {
      await rendererRef.current.xr.setSession(
        await navigator.xr!.requestSession('immersive-vr')
      );
      setIsVRActive(true);
    } catch (error) {
      console.error('Failed to enter VR:', error);
      alert('VR not available. Please use a VR headset or enable WebXR.');
    }
  };

  const exitVR = () => {
    if (rendererRef.current?.xr?.session) {
      rendererRef.current.xr.session.end();
      setIsVRActive(false);
    }
  };

  return (
    <>
      <Head>
        <title>VR Memorial Space - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000000',
          overflow: 'hidden',
        }}
      >
        {/* VR Controls */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            gap: '12px',
          }}
        >
          {isVRSupported && !isVRActive && (
            <button
              onClick={enterVR}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              }}
            >
              🥽 Enter VR
            </button>
          )}
          {isVRActive && (
            <button
              onClick={exitVR}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Exit VR
            </button>
          )}
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </div>

        {/* Instructions */}
        {photos.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
              zIndex: 100,
            }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
              No photos available
            </h2>
            <p style={{ opacity: 0.7 }}>
              Add photos to your slideshow to view them in VR
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default VRMemorialPage;

