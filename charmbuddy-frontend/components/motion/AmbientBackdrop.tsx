"use client";

import { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AmbientBackdropProps = {
  heightClass?: string;
  minHeightClass?: string;
  gradientStyle: CSSProperties;
  noiseUrl: string;
};

export default function AmbientBackdrop({
  heightClass = "h-[72vh]",
  minHeightClass = "min-h-[760px]",
  gradientStyle,
  noiseUrl,
}: AmbientBackdropProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <motion.div
        animate={prefersReducedMotion ? undefined : { x: [0, 12, -8, 0], y: [0, -10, 6, 0] }}
        className={`pointer-events-none absolute left-1/2 top-0 ${heightClass} ${minHeightClass} w-[100vw] min-w-[1200px] -translate-x-1/2 blur-[250px]`}
        style={gradientStyle}
        transition={{ duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: [0.74, 0.86, 0.74], y: [0, -6, 0] }}
        className={`pointer-events-none absolute left-1/2 top-0 ${heightClass} ${minHeightClass} w-[100vw] min-w-[1200px] -translate-x-1/2 bg-center bg-cover mix-blend-soft-light`}
        style={{ backgroundImage: `url('${noiseUrl}')` }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
    </>
  );
}
