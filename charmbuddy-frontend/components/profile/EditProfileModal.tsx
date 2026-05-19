"use client";

import { createPortal } from "react-dom";
import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ApiError } from "@/lib/api/client";
import { resolveApiAsset } from "@/lib/api/asset";
import { useAuth } from "@/lib/auth-context";
import AppImage from "@/components/shared/AppImage";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { user, isLoading, updateProfile } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewSrc, setAvatarPreviewSrc] = useState(resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png"));
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect -- Modal form state is intentionally reset when the modal opens and when avatar preview files change. */
  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      setName(user?.name ?? "");
      setAvatarFile(null);
      setAvatarPreviewSrc(resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png"));
      setAvatarInputKey((currentKey) => currentKey + 1);
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordSection(false);
      setError("");
      setSuccess("");
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewSrc(resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png"));
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewSrc(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [avatarFile, user?.avatar_path]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload: { name?: string; current_password?: string; new_password?: string; avatar?: File | null } = {};

    if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();

    if (avatarFile) {
      payload.avatar = avatarFile;
    }

    if (showPasswordSection || newPassword) {
      if (!currentPassword) {
        setError("Password saat ini wajib diisi untuk mengganti password.");
        return;
      }
      if (!newPassword) {
        setError("Password baru wajib diisi.");
        return;
      }
      if (newPassword.length < 8) {
        setError("Password baru minimal 8 karakter.");
        return;
      }
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setError("Tidak ada perubahan yang dilakukan.");
      return;
    }

    try {
      await updateProfile(payload);
      setSuccess("Profil berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setAvatarFile(null);
      setShowPasswordSection(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError("Gagal memperbarui profil. Coba lagi.");
    }
  };

  const displayEmail = user?.email ?? "";
  const username = displayEmail.split("@")[0];
  const displayAvatarSrc = avatarPreviewSrc || resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png");
  const shouldBypassImageOptimization = /^https?:\/\//.test(displayAvatarSrc) || displayAvatarSrc.startsWith("blob:");

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (!file) {
      setAvatarPreviewSrc(resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png"));
    }
  };

  const handleResetAvatar = () => {
    setAvatarFile(null);
    setAvatarPreviewSrc(resolveApiAsset(user?.avatar_path ?? null, "/profile/avatar.png"));
    setAvatarInputKey((currentKey) => currentKey + 1);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-[16px] sm:p-[24px]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={onClose} />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 flex w-full max-w-[480px] flex-col overflow-hidden rounded-[20px] border border-black bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.18)] sm:max-w-none sm:flex-row xl:h-[580px] xl:max-w-[900px]"
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Left panel — profile info (desktop only sidebar) */}
            <div className="hidden flex-col items-center justify-between bg-[#8798ff] p-[40px] sm:flex sm:w-[280px] sm:shrink-0 xl:w-[320px]">
              <div className="flex w-full flex-col items-center gap-[20px]">
                <div className="h-[120px] w-[120px] xl:h-[150px] xl:w-[150px]">
                  <AppImage
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover border-[3px] border-white/60"
                    height={150}
                    src={displayAvatarSrc}
                    unoptimized={shouldBypassImageOptimization}
                    width={150}
                  />
                </div>
                <div className="text-center">
                  <p className="font-satoshi text-[20px] font-bold leading-[normal] tracking-[2px] text-white xl:text-[24px]">
                    {user?.name ?? "—"}
                  </p>
                  <p className="mt-[4px] font-satoshi text-[14px] leading-[normal] tracking-[1.4px] text-white/70">
                    {username}
                  </p>
                  <p className="mt-[2px] break-all font-satoshi text-[13px] leading-[normal] tracking-[1px] text-white/60">
                    {displayEmail}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-[12px] bg-white/10 p-[16px]">
                <p className="font-satoshi text-[12px] font-semibold uppercase tracking-[1.5px] text-white/60">Info</p>
                <p className="mt-[6px] font-satoshi text-[13px] leading-[1.5] text-white/80">
                  Ubah nama dan password akunmu. Email tidak dapat diubah.
                </p>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="flex min-w-0 flex-1 flex-col p-[24px] sm:p-[32px] xl:p-[48px]">
              <div className="mb-[28px] flex items-center justify-between">
                <div>
                  <h2 className="font-satoshi text-[22px] font-bold leading-[normal] tracking-[2px] text-black xl:text-[28px]">
                    Edit Profile
                  </h2>
                  {/* mobile only subtitle */}
                  <p className="mt-[2px] font-satoshi text-[13px] text-black/50 sm:hidden">
                    {displayEmail}
                  </p>
                </div>
                <button
                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                  onClick={onClose}
                  type="button"
                >
                  <span className="text-[22px] leading-none">×</span>
                </button>
              </div>

              <form className="flex flex-1 flex-col gap-[18px]" onSubmit={(e) => void handleSubmit(e)}>
                <div className="flex items-center gap-[14px] rounded-[16px] border border-black/10 bg-black/[0.03] p-[14px]">
                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
                    <AppImage
                      alt="Preview avatar"
                      className="h-full w-full rounded-full object-cover"
                      height={72}
                      src={displayAvatarSrc}
                      unoptimized={shouldBypassImageOptimization}
                      width={72}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-satoshi text-[13px] font-semibold uppercase tracking-[1.5px] text-black/50">Foto profil</p>
                    <p className="mt-[4px] font-satoshi text-[13px] leading-[1.4] text-black/60">
                      Ubah foto profil dan simpan perubahanmu.
                    </p>
                    <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                      <label className="inline-flex cursor-pointer items-center rounded-[10px] bg-[#8798ff] px-[14px] py-[8px] font-satoshi text-[13px] font-semibold tracking-[1px] text-white transition-opacity hover:opacity-90">
                        <input
                          key={avatarInputKey}
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => handleAvatarChange(event.target.files?.[0] ?? null)}
                          type="file"
                        />
                        Pilih foto
                      </label>
                      {avatarFile ? (
                        <button
                          className="font-satoshi text-[13px] font-semibold tracking-[1px] text-[#5900ff] underline-offset-2 hover:underline"
                          onClick={handleResetAvatar}
                          type="button"
                        >
                          Batal foto baru
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="font-satoshi text-[13px] font-semibold uppercase tracking-[1.5px] text-black/50">
                    Nama
                  </label>
                  <input
                    className="w-full rounded-[10px] border border-black/20 bg-[#f9f9ff] px-[16px] py-[14px] font-satoshi text-[16px] tracking-[1.4px] text-black outline-none transition-colors focus:border-[#8798ff] xl:text-[18px]"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                    type="text"
                    value={name}
                  />
                </div>

                <div className="flex items-center gap-[12px]">
                  <div className="h-[1px] flex-1 bg-black/10" />
                  <button
                    className="shrink-0 font-satoshi text-[13px] font-semibold tracking-[1.2px] text-[#5900ff] underline-offset-2 hover:underline"
                    onClick={() => setShowPasswordSection((p) => !p)}
                    type="button"
                  >
                    {showPasswordSection ? "− Tutup ganti password" : "+ Ganti password"}
                  </button>
                  <div className="h-[1px] flex-1 bg-black/10" />
                </div>

                <AnimatePresence>
                  {showPasswordSection ? (
                    <motion.div
                      animate={{ height: "auto", opacity: 1 }}
                      className="flex flex-col gap-[14px] overflow-hidden"
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col gap-[6px]">
                        <label className="font-satoshi text-[13px] font-semibold uppercase tracking-[1.5px] text-black/50">
                          Password Saat Ini
                        </label>
                        <input
                          className="w-full rounded-[10px] border border-black/20 bg-[#f9f9ff] px-[16px] py-[12px] font-satoshi text-[16px] tracking-[1.4px] text-black outline-none transition-colors focus:border-[#8798ff]"
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Password lama"
                          type="password"
                          value={currentPassword}
                        />
                      </div>
                      <div className="flex flex-col gap-[6px]">
                        <label className="font-satoshi text-[13px] font-semibold uppercase tracking-[1.5px] text-black/50">
                          Password Baru
                        </label>
                        <input
                          className="w-full rounded-[10px] border border-black/20 bg-[#f9f9ff] px-[16px] py-[12px] font-satoshi text-[16px] tracking-[1.4px] text-black outline-none transition-colors focus:border-[#8798ff]"
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          type="password"
                          value={newPassword}
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Feedback */}
                {error ? (
                  <p className="rounded-[8px] bg-red-50 px-[12px] py-[8px] font-satoshi text-[13px] tracking-[1px] text-red-600">
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <p className="rounded-[8px] bg-green-50 px-[12px] py-[8px] font-satoshi text-[13px] tracking-[1px] text-green-700">
                    {success}
                  </p>
                ) : null}

                {/* Actions */}
                <div className="mt-auto flex gap-[12px] pt-[8px]">
                  <button
                    className="flex-1 rounded-[10px] border border-black/20 px-[16px] py-[14px] font-satoshi text-[15px] font-medium tracking-[1.4px] text-black/50 transition-colors hover:bg-black/5"
                    onClick={onClose}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="flex-1 rounded-[10px] bg-black px-[16px] py-[14px] font-satoshi text-[15px] font-bold tracking-[1.6px] text-white transition-opacity disabled:opacity-50 xl:text-[16px]"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    ,
    document.body,
  );
}
