// ─── Peter Demo Page ───────────────────────────────────────────────
// Test page for Peter the Otter assistant system.
// Visit /peter-demo to interact with all Peter features.

import React from "react";
import { PeterDemoPanel } from "@/components/peter/PeterDemoPanel";

export default function PeterDemoPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <PeterDemoPanel />
    </main>
  );
}
