import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const AuraMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={3}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
        <MeshDistortMaterial 
          color="#38bdf8" 
          emissive="#7dd3fc"
          emissiveIntensity={0.5}
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.8}
          roughness={0.1}
          distort={0.4}
          speed={3}
          wireframe={true}
        />
      </Sphere>
      {/* Inner solid core */}
      <Sphere args={[1, 32, 32]}>
        <MeshDistortMaterial 
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={1}
          distort={0.2}
          speed={5}
        />
      </Sphere>
    </Float>
  );
};

export const AuraSphere: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <Environment preset="night" />
        <AuraMesh />
      </Canvas>
    </div>
  );
};
