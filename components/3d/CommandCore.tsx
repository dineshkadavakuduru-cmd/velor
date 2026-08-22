"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneInteraction } from "./SceneInteraction";

const ACCENT_POSITIONS: [number, number, number][] = [
  [1.05, 0, 0],
  [-1.05, 0, 0],
  [0, 1.05, 0],
  [0, -1.05, 0],
  [0, 0, 1.05],
  [0, 0, -1.05],
];

export default function CommandCore() {
  const outerRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const { pointer, active, reducedMotion } = useSceneInteraction();

  useFrame((state, delta) => {
    if (!outerRef.current || !groupRef.current || !innerRingRef.current || !innerRef.current) return;

    if (!reducedMotion) {
      groupRef.current.rotation.y += delta * 0.06;
      groupRef.current.rotation.x += delta * 0.02;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;

      innerRef.current.rotation.y -= delta * 0.2;
      innerRef.current.rotation.z += delta * 0.06;

      innerRingRef.current.rotation.z -= delta * 0.12;
      innerRingRef.current.rotation.x += delta * 0.04;
    }

    const targetX = active ? pointer.x * 0.10 : 0;
    const targetY = active ? pointer.y * 0.06 : 0;

    outerRef.current.rotation.x += (targetY - outerRef.current.rotation.x) * 0.04;
    outerRef.current.rotation.y += (targetX - outerRef.current.rotation.y) * 0.04;

    const targetScale = active ? 1.012 : 1.0;
    const currentScale = outerRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.04;
    outerRef.current.scale.setScalar(newScale);
  });

  const accentGeometry = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), []);

  return (
    <group ref={outerRef}>
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

        <mesh ref={innerRingRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.55, 0.006, 16, 80]} />
          <meshStandardMaterial
            color="#0A0F17"
            roughness={0.35}
            metalness={0.55}
            emissive="#18F0FF"
            emissiveIntensity={0.08}
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
    </group>
  );
}
