"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import VelorScene from "./VelorScene";
import { SceneInteractionProvider, useSceneInteraction } from "./SceneInteraction";

const cameraTarget = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();

function CameraController() {
  const { pointer, active, reducedMotion } = useSceneInteraction();

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    if (reducedMotion || !active) {
      cameraTarget.set(0, 0, 0);
      cameraPosition.set(0, 0, 8);
    } else {
      cameraTarget.set(pointer.x * 0.04, pointer.y * 0.025, 0);
      cameraPosition.set(pointer.x * 0.03, pointer.y * 0.02, 8);
    }

    camera.position.x += (cameraPosition.x - camera.position.x) * 0.025;
    camera.position.y += (cameraPosition.y - camera.position.y) * 0.025;
    camera.lookAt(cameraTarget);
  });

  return null;
}

export default function VelorCanvas() {
  return (
    <SceneInteractionProvider>
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={(state) => {
          const camera = state.camera as THREE.PerspectiveCamera;
          camera.fov = 50;
          camera.position.set(0, 0, 8);
          camera.updateProjectionMatrix();
        }}
      >
        <VelorScene />
        <CameraController />
      </Canvas>
    </SceneInteractionProvider>
  );
}
