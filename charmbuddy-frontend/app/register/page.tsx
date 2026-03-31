"use client";

import AuthCard from "@/components/auth/AuthCard";
import { motion, useReducedMotion } from "framer-motion";

export default function RegisterPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f2feea]">
      <motion.img
        alt="Gradient"
        animate={prefersReducedMotion ? undefined : { x: [0, -12, 8, 0], y: [0, -10, 6, 0], scale: [1, 1.02, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
        src="/auth/gradient-register.png"
        transition={{ duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-[20px] py-[24px] sm:px-[24px]">
        <AuthCard mode="register" />
      </div>
    </div>
  );
}
