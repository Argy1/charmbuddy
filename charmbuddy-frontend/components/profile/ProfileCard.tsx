"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

export default function ProfileCard() {
  const { user, isLoggedIn, logout } = useAuth();
  const displayName = user?.name ?? "Guest User";
  const displayEmail = user?.email ?? "guest@bloomy.com";
  const username = displayEmail.split("@")[0];

  return (
    <Reveal className="w-full">
      <h2 className="font-[var(--font-satoshi)] text-[clamp(34px,6vw,48px)] font-normal leading-[normal] tracking-[7.2px] text-black">Profile</h2>

      <motion.div className="mt-[15px] w-full rounded-[20px] border border-black bg-white p-[16px] xl:min-h-[236px] xl:max-w-[697px] xl:p-[13px_22.5px]" whileHover={{ y: -3 }}>
        <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start">
          <div className="mx-auto h-[190px] w-[190px] shrink-0 sm:mx-0">
            <AppImage alt="Avatar" className="h-[190px] w-[190px] rounded-full object-cover" height={190} src="/profile/avatar.png" width={190} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-[12px] sm:min-h-[195px]">
            <div>
              <p className="break-words font-[var(--font-satoshi)] text-[clamp(30px,5vw,48px)] font-normal leading-[normal] tracking-[4px] xl:tracking-[7.2px] text-black">
                {displayName}
              </p>
              <p className="mt-[2px] break-words font-[var(--font-satoshi)] text-[clamp(18px,3vw,24px)] font-normal leading-[normal] tracking-[2px] xl:tracking-[3.6px] text-black">
                {username}
              </p>
              <p className="mt-[2px] break-all font-[var(--font-satoshi)] text-[clamp(16px,2.8vw,24px)] font-normal leading-[normal] tracking-[1px] xl:tracking-[3.6px] text-black">
                {displayEmail}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-[12px]">
              <InteractivePress>
                <Link className="text-right font-[var(--font-satoshi)] text-[20px] leading-[normal] tracking-[2px] text-[#5900ff] xl:text-[24px] xl:tracking-[3.6px]" href={routes.orderHistory}>
                  {"> Configure"}
                </Link>
              </InteractivePress>
              {isLoggedIn ? (
                <InteractivePress>
                  <button className="font-[var(--font-satoshi)] text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)] xl:text-[20px] xl:tracking-[3px]" onClick={() => void logout()} type="button">
                    Logout
                  </button>
                </InteractivePress>
              ) : (
                <InteractivePress>
                  <Link className="font-[var(--font-satoshi)] text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)] xl:text-[20px] xl:tracking-[3px]" href={routes.login}>
                    Login
                  </Link>
                </InteractivePress>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}
