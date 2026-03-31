"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

export function useRequireAdmin() {
  const { isAuthResolved, isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    if (!isLoggedIn) {
      void router.replace(routes.login);
      return;
    }

    if (user?.role !== "admin") {
      void router.replace(routes.home);
    }
  }, [isAuthResolved, isLoggedIn, router, user?.role]);

  return isAuthResolved && isLoggedIn && user?.role === "admin";
}

