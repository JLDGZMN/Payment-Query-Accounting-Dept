"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const toastClassNames = {
  toast: cn(
    "cn-toast !w-[var(--width)] !rounded-3xl !border !border-border/60 !bg-background/98 !p-4 !text-foreground !shadow-[0_24px_60px_-30px_rgba(15,23,42,0.22)] !backdrop-blur-xl supports-[backdrop-filter]:!bg-background/94 dark:!bg-slate-950/92 dark:!shadow-[0_24px_60px_-30px_rgba(0,0,0,0.55)]",
    "!gap-3 !font-sans",
    "transition-[transform,box-shadow,background-color,border-color] duration-200 hover:!shadow-[0_28px_65px_-34px_rgba(15,23,42,0.34)] dark:hover:!shadow-[0_28px_65px_-34px_rgba(0,0,0,0.6)]"
  ),
  content: "!flex-1 !gap-1 !pr-6",
  title: "text-[15px] font-semibold tracking-tight text-foreground",
  description: "text-sm leading-snug text-foreground/90",
  icon: "!m-0 !size-12 !items-center !justify-center rounded-2xl border border-border/40 bg-muted/45 text-foreground/70 shadow-sm",
  closeButton:
    "!left-auto !right-3.5 !top-3.5 !size-7 !transform-none !rounded-xl !border !border-border/60 !bg-background/95 !text-muted-foreground !shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 hover:!border-border hover:!bg-muted/70 hover:!text-foreground hover:!shadow-md dark:!bg-slate-950/90",
  actionButton:
    "!h-7 !rounded-xl !bg-primary !px-2.5 !text-xs !font-medium !text-primary-foreground !shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:!bg-primary/90 hover:!shadow-md focus-visible:!ring-[3px] focus-visible:!ring-ring/15",
  cancelButton:
    "!h-7 !rounded-xl !border !border-border/60 !bg-background/90 !px-2.5 !text-xs !font-medium !text-foreground !shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 hover:!border-border hover:!bg-muted/60 hover:!shadow-md focus-visible:!ring-[3px] focus-visible:!ring-ring/15 dark:!bg-slate-950/88",
  default:
    "[&_[data-icon]]:border-border/60 [&_[data-icon]]:bg-primary/10 [&_[data-icon]]:text-primary",
  success: cn(
    "!border-emerald-400/75 !bg-emerald-50/92",
    "supports-[backdrop-filter]:!bg-emerald-50/86 dark:!border-emerald-700/70 dark:!bg-emerald-950/48",
    "[&_[data-title]]:!text-foreground [&_[data-description]]:!text-foreground/90",
    "[&_[data-icon]]:!border-emerald-200/70 [&_[data-icon]]:!bg-emerald-100/75 [&_[data-icon]]:!text-emerald-500",
    "dark:[&_[data-icon]]:!border-emerald-800/70 dark:[&_[data-icon]]:!bg-emerald-950/40 dark:[&_[data-icon]]:!text-emerald-300"
  ),
  info: cn(
    "!border-sky-400/70 !bg-sky-50/92",
    "supports-[backdrop-filter]:!bg-sky-50/86 dark:!border-sky-700/70 dark:!bg-sky-950/44",
    "[&_[data-title]]:!text-foreground [&_[data-description]]:!text-foreground/90",
    "[&_[data-icon]]:!border-sky-200/70 [&_[data-icon]]:!bg-sky-100/75 [&_[data-icon]]:!text-sky-500",
    "dark:[&_[data-icon]]:!border-sky-800/70 dark:[&_[data-icon]]:!bg-sky-950/40 dark:[&_[data-icon]]:!text-sky-300"
  ),
  loading: cn(
    "!border-sky-400/60 !bg-sky-50/88",
    "supports-[backdrop-filter]:!bg-sky-50/82 dark:!border-sky-700/65 dark:!bg-sky-950/40",
    "[&_[data-title]]:!text-foreground [&_[data-description]]:!text-foreground/85",
    "[&_[data-icon]]:!border-sky-200/70 [&_[data-icon]]:!bg-sky-100/75 [&_[data-icon]]:!text-sky-500",
    "dark:[&_[data-icon]]:!border-sky-800/70 dark:[&_[data-icon]]:!bg-sky-950/40 dark:[&_[data-icon]]:!text-sky-300"
  ),
  warning: cn(
    "!border-amber-400/75 !bg-amber-50/92",
    "supports-[backdrop-filter]:!bg-amber-50/86 dark:!border-amber-700/70 dark:!bg-amber-950/44",
    "[&_[data-title]]:!text-foreground [&_[data-description]]:!text-foreground/90",
    "[&_[data-icon]]:!border-amber-200/70 [&_[data-icon]]:!bg-amber-100/80 [&_[data-icon]]:!text-amber-500",
    "dark:[&_[data-icon]]:!border-amber-800/70 dark:[&_[data-icon]]:!bg-amber-950/40 dark:[&_[data-icon]]:!text-amber-300"
  ),
  error: cn(
    "!border-rose-400/75 !bg-rose-50/92",
    "supports-[backdrop-filter]:!bg-rose-50/86 dark:!border-rose-700/70 dark:!bg-rose-950/46",
    "[&_[data-title]]:!text-foreground [&_[data-description]]:!text-foreground/90",
    "[&_[data-icon]]:!border-rose-200/70 [&_[data-icon]]:!bg-rose-100/80 [&_[data-icon]]:!text-rose-500",
    "dark:[&_[data-icon]]:!border-rose-800/70 dark:[&_[data-icon]]:!bg-rose-950/40 dark:[&_[data-icon]]:!text-rose-300"
  ),
} satisfies NonNullable<NonNullable<ToasterProps["toastOptions"]>["classNames"]>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      gap={10}
      offset={16}
      mobileOffset={16}
      icons={{
        success: (
          <CheckCircleIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <WarningIcon className="size-4" />
        ),
        error: (
          <XCircleIcon className="size-4" />
        ),
        loading: (
          <SpinnerIcon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1.5rem",
          "--width": "360px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          ...toastClassNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
