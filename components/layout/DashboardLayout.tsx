'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/index';

export interface NavItem { label: string; href: string; icon: React.ReactNode; badge?: number; }

interface Props { children: React.ReactNode; nav: NavItem[]; roleLabel: string; roleColor: string; }

export default function DashboardLayout({ children, nav, roleLabel, roleColor }: Props) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card border-r border-border w-60">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">EduPlatform</p>
          <p className={cn('text-xs font-mono mt-0.5', roleColor)}>{roleLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary font-medium border border-primary/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User + Logout */}
      <div className="px-2 py-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-10 h-full w-fit">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">EduPlatform</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
