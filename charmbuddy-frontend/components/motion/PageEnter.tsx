"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type PageEnterProps = {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
};

export default function PageEnter({ children, delay = 0, stagger = 0.14, className, once = true }: PageEnterProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      className={className}
      initial="hidden"
      transition={{ delayChildren: delay, staggerChildren: prefersReducedMotion ? 0 : stagger }}
      variants={{
        hidden: {},
        visible: {},
      }}
      viewport={{ amount: 0.2, once }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}
