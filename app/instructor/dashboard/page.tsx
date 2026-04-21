'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Users, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@/components/ui/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Status Variants Mapping
const sv: Record<string, "success" | "outline" | "warning" | "destructive" | "secondary"> = { 
  published: 'success', 
  draft: 'outline', 
  pending_review: 'warning', 
  rejected: 'destructive' 
};

export default function InstructorDashboard() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => api.get('/courses/my').then(r => r.data.data),
  });

  // Safe Reduce to calculate total students
  const totalStudents = Array.isArray(courses) 
    ? courses.reduce((s: number, c: any) => s + (c.enrollment_count || 0), 0) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Instructor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your courses and content</p>
          </div>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />New Course
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="rounded-lg border border-border bg-secondary/50 p-2.5 text-emerald-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold">{courses?.length ?? 0}</p>}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">My Courses</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="rounded-lg border border-border bg-secondary/50 p-2.5 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold">{totalStudents}</p>}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses list */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Courses</CardTitle>
            <Link href="/instructor/courses" className="text-xs font-medium text-primary hover:underline transition-all">
              Manage all courses →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">You haven't created any courses yet.</p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/instructor/courses/new font-medium">Create Your First Course</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 hover:bg-muted/40 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {c.title}
                      </p>
                      <Badge variant={sv[c.status] || 'outline'} className="shrink-0 text-[10px] uppercase tracking-tighter">
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.enrollment_count || 0} Students</span>
                      <span>•</span>
                      <span className="capitalize">{c.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild size="sm" variant="secondary" className="h-8 px-3 text-xs font-bold">
                      <Link href={`/instructor/courses/${c.id}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs font-bold hover:bg-primary/5">
                      <Link href={`/instructor/quizzes/${c.id}`}>Quiz</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}