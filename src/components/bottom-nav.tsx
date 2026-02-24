import { Home, MessageCircle, Target, Calendar, User2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/notifications";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Calendar, label: "Dates", path: "/date-ideas" },
  { icon: User2, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === item.path
              ? "text-primary"
              : "text-gray-500 hover:text-primary transition-colors"
          }`}
        >
          <item.icon size={24} />
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
      
      {/* Notification Bell */}
      <div className="flex flex-col items-center space-y-1">
        <NotificationBell 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-gray-500 hover:text-primary"
        />
        <span className="text-xs text-gray-500">Alerts</span>
      </div>
    </nav>
  );
}
