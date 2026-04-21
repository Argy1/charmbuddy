"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { listCategoriesApi } from "@/lib/api/categories";
import { springs } from "@/lib/motion";
import type { Category } from "@/lib/api/types";

const PRICE_MIN = 0;
const PRICE_MAX = 300;

export type CatalogueFilterState = {
  search: string;
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
};

type FilterSidebarProps = {
  mobile?: boolean;
  filters: CatalogueFilterState;
  onChange: (next: Partial<CatalogueFilterState>) => void;
  onReset: () => void;
};

function CategoryRow({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button className="flex items-center gap-[16px] text-left" onClick={onClick} type="button">
      <AppImage alt="Category" className="h-[20px] w-[20px]" height={20} src={selected ? "/catalogue/radio-on.svg" : "/catalogue/radio-off.svg"} width={20} />
      <p className="font-[var(--font-satoshi)] text-[16px] font-[500] leading-[normal] text-black text-center whitespace-nowrap">{label}</p>
    </button>
  );
}

function QuickButton({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button className={`h-[32px] w-[100px] rounded-[8px] border-[0.8px] px-[12.8px] py-[0.8px] ${active ? "border-black bg-[rgba(149,178,254,0.5)]" : "border-[rgba(0,0,0,0.1)] bg-white"}`} onClick={onClick} type="button">
      <span className="font-[var(--font-satoshi)] text-[12px] font-[500] leading-[16px] text-[#0a0a0a]">{label}</span>
    </button>
  );
}

type FlatCategory = {
  id: number;
  name: string;
};

function flattenCategories(categories: Category[]): FlatCategory[] {
  const flattened: FlatCategory[] = [];
  categories.forEach((category) => {
    flattened.push({ id: category.id, name: category.name });
    category.children?.forEach((child) => flattened.push({ id: child.id, name: child.name }));
  });

  return flattened;
}

export default function FilterSidebar({ mobile = false, filters, onChange, onReset }: FilterSidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const sliderMin = Math.max(PRICE_MIN, Math.min(filters.minPrice ?? PRICE_MIN, filters.maxPrice ?? PRICE_MAX));
  const sliderMax = Math.min(PRICE_MAX, Math.max(filters.maxPrice ?? PRICE_MAX, filters.minPrice ?? PRICE_MIN));
  const rangePercentStart = ((sliderMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rangePercentEnd = ((sliderMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await listCategoriesApi();
        if (!isMounted) {
          return;
        }
        setCategories(flattenCategories(response.data).slice(0, 8));
      } catch {
        setCategories([
          { id: 1, name: "Necklace" },
          { id: 2, name: "Bracelet" },
          { id: 3, name: "Bag Charm" },
          { id: 4, name: "Phonestrap" },
          { id: 5, name: "Crochet Stuff" },
        ]);
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.aside
      className={`${mobile ? "w-full" : "w-[283px] min-h-[694px]"} rounded-[20px] border border-black bg-[rgba(255,255,255,0.4)] backdrop-blur-[12.6px] px-[14px] py-[37px]`}
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20, filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)" }}
      transition={prefersReducedMotion ? { duration: 0.2 } : springs.soft}
      viewport={{ amount: 0.4, once: true }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    >
      <div className="flex w-[255px] max-w-full flex-col gap-[15px]">
        <div className="flex w-[243px] max-w-full flex-col gap-[22px]">
          <div className="flex w-full items-center gap-[66px]">
            <p className="font-[var(--font-satoshi)] text-[24px] font-[900] tracking-[2.4px] text-black">Filters</p>
            <button className="rounded-[10px] border border-black px-[16px] py-[8px]" onClick={onReset} type="button">
              <span className="font-[var(--font-satoshi)] text-[18px] font-[700] tracking-[1.8px] text-black">Reset</span>
            </button>
          </div>
          <AppImage alt="Divider" className="h-[1px] w-full" height={1} src="/catalogue/line-1.svg" width={243} />
        </div>

        <div className="flex h-[38px] w-[243px] max-w-full items-center justify-between rounded-[20px] bg-[#705cb2] px-[12px] py-[8px]">
          <input
            className="w-full bg-transparent pr-[8px] font-[var(--font-satoshi)] text-[14px] font-[500] tracking-[1.2px] text-white outline-none placeholder:text-white/70"
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search product..."
            value={filters.search}
          />
          <AppImage alt="Search" className="h-[20px] w-[20px]" height={20} src="/catalogue/icon-search-small.svg" width={20} />
        </div>

        <div className="flex w-full flex-col gap-[25px]">
          <div className="flex w-[199px] flex-col gap-[18px]">
            <button className="flex items-center gap-[10px]" onClick={() => setCategoryOpen((prev) => !prev)} type="button">
              <p className="font-[var(--font-satoshi)] text-[22px] font-[700] text-black">Categories</p>
              <AppImage
                alt="Toggle categories"
                className={`h-[26px] w-[26px] transition-transform ${categoryOpen ? "" : "-rotate-90"}`}
                height={26}
                src="/catalogue/icon-arrow-down.svg"
                width={26}
              />
            </button>
            <div className={`${categoryOpen ? "flex" : "hidden"} flex-col gap-[11px]`}>
              <CategoryRow label="All Categories" onClick={() => onChange({ categoryId: null })} selected={filters.categoryId === null} />
              {categories.slice(0, 5).map((category) => (
                <CategoryRow key={category.id} label={category.name} onClick={() => onChange({ categoryId: category.id })} selected={filters.categoryId === category.id} />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-[20px]">
            <button className="flex items-center gap-[10px]" onClick={() => setPriceOpen((prev) => !prev)} type="button">
              <p className="font-[var(--font-satoshi)] text-[22px] font-[700] text-black">Price Range</p>
              <AppImage
                alt="Toggle price range"
                className={`h-[26px] w-[26px] transition-transform ${priceOpen ? "" : "-rotate-90"}`}
                height={26}
                src="/catalogue/icon-arrow-down.svg"
                width={26}
              />
            </button>

            <div className={`${priceOpen ? "flex" : "hidden"} w-[255px] max-w-full flex-col gap-[26px]`}>
              <div className="relative h-[54px] w-full">
                <div className="absolute left-0 top-[9px] h-[6px] w-full rounded-[999px] bg-[rgba(112,92,178,0.2)]" />
                <div
                  className="absolute top-[9px] h-[6px] rounded-[999px] bg-[#705cb2]"
                  style={{ left: `${rangePercentStart}%`, right: `${100 - rangePercentEnd}%` }}
                />
                <input
                  aria-label="Minimum price"
                  className="absolute left-0 top-0 h-[24px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#705cb2] [&::-webkit-slider-thumb]:cursor-pointer"
                  max={PRICE_MAX}
                  min={PRICE_MIN}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), sliderMax);
                    onChange({ minPrice: nextMin, maxPrice: sliderMax });
                  }}
                  type="range"
                  value={sliderMin}
                />
                <input
                  aria-label="Maximum price"
                  className="absolute left-0 top-0 h-[24px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#705cb2] [&::-webkit-slider-thumb]:cursor-pointer"
                  max={PRICE_MAX}
                  min={PRICE_MIN}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), sliderMin);
                    onChange({ minPrice: sliderMin, maxPrice: nextMax });
                  }}
                  type="range"
                  value={sliderMax}
                />
                <div className="absolute left-0 top-[32px] flex w-full items-center justify-between text-[14px] font-[500] text-black">
                  <span>${sliderMin}</span>
                  <span>${sliderMax}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[8px]">
                <input
                  className="h-[32px] rounded-[8px] border border-black/15 px-[8px] text-[12px]"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value === "") {
                      onChange({ minPrice: null });
                      return;
                    }
                    const parsed = Number(value);
                    if (!Number.isFinite(parsed)) {
                      onChange({ minPrice: null });
                      return;
                    }
                    const safeMin = Math.max(PRICE_MIN, Math.min(parsed, sliderMax));
                    onChange({ minPrice: safeMin });
                  }}
                  placeholder="Min price"
                  value={sliderMin}
                />
                <input
                  className="h-[32px] rounded-[8px] border border-black/15 px-[8px] text-[12px]"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value === "") {
                      onChange({ maxPrice: null });
                      return;
                    }
                    const parsed = Number(value);
                    if (!Number.isFinite(parsed)) {
                      onChange({ maxPrice: null });
                      return;
                    }
                    const safeMax = Math.min(PRICE_MAX, Math.max(parsed, sliderMin));
                    onChange({ maxPrice: safeMax });
                  }}
                  placeholder="Max price"
                  value={sliderMax}
                />
              </div>

              <div className="flex w-[240px] flex-col gap-[8px]">
                <p className="font-[var(--font-satoshi)] text-[14px] font-[500] leading-[20px] text-[#0a0a0a]">Quick Select:</p>
                <div className="grid grid-cols-2 gap-y-[8px] gap-x-[40px]">
                  <QuickButton active={filters.minPrice === null && filters.maxPrice === 50} label="Under $50" onClick={() => onChange({ minPrice: null, maxPrice: 50 })} />
                  <QuickButton active={filters.minPrice === 50 && filters.maxPrice === 100} label="$50-$100" onClick={() => onChange({ minPrice: 50, maxPrice: 100 })} />
                  <QuickButton active={filters.minPrice === 100 && filters.maxPrice === 150} label="$100-$150" onClick={() => onChange({ minPrice: 100, maxPrice: 150 })} />
                  <QuickButton active={filters.minPrice === 150 && filters.maxPrice === null} label="$150+" onClick={() => onChange({ minPrice: 150, maxPrice: null })} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
