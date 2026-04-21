'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, BookOpen, FileText, HelpCircle } from 'lucide-react';

const nav = [
  { label: 'Dashboard', href: '/instructor/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Courses', href: '/instructor/courses',   icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Lessons',    href: '/instructor/lessons',   icon: <FileText className="h-4 w-4" /> },
  { label: 'Quizzes',    href: '/instructor/quizzes',   icon: <HelpCircle className="h-4 w-4" /> },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout 
      nav={nav} 
      roleLabel="Instructor" 
      // আপনি চাইলে সরাসরি 'text-emerald-500' বা আপনার থিমের success কালার দিতে পারেন
      roleColor="text-emerald-500" 
    >
      {children}
    </DashboardLayout>
  );
}