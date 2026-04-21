'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Shield, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pending-count'],
    queryFn: async () => {
      const r = await api.get('/users/dashboard');
      // আপনার ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী data.data.pendingApprovals চেক করুন
      return r.data.data?.pendingApprovals ?? 0;
    },
    refetchInterval: 30000, // প্রতি ৩০ সেকেন্ডে অটো আপডেট হবে
  });

  const nav = [
    { 
      label: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      label: 'Users', 
      href: '/admin/users', 
      icon: <Users className="h-4 w-4" />, 
      // ডাটা ০ এর বেশি হলেই কেবল ব্যাজ দেখাবে
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { 
      label: 'Roles', 
      href: '/admin/roles', 
      icon: <Shield className="h-4 w-4" /> 
    },
    { 
      label: 'Courses', 
      href: '/admin/courses', 
      icon: <BookOpen className="h-4 w-4" /> 
    },
  ];

  return (
    <DashboardLayout 
      nav={nav} 
      roleLabel="Admin Panel" 
      roleColor="text-amber-500" // Tailwind এর স্ট্যান্ডার্ড কালার ব্যবহার করা নিরাপদ
    >
      {children}
    </DashboardLayout>
  );
}