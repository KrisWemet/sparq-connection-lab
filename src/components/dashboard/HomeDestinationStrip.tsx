import Link from "next/link";
import { BookOpen, HeartHandshake, NotebookPen } from "lucide-react";

const destinations = [
  {
    href: "/journeys",
    label: "Journey Progress",
    description: "See your active lane",
    icon: BookOpen,
  },
  {
    href: "/connect",
    label: "Shared Connection",
    description: "Open shared tools",
    icon: HeartHandshake,
  },
  {
    href: "/journal",
    label: "Journal",
    description: "Review what changed",
    icon: NotebookPen,
  },
] as const;

export function HomeDestinationStrip() {
  return (
    <section className="rounded-3xl border border-brand-primary/10 bg-[#EDE9FE] p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-3">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="flex min-h-28 flex-col items-start justify-between rounded-[24px] border border-brand-primary/10 bg-white/70 p-4 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <destination.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug text-[#2E1065]">
                {destination.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#5B4A86]">
                {destination.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
