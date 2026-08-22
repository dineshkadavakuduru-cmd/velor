"use client";

import { useThree } from "@react-three/fiber";
import SceneLighting from "./SceneLighting";
import CommandCore from "./CommandCore";

export default function VelorScene() {
  useThree(({ scene }) => {
    scene.background = null;
  });

  return (
    <>
      <SceneLighting />
      <CommandCore />
    </>
  );
}
