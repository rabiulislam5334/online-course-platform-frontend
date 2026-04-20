'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LogOut, Menu} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Types and Interfaces
export interface NavItem { 
  label: string; 
  href: string; 
  icon: React.ReactNode; 
  badge?: number; 
}

interface SidebarProps {
  nav: NavItem[];
  pathname: string;
  setOpen: (open: boolean) => void;
  initials: string;
  user: any;
  handleLogout: () => void;
  roleLabel: string;
  roleColor: string;
}

interface DashboardLayoutProps { 
  children: React.ReactNode; 
  nav: NavItem[]; 
  roleLabel: string; 
  roleColor: string; 
}

// 1. Sidebar Content Component (Main function er baire define kora hoyeche)
const SidebarContent = ({ 
  nav, 
  pathname, 
  setOpen, 
  initials, 
  user, 
  handleLogout, 
  roleLabel, 
  roleColor 
}: SidebarProps) => (
  <div className="flex h-full flex-col bg-card border-r border-border w-64 shadow-sm">
    {/* Logo Area */}
    <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground leading-none truncate">Skillora</p>
        <p className={cn('text-[10px] uppercase tracking-wider font-bold mt-1.5 opacity-80', roleColor)}>
          {roleLabel}
        </p>
      </div>
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group',
              active
                ? 'bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <span className={cn("shrink-0", active ? "text-primary-foreground" : "group-hover:text-primary")}>
              {item.icon}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={cn(
                "flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1",
                active ? "bg-white text-primary" : "bg-destructive text-destructive-foreground"
              )}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>

    <Separator className="opacity-50" />

    {/* User Profile & Logout */}
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary/30 border border-border/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-inner">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
          <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-xs font-medium">Sign Out</span>
      </Button>
    </div>
  </div>
);

// 2. Main Dashboard Layout
export default function DashboardLayout({ children, nav, roleLabel, roleColor }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const initials = user?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex shrink-0">
        <SidebarContent 
          nav={nav} 
          pathname={pathname} 
          setOpen={setOpen} 
          initials={initials} 
          user={user} 
          handleLogout={handleLogout}
          roleLabel={roleLabel}
          roleColor={roleColor}
        />
      </aside>

      {/* Mobile Sidebar Overlay (Dynamic) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div 
            className="absolute inset-0" 
            onClick={() => setOpen(false)} 
          />
          <div className="relative z-10 h-full w-fit animate-in slide-in-from-left duration-300">
            <SidebarContent 
              nav={nav} 
              pathname={pathname} 
              setOpen={setOpen} 
              initials={initials} 
              user={user} 
              handleLogout={handleLogout}
              roleLabel={roleLabel}
              roleColor={roleColor}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 md:hidden bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="-ml-2">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-tight text-foreground">Skillora</span>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}