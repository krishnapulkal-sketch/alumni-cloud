import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GemMesh = ({ level }: { level: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  const getGemConfig = () => {
    switch(level) {
      case 'Gold': return { color: '#fbbf24', distort: 0.6 };
      case 'Silver': return { color: '#e2e8f0', distort: 0.4 };
      default: return { color: '#38bdf8', distort: 0.3 };
    }
  };

  const config = getGemConfig();

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} castShadow receiveShadow scale={1.2}>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial 
          color={config.color} 
          envMapIntensity={0.8} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.8}
          roughness={0.2}
          distort={config.distort}
          speed={4}
        />
      </mesh>
    </Float>
  );
};

export const Gemosphere: React.FC<{ level?: string }> = ({ level = 'Bronze' }) => {
  return (
    <div className="w-full h-full min-h-[300px] absolute inset-0 pointer-events-auto cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <Environment preset="city" />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <GemMesh level={level} />
      </Canvas>
    </div>
  );
};
