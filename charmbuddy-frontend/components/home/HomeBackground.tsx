"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HomeBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden xl:block">
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 18, -10, 0],
                y: [0, -14, 8, 0],
              }
        }
        className="absolute inset-x-[-22%] bottom-[-140px] h-[58vh] min-h-[420px] blur-[250px]"
        style={{ backgroundImage: "linear-gradient(-19.70776034908758deg, rgb(135, 152, 255) 49.351%, rgb(165, 186, 255) 51.842%)" }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: [0.72, 0.82, 0.72], y: [0, -8, 0] }}
        className="absolute inset-x-0 bottom-[-80px] h-[52vh] min-h-[360px] -scale-y-100 bg-top-left bg-[length:1472px_1472px] mix-blend-soft-light"
        style={{ backgroundImage: "url('/home/bg-noise-footer.png')" }}
        transition={{ duration: 13, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  );
}
