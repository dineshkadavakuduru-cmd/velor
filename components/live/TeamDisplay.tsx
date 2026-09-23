"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/types/sports";

interface TeamDisplayProps {
  team: Team;
  align?: "left" | "right";
  showShortName?: boolean;
  showLogo?: boolean;
  href?: string;
}

export default function TeamDisplay({
  team,
  align = "left",
  showShortName = true,
  showLogo = false,
  href,
}: TeamDisplayProps) {
  const [imgError, setImgError] = useState(false);

  const content = (
    <div
      className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {showLogo && team.logo && !imgError && (
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            width={20}
            height={20}
            className="h-5 w-5 object-contain opacity-80"
            onError={() => setImgError(true)}
          />
        )}
        <span className="font-body text-sm sm:text-base text-text-primary truncate max-w-[200px] sm:max-w-[260px]">
          {team.name}
        </span>
      </div>
      {showShortName && (
        <span className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
          {team.shortName}
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block hover:opacity-80 transition-opacity">
      {content}
    </Link>
  );
}
