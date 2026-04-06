import { BookOpen, Home, MessageCircle, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Journeys", path: "/journeys" },
  { icon: MessageCircle, label: "Connect", path: "/connect" },
  { icon: NotebookPen, label: "Journal", path: "/journal" },
 ] as const;

const hiddenNavPrefixes = [
  "/",
  "/auth",
  "/login",
  "/signup",
  "/onboarding",
  "/onboarding-flow",
  "/rehearsal",
];

const secondaryAccessPrefixes = [
  "/profile",
  "/settings",
  "/subscription",
  "/trust-center",
];

type NavOwner = (typeof navItems)[number]["label"] | null;

function matchesPath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function shouldHideNav(pathname: string) {
  return hiddenNavPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    || secondaryAccessPrefixes.some((prefix) => matchesPath(pathname, prefix));
}

function getPrimaryNavOwner(pathname: string): NavOwner {
  if (matchesPath(pathname, "/dashboard") || matchesPath(pathname, "/daily-growth")) {
    return "Home";
  }

  if (matchesPath(pathname, "/journeys")) {
    return "Journeys";
  }

  if (
    ["/connect", "/messages", "/go-connect", "/translator", "/join-partner"].some((path) =>
      matchesPath(pathname, path),
    )
  ) {
    return "Connect";
  }

  if (matchesPath(pathname, "/journal")) {
    return "Journal";
  }

  return null;
}

export function BottomNav() {
  const router = useRouter();
  const pathname = router.asPath.split("?")[0];
  const activeOwner = getPrimaryNavOwner(pathname);

  if (shouldHideNav(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div
        className="mx-auto flex max-w-lg items-center justify-between rounded-[28px] border border-brand-primary/10 bg-white/85 px-4 py-3 shadow-[0_-4px_20px_rgba(139,92,246,0.06)] backdrop-blur-xl"
        style={{
          boxShadow: "0 -4px 20px rgba(139,92,246,0.06)",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeOwner === item.label;

          return (
            <Link
              key={item.label}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className="flex min-h-11 w-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <div
                className={`flex h-9 w-11 items-center justify-center rounded-full transition-all ${
                  isActive ? "bg-brand-primary/10" : ""
                }`}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-brand-primary" : "text-brand-taupe/60"}
                />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-brand-primary" : "text-brand-taupe/60"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
