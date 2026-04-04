"use client";

import type { ReactNode } from "react";

interface AuthBackgroundProps {
  children: ReactNode;
}

const backgroundImage = [
  "linear-gradient(135deg, rgba(15, 23, 42, 0.42), rgba(100, 116, 139, 0.2))",
  "linear-gradient(180deg, rgba(248, 250, 252, 0.1), rgba(15, 23, 42, 0.24))",
  "url('/top-view-finance-business-elements.jpg')",
].join(", ");

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage,
          filter: "grayscale(24%) brightness(0.97) contrast(1.02) saturate(0.92)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_center,transparent_48%,rgba(15,23,42,0.12)_100%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(148,163,184,0.03)_46%,rgba(15,23,42,0.08)_100%)]" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12px] font-semibold tracking-[0.3em] text-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-md sm:left-6 sm:top-6 sm:px-5 sm:py-2 sm:text-[13px]">
        PAYMENT QUERY PORTAL
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </div>
    </div>
  );
}
