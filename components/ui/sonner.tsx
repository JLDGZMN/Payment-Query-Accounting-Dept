"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"

const greenToastClasses =
  "!border-emerald-200 !bg-emerald-50 !text-emerald-800 dark:!border-emerald-900 dark:!bg-emerald-950 dark:!text-emerald-100"
const warningToastClasses =
  "!border-amber-200 !bg-amber-50 !text-amber-800 dark:!border-amber-900 dark:!bg-amber-950 dark:!text-amber-100"
const errorToastClasses =
  "!border-rose-200 !bg-rose-50 !text-rose-800 dark:!border-rose-900 dark:!bg-rose-950 dark:!text-rose-100"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
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
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: greenToastClasses,
          info: greenToastClasses,
          loading: greenToastClasses,
          warning: warningToastClasses,
          error: errorToastClasses,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
