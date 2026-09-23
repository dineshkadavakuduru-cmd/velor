"use client";

import { useState } from "react";
import Image from "next/image";

interface EntityImageProps {
  src?: string;
  alt: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "h-8 w-8", image: 32, text: "text-[0.55rem]" },
  md: { container: "h-10 w-10", image: 40, text: "text-[0.6rem]" },
  lg: { container: "h-12 w-12", image: 48, text: "text-xs" },
};

export default function EntityImage({
  src,
  alt,
  initials,
  size = "md",
  className = "",
}: EntityImageProps) {
  const [imgError, setImgError] = useState(false);
  const dims = SIZE_MAP[size];

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={alt}
        width={dims.image}
        height={dims.image}
        className={`${dims.container} object-contain opacity-80 shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${dims.container} flex items-center justify-center bg-surface-2 border border-border-subtle text-text-secondary ${dims.text} font-mono tracking-widest shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
