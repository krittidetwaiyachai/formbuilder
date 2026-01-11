"use client";

import { ToasterProvider } from "@/components/ui/toaster";

export default function ToasterWrapper({ children }: { children: React.ReactNode }) {
  return <ToasterProvider>{children}</ToasterProvider>;
}

