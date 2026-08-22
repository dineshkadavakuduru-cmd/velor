import type { Variants } from "motion/react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const navHover: Variants = {
  rest: { opacity: 0.6 },
  hover: { opacity: 1 },
};

export const buttonPress: Variants = {
  rest: { scale: 1 },
  press: { scale: 0.97 },
};

export const tickerHover: Variants = {
  rest: { backgroundColor: "rgba(10, 15, 23, 0)" },
  hover: { backgroundColor: "rgba(16, 23, 34, 0.6)" },
};

export const transitions = {
  default: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  spring: { type: "spring" as const, stiffness: 300, damping: 25 },
};
