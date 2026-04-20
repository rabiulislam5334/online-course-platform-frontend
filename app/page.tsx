'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Navbar, Footer } from '@/components/shared';

// Home Components

import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CTA } from '@/components/home/CTA';
import { Hero } from '@/components/home/Hero';

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'Super Admin' || user.role === 'Admin') router.replace('/admin/dashboard');
    else if (user.role === 'Instructor') router.replace('/instructor/dashboard');
    else router.replace('/student/dashboard');
  }, [user, router]);

  if (user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}