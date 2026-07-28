import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function NairaGlobe() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    meshRef.current.rotation.y += 0.004;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshStandardMaterial
        color="#008751"
        metalness={0.3}
        roughness={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

function FloatingCoin({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    meshRef.current.rotation.y += 0.02;
    meshRef.current.rotation.x += 0.01;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
      <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function NairaRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    ref.current.rotation.z += 0.008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });

  return (
    <Torus ref={ref} args={[2.8, 0.06, 16, 100]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
    </Torus>
  );
}

function Particles() {
  const points = useRef<THREE.Points>(null!);

  useFrame(() => {
    points.current.rotation.y += 0.001;
  });

  const positions = new Float32Array(
    Array.from({ length: 200 }, () => [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
    ]).flat()
  );

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#d4af37" transparent opacity={0.6} />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#00b86a" />
      <pointLight position={[3, 3, 3]} intensity={1} color="#d4af37" />

      <Suspense fallback={null}>
        <Stars radius={50} depth={30} count={800} factor={2} fade />

        <FloatingCoin position={[-3.2, 1.5, 0]} delay={0} />
        <FloatingCoin position={[3.2, -0.5, 0.5]} delay={1} />
        <FloatingCoin position={[-2.5, -2, -0.5]} delay={2} />
        <FloatingCoin position={[2.8, 2.2, -1]} delay={0.5} />
        <FloatingCoin position={[0.5, 3.0, 1]} delay={1.5} />

        <Particles />
      </Suspense>
    </Canvas>
  );
}
