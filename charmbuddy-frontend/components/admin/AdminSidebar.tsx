"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";

type AdminSidebarProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

const items = [
  { href: routes.admin.overview, label: "Overview", icon: "OV" },
  { href: routes.admin.products, label: "Products", icon: "PR" },
  { href: routes.admin.categories, label: "Categories", icon: "CT" },
  { href: routes.admin.vouchers, label: "Vouchers", icon: "VC" },
  { href: routes.admin.faqs, label: "FAQs", icon: "FQ" },
  { href: routes.admin.content, label: "Content", icon: "CM" },
  { href: routes.admin.orderStatuses, label: "Order Statuses", icon: "OS" },
  { href: routes.admin.reports, label: "Reports", icon: "RP" },
  { href: routes.admin.inventory, label: "Inventory", icon: "IV" },
  { href: routes.admin.orders, label: "Orders", icon: "OR" },
  { href: routes.admin.payments, label: "Payments", icon: "PM" },
];

export default function AdminSidebar({ compact = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-full rounded-[22px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.5)] p-[12px] backdrop-blur-[8px]">
      <div className="flex h-full flex-col gap-[10px]">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              className={`flex min-h-[46px] items-center rounded-[12px] px-[12px] py-[8px] transition-colors ${
                active ? "border border-white bg-[#8798ff] text-white" : "bg-white/60 text-black hover:bg-white"
              }`}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <span className={`mr-[10px] inline-flex h-[24px] w-[24px] items-center justify-center rounded-[8px] text-[11px] font-[700] ${active ? "bg-white/20" : "bg-[#8798ff]/20"}`}>
                {item.icon}
              </span>
              <span className={`font-[var(--font-satoshi)] text-[16px] tracking-[1.2px] ${compact ? "hidden xl:inline" : "inline"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
