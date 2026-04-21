'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Award, ArrowRight, GraduationCap, Clock, CircleCheckBig  } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Shared Components - আগের তৈরি করা StatCard ব্যবহার করছি
import { StatCard, PageHeader } from '@/components/shared';

export default function StudentDashboard() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data.data),
  });

  const { data: certs } = useQuery({
    queryKey: ['my-certs'],
    queryFn: () => api.get('/certificates/my').then(r => r.data.data),
  });

  // চলমান কোর্সগুলো আলাদা করা (যেগুলো ০% এর বেশি কিন্তু ১০০% এর কম)
  const activeCourses = enrollments?.filter((e: any) => e.progress_pct > 0 && e.progress_pct < 100) || [];

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6 pb-10">
      <PageHeader 
        title="My Learning" 
        description="Welcome back! Track your progress and continue your education." 
      />

      {/* ১. Stats Section - StatCard ব্যবহার করে */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Enrolled" 
          value={isLoading ? '—' : enrollments?.length ?? 0} 
          icon={<GraduationCap />} 
          variant="primary" 
        />
        <StatCard 
          label="Certificates" 
          value={certs?.length ?? 0} 
          icon={<Award />} 
          variant="warning" 
        />
        {/* অতিরিক্ত স্ট্যাটাস যোগ করা যেতে পারে */}
        <StatCard 
          label="In Progress" 
          value={activeCourses.length} 
          icon={<Clock />} 
          variant="success" 
        />
        <StatCard 
          label="Completed" 
          value={enrollments?.filter((e: any) => e.progress_pct === 100).length || 0} 
          icon={<CircleCheckBig />} 
          variant="primary" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ২. My Courses List (বড় অংশ) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
              <CardTitle className="text-base font-bold">Current Courses</CardTitle>
              <Button asChild size="xs" variant="ghost" className="text-primary hover:bg-primary/5">
                <Link href="/student/courses" className="flex items-center gap-1">
                  Browse All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : enrollments?.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mb-4">You're not enrolled in any courses yet</p>
                  <Button asChild>
                    <Link href="/student/courses">Find your first course</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments?.map((e: any) => (
                    <div 
                      key={e.id} 
                      className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {e.title}
                            </h3>
                            {e.progress_pct === 100 && (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            {e.instructor_name} • <span className="capitalize">{e.difficulty}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4 sm:text-right">
                          <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Progress</p>
                            <p className="text-sm font-bold">{Math.round(e.progress_pct)}%</p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant={e.progress_pct === 100 ? "secondary" : "default"} className="font-bold h-9">
                              <Link href={`/student/courses/${e.course_id}`}>
                                {e.progress_pct === 100 ? 'Review' : (e.progress_pct > 0 ? 'Continue' : 'Start')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                         <Progress value={e.progress_pct} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ৩. Recent Certificates / Achievements (ছোট সাইডবার) */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {!certs || certs.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No certificates yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certs.slice(0, 3).map((c: any) => (
                    <Link 
                      key={c.id} 
                      href="/student/certificates" 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{c.course_title}</p>
                        <p className="text-[10px] text-muted-foreground">Issued: {new Date(c.issued_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* প্রোমোশনাল বা হেল্পফুল কার্ড */}
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Keep it up!</h3>
              <p className="text-xs opacity-90 leading-relaxed mb-4">
                You're doing great. Complete your pending lessons to unlock more certificates.
              </p>
              <Button size="sm" variant="secondary" className="font-bold text-xs" asChild>
                <Link href="/student/courses">Explore New Topics</Link>
              </Button>
            </div>
            <GraduationCap className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}