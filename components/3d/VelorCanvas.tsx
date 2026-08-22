"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import VelorScene from "./VelorScene";

export default function VelorCanvas() {
  return (
    <div className="absolute inset-0">
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
      </Canvas>
    </div>
  );
}
