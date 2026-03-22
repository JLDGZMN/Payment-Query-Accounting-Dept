"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const AUTH_FLASH_KEY = "auth-flash";

export function AuthFlashToast() {
  const pathname = usePathname();

  useEffect(() => {
    const flash = window.sessionStorage.getItem(AUTH_FLASH_KEY);

    if (!flash) {
      return;
    }

    if (flash === "login-success" && pathname.startsWith("/dashboard")) {
      toast.success("Login successful, good to have you back.");
      window.sessionStorage.removeItem(AUTH_FLASH_KEY);
    }

    if (flash === "logout-success" && pathname === "/") {
      toast.success("You have logged out successfully.");
      window.sessionStorage.removeItem(AUTH_FLASH_KEY);
    }
  }, [pathname]);

  return null;
}
