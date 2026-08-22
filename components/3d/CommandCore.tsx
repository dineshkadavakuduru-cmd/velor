"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT_POSITIONS: [number, number, number][] = [
  [1.05, 0, 0],
  [-1.05, 0, 0],
  [0, 1.05, 0],
  [0, -1.05, 0],
  [0, 0, 1.05],
  [0, 0, -1.05],
];

export default function CommandCore() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !innerRef.current) return;
    if (reducedMotion.current) return;

    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x += delta * 0.03;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;

    innerRef.current.rotation.y -= delta * 0.2;
    innerRef.current.rotation.z += delta * 0.06;
  });

  const accentGeometry = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), []);

  return (
    <group ref={groupRef}>
      <mesh>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#0A0F17"
          roughness={0.75}
          metalness={0.25}
        />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.25, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#0A0F17"
          roughness={0.4}
          metalness={0.6}
          emissive="#18F0FF"
          emissiveIntensity={0.06}
        />
      </mesh>

      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color="#0A0F17"
          roughness={0.3}
          metalness={0.5}
          emissive="#18F0FF"
          emissiveIntensity={0.4}
        />
      </mesh>

      {ACCENT_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos} geometry={accentGeometry}>
          <meshStandardMaterial
            color="#7A5CFF"
            roughness={0.3}
            metalness={0.5}
            emissive="#7A5CFF"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
