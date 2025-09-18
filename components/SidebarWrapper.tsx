"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarLayout } from "@/components/sidebar-layout";

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith("/ELS-Test");

  return hideSidebar ? <>{children}</> : <SidebarLayout>{children}</SidebarLayout>;
}
