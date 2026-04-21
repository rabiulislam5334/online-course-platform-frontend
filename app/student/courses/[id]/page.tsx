'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CheckCircle, Circle, BookOpen, Play, FileText, ChevronRight, Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function StudentCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['course-progress', id],
    queryFn: () => api.get(`/enrollments/course/${id}/progress`).then(r => r.data.data),
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz-course', id],
    queryFn: () => api.get(`/quizzes/course/${id}`).then(r => r.data.data).catch(() => null),
  });

  // ১. লেসন কমপ্লিট করার মিউটেশন আপডেট
  const markComplete = useMutation({
    mutationFn: (lesson_id: number) => api.post(`/lessons/${lesson_id}/complete`),
    onSuccess: (_, lesson_id) => {
      toast.success('Lesson marked as completed!');
      // লোকাল স্টেট আপডেট করা যাতে রিফ্রেশ ছাড়াই টিক মার্ক দেখা যায়
      setActiveLesson((prev: any) => ({ ...prev, is_completed: true }));
      qc.invalidateQueries({ queryKey: ['course-progress', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update progress'),
  });

  // ২. প্রথম ইনকমপ্লিট লেসনটি অটো-সিলেক্ট করা (প্রথমবার লোড হওয়ার সময়)
  useEffect(() => {
    if (progress?.lessons && !activeLesson) {
      const firstIncomplete = progress.lessons.find((l: any) => !l.is_completed) || progress.lessons[0];
      setActiveLesson(firstIncomplete);
    }
  }, [progress, activeLesson]);

  if (isLoading) return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[500px] rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );

  const lessons = progress?.lessons || [];
  const completedCount = lessons.filter((l: any) => l.is_completed).length;

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6 pb-20">
      {/* হেডার এবং কুইজ সেকশন */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Content</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {lessons.length} Lessons
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {completedCount} Completed
            </span>
          </div>
        </div>
        
        {quiz && (
          <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20">
            <Link href={`/student/quiz/${quiz.id}`}>Take Final Quiz</Link>
          </Button>
        )}
      </div>

      {/* প্রগ্রেস বার */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span>Overall Progress</span>
          <span>{progress?.progress_pct || 0}%</span>
        </div>
        <Progress value={progress?.progress_pct || 0} className="h-2.5" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* লেসন ভিউয়ার (বড় অংশ) */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg leading-tight">{activeLesson.title}</CardTitle>
                
                {!activeLesson.is_completed && (
                  <Button 
                    size="sm" 
                    className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    onClick={() => markComplete.mutate(activeLesson.id)} 
                    disabled={markComplete.isPending}
                  >
                    {markComplete.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Complete
                  </Button>
                )}
              </div>
              
              <CardContent className="p-0">
                {/* ভিডিও প্লেয়ার */}
                {activeLesson.video_url ? (
                  <div className="aspect-video bg-black relative">
                    <iframe 
                      src={activeLesson.video_url.replace('watch?v=','embed/')} 
                      className="absolute inset-0 w-full h-full" 
                      allowFullScreen 
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary/30 flex flex-col items-center justify-center border-b">
                    <FileText className="h-12 w-12 text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Text Based Lesson</p>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* লেসন কন্টেন্ট */}
                  {activeLesson.content && (
                    <div className="prose dark:prose-invert prose-emerald max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {activeLesson.content}
                    </div>
                  )}

                  {/* এটাচমেন্ট ফাইল */}
                  {activeLesson.file_url && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Resources</p>
                          <p className="text-xs text-muted-foreground">Download lesson materials</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={activeLesson.file_url} target="_blank" rel="noopener noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed h-full min-h-[400px] flex flex-col items-center justify-center">
              <Play className="h-16 w-16 text-muted-foreground/10 mb-4" />
              <p className="text-muted-foreground font-medium">Select a lesson to begin your journey</p>
            </Card>
          )}
        </div>

        {/* লেসন লিস্ট (সাইডবার) */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Course Syllabus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {lessons.map((l: any, i: number) => {
                const isActive = activeLesson?.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLesson(l)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isActive ? "bg-white/20 border-white/30" : "bg-muted border-border"
                    )}>
                      {l.is_completed ? (
                        <CheckCircle className={cn("h-4 w-4", isActive ? "text-white" : "text-emerald-500")} />
                      ) : (
                        <span className={cn("text-[10px] font-bold", isActive ? "text-white" : "text-muted-foreground")}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold truncate", isActive ? "text-white" : "text-foreground")}>
                        {l.title}
                      </p>
                      {l.is_free_preview && (
                        <Badge variant="secondary" className="text-[9px] h-4 mt-0.5 font-black uppercase tracking-tighter">
                          Preview
                        </Badge>
                      )}
                    </div>
                    
                    <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}