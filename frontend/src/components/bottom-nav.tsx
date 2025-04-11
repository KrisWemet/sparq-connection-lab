import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, MessageCircle, Settings } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/daily-questions',
    label: 'Questions',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            className={cn(
              'flex flex-col items-center gap-1 h-auto py-2',
              location.pathname === item.href && 'text-primary'
            )}
            asChild
          >
            <Link to={item.href}>
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
