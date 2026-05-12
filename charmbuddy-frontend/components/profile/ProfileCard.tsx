"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import EditProfileModal from "@/components/profile/EditProfileModal";
import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { resolveApiAsset } from "@/lib/api/asset";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

export default function ProfileCard() {
  const { user, isLoggedIn, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const displayName = user?.name ?? "Guest User";
  const displayEmail = user?.email ?? "guest@bloomy.com";
  const username = displayEmail.split("@")[0];
  const avatarSrc = resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png");

  return (
    <Reveal className="w-full">
      <h2 className="font-satoshi text-[clamp(34px,6vw,48px)] font-normal leading-[normal] tracking-[7.2px] text-black">Profile</h2>

      <motion.div className="mt-[15px] w-full rounded-[20px] border border-black bg-white p-[16px] xl:min-h-[236px] xl:max-w-[697px] xl:p-[13px_22.5px]" whileHover={{ y: -3 }}>
        <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start">
          <div className="mx-auto h-[140px] w-[140px] shrink-0 sm:mx-0 sm:h-[190px] sm:w-[190px]">
            <AppImage alt="Avatar" className="h-full w-full rounded-full object-cover" height={190} src={avatarSrc} width={190} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-[12px] sm:min-h-[195px]">
            <div>
              <p className="break-words font-satoshi text-[clamp(24px,5vw,48px)] font-normal leading-[normal] tracking-[4px] text-black xl:tracking-[7.2px]">
                {displayName}
              </p>
              <p className="mt-[2px] break-words font-satoshi text-[clamp(16px,3vw,24px)] font-normal leading-[normal] tracking-[2px] text-black xl:tracking-[3.6px]">
                {username}
              </p>
              <p className="mt-[2px] break-all font-satoshi text-[clamp(14px,2.8vw,24px)] font-normal leading-[normal] tracking-[1px] text-black xl:tracking-[3.6px]">
                {displayEmail}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-[12px]">
              <InteractivePress>
                <button
                  className="text-right font-satoshi text-[18px] leading-[normal] tracking-[2px] text-[#5900ff] xl:text-[24px] xl:tracking-[3.6px]"
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  {"> Configure"}
                </button>
              </InteractivePress>
              {isLoggedIn ? (
                <InteractivePress>
                  <button className="font-satoshi text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)] xl:text-[20px] xl:tracking-[3px]" onClick={() => void logout()} type="button">
                    Logout
                  </button>
                </InteractivePress>
              ) : (
                <InteractivePress>
                  <Link className="font-satoshi text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)] xl:text-[20px] xl:tracking-[3px]" href={routes.login}>
                    Login
                  </Link>
                </InteractivePress>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <EditProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </Reveal>
  );
}
