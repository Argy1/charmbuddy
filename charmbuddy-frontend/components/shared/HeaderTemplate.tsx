"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { useAuth } from "@/lib/auth-context";
import { cinematicEase, durations } from "@/lib/motion";
import { routes } from "@/lib/routes";

export default function HeaderTemplate() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const accountHref = isLoggedIn ? routes.profile : routes.login;

  const isNavActive = (href: string) => {
    if (href === routes.home) {
      return pathname === routes.home;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navClass = (href: string) =>
    `flex h-[45px] items-center justify-center rounded-[10px] px-[16px] py-[8px] transition-colors ${
      isNavActive(href) ? "border border-white bg-[#8798ff]" : ""
    }`;

  const navTextClass = (href: string) =>
    `font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] ${
      isNavActive(href) ? "text-white" : "text-black"
    }`;

  const actionClass = (href: string) =>
    `flex h-[38px] w-[38px] items-center justify-center rounded-[10px] transition-colors ${
      isNavActive(href) ? "border border-white bg-[#8798ff]" : ""
    }`;

  return (
    <div className="relative w-full">
      <header className="backdrop-blur-[1px] bg-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.6)] border-solid flex h-[80px] items-center justify-between rounded-[50px] w-full">
        <Link className="ml-[8px] flex h-[64px] w-[112px] items-center justify-center rounded-[10px] transition-colors" href={routes.home}>
          <AppImage alt="Charmbuddy logo" className="h-[60px] w-[96px] object-contain" height={60} src="/home/header-logo.png" width={96} />
        </Link>

        <nav className="hidden h-[45px] w-[363px] items-center gap-[10px] xl:flex">
          <Link className={`${navClass(routes.faq)} w-[79px]`} href={routes.faq}>
            <span className={navTextClass(routes.faq)}>FAQ</span>
          </Link>
          <Link className={`${navClass(routes.catalogue)} w-[161px]`} href={routes.catalogue}>
            <span className={navTextClass(routes.catalogue)}>Catalogue</span>
          </Link>
          <Link className={`${navClass(routes.about)} w-[150px]`} href={routes.about}>
            <span className={navTextClass(routes.about)}>About Us</span>
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-[10px] pr-[12px]">
          <motion.button
            aria-expanded={mobileMenuOpen}
            aria-haspopup="menu"
            aria-label="Open menu"
            className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] transition-colors xl:hidden ${
              mobileMenuOpen ? "border border-white bg-[#8798ff]" : ""
            }`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            type="button"
          >
            <span className="flex flex-col items-center gap-[4px]">
              <span className="h-[2px] w-[16px] rounded-full bg-black" />
              <span className="h-[2px] w-[16px] rounded-full bg-black" />
              <span className="h-[2px] w-[16px] rounded-full bg-black" />
            </span>
          </motion.button>

          <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }} whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}>
            <Link className={actionClass(routes.search)} href={routes.search}>
              <AppImage alt="" className="h-[20px] w-[20px] object-contain" height={20} src="/home/header-search.svg" width={20} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }} whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}>
            <Link className={actionClass(routes.cart)} href={routes.cart}>
              <AppImage alt="" className="h-[20px] w-[20px] object-contain" height={20} src="/home/header-cart.svg" width={20} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }} whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}>
            <Link className={actionClass(routes.profile)} href={accountHref}>
              <AppImage alt="" className="h-[20px] w-[20px] object-contain" height={20} src="/home/header-profile.svg" width={20} />
            </Link>
          </motion.div>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {mobileMenuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="absolute left-0 top-[92px] z-[40] w-full rounded-[22px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.7)] p-[10px] backdrop-blur-[8px] xl:hidden"
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10, filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)" }}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -16, filter: prefersReducedMotion ? "blur(0px)" : "blur(6px)" }}
            transition={{ duration: prefersReducedMotion ? durations.fast : durations.normal, ease: cinematicEase }}
          >
            <div className="flex flex-col gap-[8px]">
              <Link className={navClass(routes.faq)} href={routes.faq} onClick={() => setMobileMenuOpen(false)}>
                <span className={navTextClass(routes.faq)}>FAQ</span>
              </Link>
              <Link className={navClass(routes.catalogue)} href={routes.catalogue} onClick={() => setMobileMenuOpen(false)}>
                <span className={navTextClass(routes.catalogue)}>Catalogue</span>
              </Link>
              <Link className={navClass(routes.about)} href={routes.about} onClick={() => setMobileMenuOpen(false)}>
                <span className={navTextClass(routes.about)}>About Us</span>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
