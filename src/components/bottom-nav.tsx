import { Home, BookOpen, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Journeys", path: "/journeys" },
  { icon: MessageCircle, label: "Daily", path: "/daily-growth" },
  { icon: User2, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const router = useRouter();

  // Hide on auth pages or landing page
  if (['/', '/auth', '/login', '/signup', '/onboarding'].includes(router.pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl py-3 px-6 flex justify-between items-center z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderTop: '1px solid rgba(200,106,88,0.1)',
        boxShadow: '0 -4px 20px rgba(200,106,88,0.04)',
      }}
    >
      {navItems.map((item) => {
        const isActive = router.pathname.startsWith(item.path);
        return (
          <Link
            key={item.label}
            href={item.path}
            className="flex flex-col items-center space-y-1 w-16 transition-colors"
          >
            <div
              className="flex items-center justify-center w-10 h-8 rounded-full transition-all"
              style={isActive ? { background: 'rgba(192,97,74,0.1)' } : {}}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? '#C0614A' : '#9E8A86' }}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: isActive ? '#C0614A' : '#9E8A86' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
