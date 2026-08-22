"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneInteraction } from "./SceneInteraction";

const PRIMARY_MARKER_COUNT = 4;
const SECONDARY_MARKER_COUNT = 3;
const PRIMARY_TELEMETRY_COUNT = 2;
const SECONDARY_TELEMETRY_COUNT = 1;

export default function DataOrbit() {
  const primaryRef = useRef<THREE.Group>(null);
  const primaryOuterRef = useRef<THREE.Group>(null);
  const primaryTelemetryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);
  const secondaryOuterRef = useRef<THREE.Group>(null);
  const secondaryTelemetryRef = useRef<THREE.Group>(null);
  const { pointer, active, reducedMotion } = useSceneInteraction();

  useFrame((_, delta) => {
    if (reducedMotion) return;

    if (primaryRef.current) {
      primaryRef.current.rotation.y += delta * 0.045;
      primaryRef.current.rotation.x += delta * 0.012;
    }
    if (secondaryRef.current) {
      secondaryRef.current.rotation.y -= delta * 0.05;
      secondaryRef.current.rotation.z += delta * 0.013;
    }
    if (primaryTelemetryRef.current) {
      primaryTelemetryRef.current.rotation.y += delta * 0.07;
    }
    if (secondaryTelemetryRef.current) {
      secondaryTelemetryRef.current.rotation.y -= delta * 0.065;
    }

    if (primaryOuterRef.current) {
      const targetX = active ? pointer.x * 0.35 : 0;
      const targetY = active ? pointer.y * 0.35 : 0;
      primaryOuterRef.current.rotation.x += (targetY - primaryOuterRef.current.rotation.x) * 0.05;
      primaryOuterRef.current.rotation.y += (targetX - primaryOuterRef.current.rotation.y) * 0.05;
    }

    if (secondaryOuterRef.current) {
      const targetX = active ? pointer.x * -0.2 : 0;
      const targetY = active ? pointer.y * -0.2 : 0;
      secondaryOuterRef.current.rotation.x += (targetY - secondaryOuterRef.current.rotation.x) * 0.05;
      secondaryOuterRef.current.rotation.y += (targetX - secondaryOuterRef.current.rotation.y) * 0.05;
    }
  });

  const markerGeometry = useMemo(() => new THREE.BoxGeometry(0.04, 0.04, 0.04), []);
  const secondaryMarkerGeometry = useMemo(() => new THREE.BoxGeometry(0.03, 0.03, 0.03), []);
  const telemetryGeometry = useMemo(() => new THREE.BoxGeometry(0.022, 0.022, 0.022), []);
  const secondaryTelemetryGeometry = useMemo(() => new THREE.BoxGeometry(0.018, 0.018, 0.018), []);

  const primaryMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i < PRIMARY_MARKER_COUNT; i++) {
      const angle = (i / PRIMARY_MARKER_COUNT) * Math.PI * 2;
      markers.push({
        position: [Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0] as [number, number, number],
        key: i,
      });
    }
    return markers;
  }, []);

  const secondaryMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i < SECONDARY_MARKER_COUNT; i++) {
      const angle = (i / SECONDARY_MARKER_COUNT) * Math.PI * 2 + 0.5;
      markers.push({
        position: [Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0] as [number, number, number],
        key: i,
      });
    }
    return markers;
  }, []);

  const primaryTelemetryNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < PRIMARY_TELEMETRY_COUNT; i++) {
      const angle = (i / PRIMARY_TELEMETRY_COUNT) * Math.PI * 2 + 0.8;
      nodes.push({
        position: [Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0] as [number, number, number],
        key: i,
      });
    }
    return nodes;
  }, []);

  const secondaryTelemetryNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < SECONDARY_TELEMETRY_COUNT; i++) {
      const angle = (i / SECONDARY_TELEMETRY_COUNT) * Math.PI * 2 + 1.5;
      nodes.push({
        position: [Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0.06] as [number, number, number],
        key: i,
      });
    }
    return nodes;
  }, []);

  return (
    <group>
      <group ref={primaryOuterRef}>
        <group ref={primaryRef} rotation={[0.3, 0, 0.2]}>
          <mesh>
            <torusGeometry args={[1.6, 0.008, 16, 120]} />
            <meshStandardMaterial
              color="#18F0FF"
              roughness={0.3}
              metalness={0.5}
              emissive="#18F0FF"
              emissiveIntensity={0.15}
            />
          </mesh>
          {primaryMarkers.map(({ position, key }) => (
            <mesh key={key} position={position} geometry={markerGeometry}>
              <meshStandardMaterial
                color="#18F0FF"
                roughness={0.3}
                metalness={0.5}
                emissive="#18F0FF"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
          <group ref={primaryTelemetryRef}>
            {primaryTelemetryNodes.map(({ position, key }) => (
              <mesh key={key} position={position} geometry={telemetryGeometry}>
                <meshStandardMaterial
                  color="#18F0FF"
                  roughness={0.3}
                  metalness={0.5}
                  emissive="#18F0FF"
                  emissiveIntensity={0.35}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      <group ref={secondaryOuterRef}>
        <group ref={secondaryRef} rotation={[-0.5, 0.3, -0.4]}>
          <mesh>
            <torusGeometry args={[1.2, 0.006, 16, 100]} />
            <meshStandardMaterial
              color="#7A5CFF"
              roughness={0.3}
              metalness={0.5}
              emissive="#7A5CFF"
              emissiveIntensity={0.12}
            />
          </mesh>
          {secondaryMarkers.map(({ position, key }) => (
            <mesh key={key} position={position} geometry={secondaryMarkerGeometry}>
              <meshStandardMaterial
                color="#7A5CFF"
                roughness={0.3}
                metalness={0.5}
                emissive="#7A5CFF"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
          <group ref={secondaryTelemetryRef}>
            {secondaryTelemetryNodes.map(({ position, key }) => (
              <mesh key={key} position={position} geometry={secondaryTelemetryGeometry}>
                <meshStandardMaterial
                  color="#7A5CFF"
                  roughness={0.3}
                  metalness={0.5}
                  emissive="#7A5CFF"
                  emissiveIntensity={0.22}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
