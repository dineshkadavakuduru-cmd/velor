"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { League } from "@/lib/types/sports";

interface LeagueBadgeProps {
  league: League;
  href?: string;
}

export default function LeagueBadge({ league, href }: LeagueBadgeProps) {
  const [imgError, setImgError] = useState(false);

  const content = (
    <div className="flex items-center gap-2">
      {league.logo && !imgError && (
        <Image
          src={league.logo}
          alt={`${league.name} logo`}
          width={16}
          height={16}
          className="h-4 w-4 object-contain opacity-80"
          onError={() => setImgError(true)}
        />
      )}
      <span className="technical-label">{league.name.toUpperCase()}</span>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block hover:opacity-80 transition-opacity">
      {content}
    </Link>
  );
}
