"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";

const navItems = [
  { href: routes.admin.overview, label: "Overview" },
  { href: routes.admin.products, label: "Products" },
  { href: routes.admin.categories, label: "Categories" },
  { href: routes.admin.vouchers, label: "Vouchers" },
  { href: routes.admin.faqs, label: "FAQs" },
  { href: routes.admin.content, label: "Content" },
  { href: routes.admin.orderStatuses, label: "Statuses" },
  { href: routes.admin.reports, label: "Reports" },
  { href: routes.admin.inventory, label: "Inventory" },
  { href: routes.admin.orders, label: "Orders" },
  { href: routes.admin.payments, label: "Payments" },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[10px] left-1/2 z-[60] w-[calc(100%-20px)] -translate-x-1/2 rounded-[16px] border border-[rgba(255,255,255,0.8)] bg-[rgba(255,255,255,0.9)] p-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-[10px] md:hidden">
      <div className="flex gap-[6px] overflow-x-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              className={`min-w-[82px] rounded-[10px] px-[6px] py-[10px] text-center font-[var(--font-satoshi)] text-[11px] tracking-[0.8px] ${
                active ? "bg-[#8798ff] text-white" : "bg-white/60 text-black"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
