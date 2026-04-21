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
    <Reveal className="relative w-full xl:w-[1370px]">
      <h1 className="page-title h-auto w-full text-center text-black">
        {title}
      </h1>

      <div className="mt-[32px] flex w-full flex-col gap-[24px] md:mt-[40px] md:gap-[28px] xl:mt-[52px] xl:flex-row xl:items-start xl:gap-[38px]">
        <ParallaxY offset={[0, -18]}>
          <motion.img
            alt="Bloom.y"
            className="h-auto w-full rounded-[24px] object-cover md:max-h-[384px] xl:h-[384px] xl:w-[457px]"
            src="/about/about-image.png"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          />
        </ParallaxY>

        <div className="w-full rounded-[28px] border border-[rgba(255,255,255,0.39)] bg-[rgba(255,255,255,0.42)] px-[18px] py-[16px] backdrop-blur-[12.9px] xl:min-h-[384px] xl:w-[859px] xl:px-[28px] xl:py-[20px]">
          <p className="mx-auto w-full text-center font-[var(--font-fanlste)] text-[clamp(28px,3vw,42px)] leading-[1.15] tracking-[clamp(1.5px,0.3vw,3px)] text-[#5d2f8a] xl:w-[827px]">
            &quot;More than accessories, these are pieces of your story.&quot;
          </p>

          <p className="body-lead mx-auto mt-[16px] w-full text-black xl:mt-[22px] xl:w-[824px]">
            {body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
