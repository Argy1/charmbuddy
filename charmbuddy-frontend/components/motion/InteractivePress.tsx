"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type InteractivePressProps = {
  children: ReactNode;
  hoverScale?: number;
  tapScale?: number;
  hoverY?: number;
  className?: string;
};

export default function InteractivePress({
  children,
  hoverScale = 1.05,
  tapScale = 0.96,
  hoverY = -2,
  className,
}: InteractivePressProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion ? undefined : { scale: hoverScale, y: hoverY }}
      whileTap={prefersReducedMotion ? undefined : { scale: tapScale }}
    >
      {children}
    </motion.div>
  );
}
