"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

type AdminTopbarProps = {
  title: string;
  onMenuClick: () => void;
};

export default function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    void router.replace(routes.login);
  };

  return (
    <header className="flex min-h-[72px] w-full items-center justify-between rounded-[20px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.55)] px-[14px] py-[10px] backdrop-blur-[8px] md:px-[20px]">
      <div className="flex items-center gap-[10px]">
        <motion.button
          className="grid h-[40px] w-[40px] place-items-center rounded-[10px] bg-white/80 md:hidden"
          onClick={onMenuClick}
          type="button"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        >
          <span className="space-y-[4px]">
            <span className="block h-[2px] w-[16px] rounded bg-black" />
            <span className="block h-[2px] w-[16px] rounded bg-black" />
            <span className="block h-[2px] w-[16px] rounded bg-black" />
          </span>
        </motion.button>
        <h1 className="font-[var(--font-fanlste)] text-[clamp(28px,6vw,42px)] leading-[1] tracking-[1.8px]">{title}</h1>
      </div>

      <div className="flex items-center gap-[8px] md:gap-[12px]">
        <div className="hidden rounded-[12px] bg-white/70 px-[12px] py-[8px] md:block">
          <p className="font-[var(--font-satoshi)] text-[14px] tracking-[1px] text-black/70">Signed in as</p>
          <p className="font-[var(--font-satoshi)] text-[16px] font-[700] tracking-[1px] text-black">{user?.name ?? "Admin"}</p>
        </div>
        <motion.button
          className="rounded-[10px] bg-black px-[12px] py-[8px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-white md:px-[16px]"
          onClick={() => void handleLogout()}
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        >
          Logout
        </motion.button>
      </div>
    </header>
  );
}

