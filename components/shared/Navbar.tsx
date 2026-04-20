'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Courses', href: '#courses' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Skillora</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="font-medium">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="font-medium shadow-md shadow-primary/20">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(!open)}
              className="text-muted-foreground"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {open && (
          <div className="md:hidden animate-in slide-in-from-top-5 duration-300 border-t border-border py-6 space-y-4">
            <div className="flex flex-col space-y-3 px-2">
              {navLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 px-4 py-2 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-border px-2">
              <Button asChild variant="outline" className="w-full justify-center py-5">
                <Link href="/auth/login" onClick={() => setOpen(false)}>Sign In</Link>
              </Button>
              <Button asChild className="w-full justify-center py-5 shadow-lg shadow-primary/10">
                <Link href="/auth/register" onClick={() => setOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}