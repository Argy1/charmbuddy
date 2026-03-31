"use client";

import { useEffect, useState } from "react";

import FAQAccordion, { type FAQItem } from "@/components/faq/FAQAccordion";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { listFaqsApi } from "@/lib/api/faqs";

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadFaqs = async () => {
      try {
        const response = await listFaqsApi();
        if (!mounted) {
          return;
        }

        setFaqItems(response.data.map((faq) => ({
          id: String(faq.id),
          question: faq.question,
          answer: faq.answer,
        })));
        setLoadError(null);
      } catch {
        if (!mounted) {
          return;
        }
        setLoadError("FAQ belum dapat dimuat saat ini.");
        setFaqItems([]);
      }
    };

    void loadFaqs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-32.63775195789573deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        heightClass="h-[70vh]"
        minHeightClass="min-h-[720px]"
        noiseUrl="/faq/bg-noise.png"
      />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col px-[16px] pb-[48px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal className="mx-auto mt-[32px] w-full max-w-[1192px] xl:mt-[71px]">
          <h1 className="page-title text-center text-black">
            <span className="font-[var(--font-satoshi)] font-bold">Your Guide to </span>
            <span className="font-[var(--font-fanlste)] italic">Blooming</span>
          </h1>

          <div className="mt-[32px]">
            {faqItems.length > 0 ? <FAQAccordion defaultOpenIds={[faqItems[0]?.id ?? "1"]} items={faqItems} /> : null}
            {faqItems.length === 0 ? (
              <div className="rounded-[16px] border border-black/15 bg-white/70 px-[16px] py-[20px] text-center">
                <p className="font-[var(--font-satoshi)] text-[16px] text-black/70">
                  {loadError ?? "Belum ada FAQ yang dipublikasikan."}
                </p>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
