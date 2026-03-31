"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminBottomNav from "@/components/admin/mobile/AdminBottomNav";
import { routes } from "@/lib/routes";
import { useRequireAdmin } from "@/lib/use-require-admin";

const titleMap: Record<string, string> = {
  [routes.admin.overview]: "Admin Overview",
  [routes.admin.products]: "Manage Products",
  [routes.admin.orders]: "Manage Orders",
  [routes.admin.payments]: "Manage Payments",
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const isAllowed = useRequireAdmin();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAllowed) {
    return null;
  }

  const title = titleMap[pathname] ?? "Admin";

  return (
    <div className="bloo-bg min-h-screen pb-[80px] md:pb-0">
      <div className="mx-auto w-full max-w-[1440px] px-[12px] pb-[24px] pt-[16px] md:px-[20px] md:pt-[24px] xl:px-[40px]">
        <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} title={title} />

        <div className="mt-[14px] grid grid-cols-1 gap-[12px] md:grid-cols-[96px_minmax(0,1fr)] md:gap-[14px] xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-[18px]">
          <div className="hidden md:block">
            <AdminSidebar compact />
          </div>
          <main className="min-w-0 rounded-[22px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.55)] p-[12px] backdrop-blur-[9px] md:p-[16px] xl:p-[20px]">
            {children}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] bg-black/35 p-[14px] md:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="h-full w-[min(300px,84vw)] rounded-[18px] border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.92)] p-[10px] backdrop-blur-[10px]"
              exit={{ x: prefersReducedMotion ? 0 : -30, opacity: 0 }}
              initial={{ x: prefersReducedMotion ? 0 : -40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.32 }}
            >
              <AdminSidebar onNavigate={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AdminBottomNav />
    </div>
  );
}

