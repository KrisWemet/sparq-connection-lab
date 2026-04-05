import { Home, BarChart2, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BarChart2, label: "Insights", path: "/insights" },
  { icon: BookOpen, label: "Library", path: "/journeys" },
  { icon: Trophy, label: "Challenges", path: "/couples" },
];

export function BottomNav() {
  const router = useRouter();

  // Hide on auth pages, landing page, and immersive session pages
  if (['/', '/auth', '/login', '/signup', '/onboarding', '/rehearsal'].includes(router.pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl py-3 px-6 flex justify-between items-center z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      style={{
        background: 'rgba(255,255,255,0.95)',
        borderTop: '1px solid rgba(139,92,246,0.12)',
        boxShadow: '0 -4px 20px rgba(139,92,246,0.06)',
      }}
    >
      {navItems.map((item) => {
        const isActive = router.pathname.startsWith(item.path);
        return (
          <Link
            key={item.label}
            href={item.path}
            className="flex flex-col items-center space-y-1 w-16 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-xl"
          >
            <div
              className={`flex items-center justify-center w-10 h-8 rounded-full transition-all ${isActive ? 'bg-brand-primary/10' : ''}`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-brand-primary' : 'text-brand-taupe/60'}
              />
            </div>
            <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-primary' : 'text-brand-taupe/60'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
