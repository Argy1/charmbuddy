"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import InteractivePress from "@/components/motion/InteractivePress";
import AppImage from "@/components/shared/AppImage";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

type AuthCardProps = {
  mode?: "login" | "register";
};

export default function AuthCard({ mode = "login" }: AuthCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isRegister = mode === "register";
  const router = useRouter();
  const { isLoading, login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError("Nama wajib diisi.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Konfirmasi password tidak sama.");
        return;
      }
      try {
        const registeredUser = await register(name.trim(), email.trim(), password.trim());
        void router.push(registeredUser.role === "admin" ? routes.admin.overview : routes.profile);
        return;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError("Registrasi gagal. Coba lagi.");
        return;
      }
    }

    try {
      const loggedInUser = await login(email.trim(), password.trim());
      void router.push(loggedInUser.role === "admin" ? routes.admin.overview : routes.profile);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError("Login gagal. Coba lagi.");
    }
  };

  return (
    <motion.form
      className={`backdrop-blur-[6.9px] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.69)] border-solid rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full max-w-[788px] px-[16px] py-[24px] sm:px-[24px] sm:py-[28px] xl:px-[34px] xl:py-[30px] ${
        isRegister ? "h-auto xl:min-h-[649px]" : "h-auto xl:min-h-[473px]"
      }`}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28, scale: prefersReducedMotion ? 1 : 0.96, filter: prefersReducedMotion ? "blur(0px)" : "blur(6px)" }}
      onSubmit={handleSubmit}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    >
      {!isRegister ? (
        <div className="mx-auto flex w-full max-w-[695px] flex-col items-center gap-[18px] sm:gap-[24px]">
          <h1 className="w-full text-center font-[var(--font-fanlste)] text-[clamp(56px,16vw,64px)] leading-[normal] text-white">Login</h1>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[18px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                value={email}
              />
              <AppImage alt="Email" className="h-[28px] w-[28px] shrink-0 sm:h-[30px] sm:w-[30px]" height={30} src="/auth/icon-email.svg" width={30} />
            </div>
          </motion.label>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[15px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
              <AppImage alt="Password" className="h-[28px] w-[28px] shrink-0 sm:h-[30px] sm:w-[30px]" height={30} src="/auth/icon-password.svg" width={30} />
            </div>
          </motion.label>

          <InteractivePress>
            <button className="bg-white rounded-[10px] h-[48px] w-[120px] px-[16px] py-[8px] text-center disabled:opacity-50 sm:w-[110px]" disabled={isLoading} type="submit">
              <span className="font-[var(--font-satoshi)] text-[clamp(20px,5vw,24px)] leading-[normal] text-black">Login</span>
            </button>
          </InteractivePress>

          <div className="flex w-full flex-wrap items-center justify-center gap-x-[10px] gap-y-[2px] text-center text-[clamp(22px,6vw,24px)] leading-[normal] text-white">
            <p className="font-[var(--font-satoshi)]">Dont Have an Account?</p>
            <Link className="font-[var(--font-satoshi)] font-[700]" href={routes.register}>
              Register
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[695px] flex-col items-center gap-[18px] sm:gap-[20px]">
          <h1 className="w-full text-center font-[var(--font-fanlste)] text-[clamp(56px,16vw,64px)] leading-[normal] text-white">Register</h1>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[18px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                value={name}
              />
              <AppImage alt="Name" className="h-[30px] w-[30px] shrink-0 sm:h-[35px] sm:w-[35px]" height={35} src="/auth/icon-person-register.svg" width={35} />
            </div>
          </motion.label>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[18px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                value={email}
              />
              <AppImage alt="Email" className="h-[28px] w-[28px] shrink-0 sm:h-[30px] sm:w-[30px]" height={30} src="/auth/icon-email-register.svg" width={30} />
            </div>
          </motion.label>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[15px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
              <AppImage alt="Password" className="h-[28px] w-[28px] shrink-0 sm:h-[30px] sm:w-[30px]" height={30} src="/auth/icon-password-register.svg" width={30} />
            </div>
          </motion.label>

          <motion.label className="bg-white flex h-[60px] w-full items-center px-[12px] py-[14px] sm:px-[15px]">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <input
                className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[clamp(18px,5vw,24px)] leading-[normal] text-black outline-none"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
              />
              <AppImage alt="Confirm Password" className="h-[28px] w-[28px] shrink-0 sm:h-[30px] sm:w-[30px]" height={30} src="/auth/icon-password-register.svg" width={30} />
            </div>
          </motion.label>

          <InteractivePress>
            <button className="bg-white rounded-[10px] w-[120px] h-[48px] px-[16px] py-[8px] text-center disabled:opacity-50" disabled={isLoading} type="submit">
              <span className="font-[var(--font-satoshi)] text-[clamp(20px,5vw,24px)] leading-[normal] text-black">Register</span>
            </button>
          </InteractivePress>
        </div>
      )}

      {error ? <p className="mt-[8px] break-words px-[8px] text-center font-[var(--font-satoshi)] text-[16px] text-white">{error}</p> : null}
    </motion.form>
  );
}

