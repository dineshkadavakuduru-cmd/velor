"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

const secondaryVariants: Variants = {
  rest: { opacity: 0.6 },
  hover: { opacity: 1 },
  tap: { opacity: 0.8 },
};

export default function HeroActions({
  primaryHref = "#explore",
  secondaryHref = "#matches",
}: {
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      data-hero-actions
    >
      <motion.a
        href={primaryHref}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-text-primary text-background font-mono text-xs font-medium tracking-[0.2em]"
      >
        EXPLORE LIVE
      </motion.a>

      <motion.a
        href={secondaryHref}
        variants={secondaryVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="inline-flex items-center gap-2 px-1 font-mono text-xs tracking-[0.15em] text-text-secondary hover:text-text-primary"
      >
        <span className="w-4 h-px bg-text-secondary" />
        VIEW MATCHES
      </motion.a>
    </div>
  );
}
