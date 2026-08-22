"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneInteraction } from "./SceneInteraction";

const POINT_COUNT = 28;

const POINT_VOLUME = {
  x: 5.5,
  y: 4.0,
  zMin: -6.5,
  zMax: -3.0,
};

const STRUCTURAL_LINES: { start: [number, number, number]; end: [number, number, number] }[] = [
  { start: [-4.0, 2.2, -3.5], end: [4.0, 2.2, -3.5] },
  { start: [-4.0, -1.8, -4.0], end: [4.0, -1.8, -4.0] },
  { start: [2.8, -2.6, -3.8], end: [2.8, 2.6, -3.8] },
  { start: [-2.8, -2.2, -5.0], end: [-2.8, 2.2, -5.0] },
];

const DEPTH_PLANES: { width: number; height: number; z: number; opacity: number }[] = [
  { width: 8.0, height: 6.0, z: -4.5, opacity: 0.025 },
  { width: 6.0, height: 4.5, z: -5.5, opacity: 0.018 },
  { width: 4.0, height: 3.0, z: -6.5, opacity: 0.012 },
];

export default function EnvironmentField() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, active, reducedMotion } = useSceneInteraction();

  const [pointsPosition] = useState(() => {
    const arr = new Float32Array(POINT_COUNT * 3);
    for (let i = 0; i < POINT_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * POINT_VOLUME.x * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * POINT_VOLUME.y * 2;
      arr[i * 3 + 2] = POINT_VOLUME.zMin + Math.random() * (POINT_VOLUME.zMax - POINT_VOLUME.zMin);
    }
    return arr;
  });

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pointsPosition, 3));
    return geo;
  }, [pointsPosition]);

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: "#18F0FF", transparent: true, opacity: 0.045, depthWrite: false }), []);

  const lineGeometries = useMemo(() => {
    return STRUCTURAL_LINES.map(({ start, end }) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
      ]);
      return geo;
    });
  }, []);

  const lineObjects = useMemo(() => {
    return lineGeometries.map((geo) => new THREE.Line(geo, lineMaterial));
  }, [lineGeometries, lineMaterial]);

  const planeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#18F0FF",
      transparent: true,
      opacity: 0.018,
      depthWrite: false,
    });
  }, []);

  const planeEdgesMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({ color: "#18F0FF", transparent: true, opacity: 0.06, depthWrite: false });
  }, []);

  const depthPlanes = useMemo(() => {
    return DEPTH_PLANES.map(({ width, height, z, opacity }) => {
      const geo = new THREE.PlaneGeometry(width, height);
      const material = planeMaterial.clone();
      material.opacity = opacity;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        planeEdgesMaterial.clone()
      );
      return { geo, material, edges, z };
    });
  }, [planeMaterial, planeEdgesMaterial]);

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;
    if (active) {
      const targetX = pointer.x * 0.012;
      const targetY = pointer.y * 0.007;
      groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.02;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.02;
    } else {
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.02;
      groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#18F0FF"
          size={0.014}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </points>

      {lineObjects.map((obj, i) => (
        <primitive key={`line-${i}`} object={obj} />
      ))}

      {depthPlanes.map((plane, i) => (
        <mesh
          key={`plane-${i}`}
          geometry={plane.geo}
          material={plane.material}
          position={[0, 0, plane.z]}
        />
      ))}
      {depthPlanes.map((plane, i) => (
        <primitive key={`edges-${i}`} object={plane.edges} position={[0, 0, DEPTH_PLANES[i].z]} />
      ))}
    </group>
  );
}
