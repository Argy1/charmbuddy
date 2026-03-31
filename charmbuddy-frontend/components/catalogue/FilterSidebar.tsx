"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { listCategoriesApi } from "@/lib/api/categories";
import { springs } from "@/lib/motion";
import type { Category } from "@/lib/api/types";

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
      className={`${mobile ? "w-full h-auto" : "h-[694px] w-[283px]"} rounded-[20px] border border-black bg-[rgba(255,255,255,0.4)] backdrop-blur-[12.6px] px-[14px] py-[37px]`}
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20, filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)" }}
      transition={prefersReducedMotion ? { duration: 0.2 } : springs.soft}
      viewport={{ amount: 0.4, once: true }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    >
      <div className={`${mobile ? "h-auto" : "h-[606px]"} w-[255px] max-w-full flex flex-col gap-[15px]`}>
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
          <div className="flex w-[199px] flex-col gap-[22px]">
            <div className="flex items-center gap-[17px]">
              <p className="font-[var(--font-satoshi)] text-[24px] font-[700] text-black">Categories</p>
              <AppImage alt="Arrow" className="h-[30px] w-[30px]" height={30} src="/catalogue/icon-arrow-down.svg" width={30} />
            </div>
            <div className="flex h-[163px] flex-col justify-center gap-[11px]">
              <CategoryRow
                key="all-categories"
                label="All Categories"
                onClick={() => onChange({ categoryId: null })}
                selected={filters.categoryId === null}
              />
              {categories.slice(0, 5).map((category) => (
                <CategoryRow
                  key={category.id}
                  label={category.name}
                  onClick={() => onChange({ categoryId: category.id })}
                  selected={filters.categoryId === category.id}
                />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-[30px]">
            <div className="flex items-center gap-[10px]">
              <p className="font-[var(--font-satoshi)] text-[24px] font-[700] text-black">Price Range</p>
              <AppImage alt="Arrow" className="h-[30px] w-[30px]" height={30} src="/catalogue/icon-arrow-down.svg" width={30} />
            </div>

            <div className="flex w-[255px] max-w-full flex-col gap-[26px]">
              <div className="relative h-[45px] w-full">
                <div className="absolute left-[63.775px] top-0 h-[16px] w-[16px] rounded-[100px] bg-[#705cb2]" />
                <div className="absolute left-[239.2px] top-0 h-[16px] w-[16px] rounded-[100px] bg-[#705cb2]" />
                <div className="absolute left-0 top-[5px] h-[6px] w-[255px] rounded-[999px] bg-[rgba(112,92,178,0.2)]" />
                <div className="absolute left-[71.775px] top-[5px] h-[6px] w-[175.425px] rounded-[999px] bg-[#705cb2]" />
                <div className="absolute left-0 top-[25px] flex w-full items-center justify-between text-[14px] font-[500] text-black">
                  <span>${filters.minPrice ?? 0}</span>
                  <span>${filters.maxPrice ?? 0}</span>
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
                    onChange({ minPrice: Number.isFinite(parsed) ? parsed : null });
                  }}
                  placeholder="Min price"
                  value={filters.minPrice ?? ""}
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
                    onChange({ maxPrice: Number.isFinite(parsed) ? parsed : null });
                  }}
                  placeholder="Max price"
                  value={filters.maxPrice ?? ""}
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
