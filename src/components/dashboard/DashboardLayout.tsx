
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PeterLoading } from "@/components/PeterLoading";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export function DashboardLayout({ children, isLoading }: DashboardLayoutProps) {
  if (isLoading) {
    return <PeterLoading isLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      <DashboardHeader />
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {children}
      </main>
    </div>
  );
}
