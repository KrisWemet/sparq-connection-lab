
import React from "react";
import { BottomNav } from "@/components/bottom-nav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export function DashboardLayout({ children, isLoading }: DashboardLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="md" label="Loading your relationship dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      <DashboardHeader />
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
