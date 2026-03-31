"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FilterSidebar, { type CatalogueFilterState } from "@/components/catalogue/FilterSidebar";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import ProductGrid from "@/components/catalogue/ProductGrid";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { useState } from "react";

export default function CataloguePage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogueFilterState>({
    search: "",
    categoryId: null,
    minPrice: null,
    maxPrice: null,
  });
  const prefersReducedMotion = useReducedMotion();

  const handleFilterChange = (next: Partial<CatalogueFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      categoryId: null,
      minPrice: null,
      maxPrice: null,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-36.35516976673699deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        noiseUrl="/catalogue/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[56px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal className="mt-[24px] xl:mt-[30px]">
          <motion.button
            className="mb-[12px] rounded-[12px] border border-black bg-white/70 px-[14px] py-[8px] text-[14px] font-[700] xl:hidden"
            onClick={() => setMobileFilterOpen((v) => !v)}
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            {mobileFilterOpen ? "Hide Filters" : "Show Filters"}
          </motion.button>

          <div className="flex flex-col gap-[20px] xl:flex-row xl:items-start xl:gap-[48px]">
            <AnimatePresence initial={false}>
              {mobileFilterOpen ? (
                <motion.div
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  className="xl:hidden"
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10, filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)" }}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -14, filter: prefersReducedMotion ? "blur(0px)" : "blur(6px)" }}
                  transition={{ duration: prefersReducedMotion ? 0.2 : 0.45 }}
                >
                  <FilterSidebar filters={filters} mobile onChange={handleFilterChange} onReset={resetFilters} />
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="hidden xl:block">
              <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
            </div>
            <div className="min-w-0 flex-1">
              <ProductGrid
                filters={{
                  search: filters.search,
                  category: filters.categoryId ?? undefined,
                  min_price: filters.minPrice ?? undefined,
                  max_price: filters.maxPrice ?? undefined,
                }}
                mobile={false}
              />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
