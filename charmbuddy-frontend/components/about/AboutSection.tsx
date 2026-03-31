"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import ParallaxY from "@/components/motion/ParallaxY";
import Reveal from "@/components/motion/Reveal";
import { getContentPageApi } from "@/lib/api/content";

export default function AboutSection() {
  const prefersReducedMotion = useReducedMotion();
  const [title, setTitle] = useState("About Us");
  const [body, setBody] = useState(
    "Konten About Us akan segera diperbarui oleh admin.",
  );

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        const response = await getContentPageApi("about-us");
        if (!mounted) {
          return;
        }

        if (response.data.title) {
          setTitle(response.data.title);
        }
        if (response.data.body) {
          setBody(response.data.body);
        }
      } catch {
        // fallback text
      }
    };

    void loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Reveal className="w-full xl:h-[609px] xl:w-[1370px]">
      <h1 className="page-title h-auto w-full text-center text-black xl:h-[116px] xl:w-[1370px]">
        {title}
      </h1>

      <div className="mt-[32px] flex w-full flex-col gap-[24px] md:mt-[40px] md:gap-[28px] xl:mt-[64px] xl:h-[429px] xl:flex-row xl:items-start xl:gap-[54px]">
        <ParallaxY offset={[0, -18]}>
          <motion.img
            alt="Bloom.y"
            className="h-auto w-full object-cover md:max-h-[384.03173828125px] xl:h-[384.03173828125px] xl:w-[457px]"
            src="/about/about-image.png"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          />
        </ParallaxY>

        <div className="w-full rounded-[40px] border border-[rgba(255,255,255,0.39)] bg-[rgba(255,255,255,0.36)] px-[16px] py-[8px] backdrop-blur-[12.9px] xl:h-[429px] xl:w-[859px]">
          <p className="mx-auto w-full text-center font-[var(--font-fanlste)] text-[clamp(30px,4vw,48px)] leading-[1.15] tracking-[clamp(4px,0.5vw,7.2px)] text-[#7600B0] xl:w-[827px]">
            &quot;Will you be my bloo?&quot; type shit
          </p>

          <p className="body-lead mx-auto mt-[16px] w-full font-[var(--font-fanlste)] text-black xl:mt-[22px] xl:w-[824px]">
            {body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
