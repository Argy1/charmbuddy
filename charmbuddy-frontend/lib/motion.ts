import type { Transition, Variants } from "framer-motion";

export const cinematicEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const durations = {
  fast: 0.25,
  normal: 0.45,
  long: 0.8,
  cinematic: 1.05,
} as const;

export const springs = {
  soft: { stiffness: 180, damping: 24, mass: 0.95 },
  snappy: { stiffness: 260, damping: 22, mass: 0.8 },
} as const satisfies Record<string, Transition>;

export const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

export const revealItem = (distance = 36): Variants => ({
  hidden: {
    opacity: 0,
    y: distance,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: durations.cinematic,
      ease: cinematicEase,
    },
  },
});
