"use client";

export default function SceneLighting() {
  return (
    <>
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#e0e8ff" />
      <directionalLight position={[-4, -1, -3]} intensity={1.0} color="#8ab4f8" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#7A5CFF" />
    </>
  );
}
