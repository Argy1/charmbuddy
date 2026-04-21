"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cinematicEase, durations } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  once?: boolean;
  className?: string;
};

export default function Reveal({ children, delay = 0, distance = 36, once = true, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : distance, filter: prefersReducedMotion ? "blur(0px)" : "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: prefersReducedMotion ? durations.fast : durations.cinematic,
        delay,
        ease: cinematicEase,
      }}
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
