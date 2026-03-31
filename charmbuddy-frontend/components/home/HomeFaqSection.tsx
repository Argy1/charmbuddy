"use client";

import { useEffect, useState } from "react";

import FAQAccordion, { type FAQItem } from "@/components/home/FAQAccordion";
import { listFaqsApi } from "@/lib/api/faqs";

export default function HomeFaqSection() {
  const [items, setItems] = useState<FAQItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadFaqs = async () => {
      try {
        const response = await listFaqsApi();
        if (!mounted) {
          return;
        }

        setItems(response.data.map((faq) => ({
          id: String(faq.id),
          question: faq.question,
          answer: faq.answer,
        })));
      } catch {
        if (!mounted) {
          return;
        }
        setItems([]);
      }
    };

    void loadFaqs();

    return () => {
      mounted = false;
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-[16px] border border-black/15 bg-white/70 px-[16px] py-[20px] text-center">
        <p className="font-[var(--font-satoshi)] text-[15px] text-black/70">Belum ada FAQ yang dipublikasikan.</p>
      </div>
    );
  }

  return <FAQAccordion defaultOpenId={items[0]?.id ?? "q1"} items={items} />;
}
