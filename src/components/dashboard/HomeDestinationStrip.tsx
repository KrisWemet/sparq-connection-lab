import Link from "next/link";
import { BookOpen, HeartHandshake, NotebookPen } from "lucide-react";
import { EditorialEyebrow, EditorialQuietSurface } from "@/components/editorial/EditorialSurface";

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
    <EditorialQuietSurface className="overflow-hidden rounded-[30px] border-brand-primary/8 bg-white/55 px-4 py-4 shadow-[0_18px_42px_rgba(42,34,52,0.05)] backdrop-blur-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <EditorialEyebrow className="text-brand-primary/70">Elsewhere</EditorialEyebrow>
          <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-brand-taupe">
            Quiet doors into the rest of your relationship life.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="flex min-h-[7.75rem] flex-col items-start justify-between rounded-[24px] border border-white/80 bg-brand-linen/80 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[18px] border border-brand-primary/10 bg-white text-brand-primary shadow-sm">
              <destination.icon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug text-brand-espresso">
                {destination.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-brand-taupe">
                {destination.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </EditorialQuietSurface>
  );
}
