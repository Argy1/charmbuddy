"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

export function useRequireAuth() {
  const { isAuthResolved, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }
    if (!isLoggedIn) {
      void router.replace(routes.login);
    }
  }, [isAuthResolved, isLoggedIn, router]);

  return isAuthResolved && isLoggedIn;
}

