'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, Compass, Heart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Scan', href: '/scan', icon: Scan },
    { name: 'Ontdek', href: '/discover', icon: Compass },
    { name: 'Favorieten', href: '/favorites', icon: Heart },
    { name: 'Profiel', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto bg-surface border-t border-divider pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95",
                  isActive ? "text-brand" : "text-muted hover:text-text"
                )}
              >
                <item.icon className={clsx("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
