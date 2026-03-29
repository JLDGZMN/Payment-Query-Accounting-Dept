"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCardIcon,
  UserIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Payments", href: "/dashboard/payments", icon: CreditCardIcon },
];

const accountItems = [
  { label: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

const sidebarHeaderShellClass =
  "flex items-center gap-2 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/35 px-2.5 py-2 shadow-sm";
const sidebarSectionLabelClass =
  "px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60";
const sidebarMenuButtonClass =
  "rounded-xl border border-transparent px-2.5 py-2 text-[13px] transition-[background-color,border-color,box-shadow,color] duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-accent/70 hover:shadow-sm data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="p-3">
        <div className={`${sidebarHeaderShellClass} justify-center group-data-[collapsible=icon]:px-0`}>
          <CreditCardIcon className="size-4 shrink-0" />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Payment Query
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 bg-sidebar-border/60" />

      <SidebarContent>
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className={sidebarSectionLabelClass}>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={sidebarMenuButtonClass}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 bg-sidebar-border/60" />

        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className={sidebarSectionLabelClass}>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={sidebarMenuButtonClass}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
