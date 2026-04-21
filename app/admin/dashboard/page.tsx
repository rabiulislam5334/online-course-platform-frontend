'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, FileText, Clock, AlertCircle } from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Shared Components - নিশ্চিত করুন পাথগুলো সঠিক আছে
import { StatCard, PageHeader, StatusBadge, DataTable } from '@/components/shared';

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const r = await api.get('/users/dashboard');
      return r.data.data;
    },
  });

  // ১. API Error State
  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground">Please check your network connection or API URL.</p>
      </div>
      <Button onClick={() => refetch()} variant="outline">Try Again</Button>
    </div>
  );

  // ২. Loading State
  if (isLoading) return (
    <div className="space-y-6 animate-fade-in p-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );

  const pendingCount = data?.pendingApprovals ?? 0;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader
        title="Dashboard"
        description="Platform performance and overview"
        action={pendingCount > 0 ? (
          <Link href="/admin/users?status=pending"
            className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-500/20 transition-colors">
            <Clock className="h-4 w-4" />
            {pendingCount} Pending Approvals
          </Link>
        ) : undefined}
      />

      {/* ৩. StatCards - 'color' বদলে 'variant' ব্যবহার করা হয়েছে */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Users"   
          value={data?.totalUsers ?? 0}      
          icon={<Users />} 
          variant="primary" 
        />
        <StatCard 
          label="Active Courses"      
          value={data?.totalCourses ?? 0}    
          icon={<BookOpen />} 
          variant="success" 
        />
        <StatCard 
          label="Enrollments"   
          value={data?.totalEnrollments ?? 0} 
          icon={<GraduationCap />} 
          variant="warning" 
        />
        <StatCard 
          label="Quiz Attempts" 
          value={data?.totalAttempts ?? 0}    
          icon={<FileText />} 
          variant="destructive" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
          <CardHeader className="pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Registrations</CardTitle>
              <Link href="/admin/users" className="text-xs text-primary hover:underline font-semibold">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: 'user', label: 'User', render: (u: any) => (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary border border-primary/20">
                      {u.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-foreground truncate">{u.full_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                )},
                { key: 'role',   label: 'Role',   render: (u: any) => (
                  <div className="px-2">
                    <StatusBadge status={u.role?.toLowerCase()} />
                  </div>
                )},
                { key: 'status', label: 'Status', render: (u: any) => (
                  <div className="px-2">
                    <StatusBadge status={u.status} />
                  </div>
                )},
              ]}
              data={data?.recentUsers || []}
            />
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
          <CardHeader className="pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Courses</CardTitle>
              <Link href="/admin/courses" className="text-xs text-primary hover:underline font-semibold">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: 'title', label: 'Course', render: (c: any) => (
                  <div className="px-4 py-2 max-w-[200px]">
                     <p className="font-bold text-sm text-foreground truncate">{c.title}</p>
                     <p className="text-[10px] text-muted-foreground truncate">ID: #{c.id}</p>
                  </div>
                )},
                { key: 'instructor', label: 'Instructor', render: (c: any) => (
                  <span className="text-xs font-medium text-muted-foreground px-2">{c.instructor_name || 'N/A'}</span>
                )},
                { key: 'status', label: 'Status', render: (c: any) => (
                  <div className="px-2">
                    <StatusBadge status={c.status} />
                  </div>
                )},
              ]}
              data={data?.recentCourses || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}