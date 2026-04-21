'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, FileText, Clock } from 'lucide-react';
// ইমপোর্ট পাথগুলো আপনার প্রজেক্ট অনুযায়ী চেক করুন
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard, PageHeader, StatusBadge, DataTable } from '@/components/shared';

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const r = await api.get('/users/dashboard');
      return r.data.data;
    },
  });

  // যদি API কল ফেইল করে (যেমন ৪MD৪ এরর)
  if (isError) return (
    <div className="p-10 text-center">
      <p className="text-red-500">Failed to load dashboard data. Please check your API URL.</p>
    </div>
  );

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

  // ডিফল্ট ভ্যালু হ্যান্ডেল করা
  const pendingCount = data?.pendingApprovals ?? 0;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <PageHeader
        title="Dashboard"
        description="Platform overview"
        action={pendingCount > 0 ? (
          <Link href="/admin/users?status=pending"
            className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-500/20 transition-colors">
            <Clock className="h-4 w-4" />
            {pendingCount} Pending Approvals
          </Link>
        ) : undefined}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"   value={data?.totalUsers ?? 0}       icon={<Users className="h-5 w-5" />}         color="text-primary" />
        <StatCard label="Courses"       value={data?.totalCourses ?? 0}     icon={<BookOpen className="h-5 w-5" />}      color="text-emerald-500" />
        <StatCard label="Enrollments"   value={data?.totalEnrollments ?? 0} icon={<GraduationCap className="h-5 w-5" />} color="text-amber-500" />
        <StatCard label="Quiz Attempts" value={data?.totalAttempts ?? 0}    icon={<FileText className="h-5 w-5" />}      color="text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations Card */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <Link href="/admin/users" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: 'user', label: 'User', render: (u: any) => (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {u.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                )},
                { key: 'role',   label: 'Role',   render: (u: any) => <StatusBadge status={u.role?.toLowerCase()} /> },
                { key: 'status', label: 'Status', render: (u: any) => <StatusBadge status={u.status} /> },
              ]}
              data={data?.recentUsers || []}
            />
          </CardContent>
        </Card>

        {/* Recent Courses Card */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Courses</CardTitle>
              <Link href="/admin/courses" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: 'title', label: 'Course', render: (c: any) => (
                  <p className="font-medium text-foreground truncate max-w-[180px] px-4 py-2 text-sm">{c.title}</p>
                )},
                { key: 'instructor', label: 'Instructor', render: (c: any) => (
                  <span className="text-xs text-muted-foreground px-2">{c.instructor_name || 'N/A'}</span>
                )},
                { key: 'status', label: 'Status', render: (c: any) => <StatusBadge status={c.status} /> },
              ]}
              data={data?.recentCourses || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}