'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, BookOpen, Award, GraduationCap } from 'lucide-react';

const nav = [
  { 
    label: 'Dashboard', 
    href: '/student/dashboard', 
    icon: <LayoutDashboard className="h-4 w-4" /> 
  },
  { 
    label: 'My Courses', // 
    href: '/student/my-courses', 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
  { 
    label: 'Browse Courses', 
    href: '/student/courses', 
    icon: <BookOpen className="h-4 w-4" /> 
  },
  { 
    label: 'Certificates', 
    href: '/student/certificates', 
    icon: <Award className="h-4 w-4" /> 
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout 
      nav={nav} 
      roleLabel="Student" 
      roleColor="text-purple-400"
    >
      {children}
    </DashboardLayout>
  );
}