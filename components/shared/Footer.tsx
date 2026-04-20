'use client';

import Link from 'next/link';
// Github এবং Linkedin ইমপোর্ট করা হয়েছে
 import { Github, Linkedin, X } from 'lucide-react';
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
   { Icon: Github, href: '#', label: 'Github' },
    { Icon: X, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: '#', label: 'Linkedin' },
  ];

  const platformLinks = [
    { label: 'Browse Courses', href: '/student/courses' },
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
    { label: 'Features', href: '#features' },
  ];

  const dashboardLinks = [
    { label: 'Student Portal', href: '/student/dashboard' },
    { label: 'Instructor Panel', href: '/instructor/dashboard' },
    { label: 'Admin Panel', href: '/admin/dashboard' },
  ];

  const techStack = [
    { label: 'Next.js 16 (App Router)', href: '#' },
    { label: 'Express.js Backend', href: '#' },
    { label: 'TiDB Cloud Database', href: '#' },
    { label: 'Assessment: TA-2026-OCQP-01', href: '#' },
  ];

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Skillora</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A modern online learning platform designed to empower students and instructors worldwide. Learn at your own pace with verified certificates.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link 
                  key={label} 
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard Links */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">Dashboards</h4>
            <ul className="space-y-3">
              {dashboardLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">Tech Stack</h4>
            <ul className="space-y-3">
              {techStack.map(({ label }) => (
                <li key={label} className="text-sm text-muted-foreground/80 cursor-default">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/50 pt-8">
          <p className="text-xs text-muted-foreground order-2 md:order-1">
            © {currentYear} <span className="font-semibold text-foreground/80">Skillora</span>. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground order-1 md:order-2 bg-secondary/50 px-4 py-2 rounded-full border border-border/30">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>for</span>
            <span className="text-primary font-bold">TA-2026-OCQP-01</span>
          </div>
        </div>
      </div>
    </footer>
  );
}