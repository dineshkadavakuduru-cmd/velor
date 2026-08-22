"use client";

import { useThree } from "@react-three/fiber";

export default function VelorScene() {
  useThree(({ scene }) => {
    scene.background = null;
  });

  return null;
}
