'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Timer, CheckCircle, XCircle, Award, AlertCircle, ChevronRight, RotateCcw, FileText } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function StudentQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);

  // ১. ডাটা ফেচিং
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz-student', id],
    queryFn: () => api.get(`/quizzes/course/${id}`).then(r => r.data.data).catch(() => null),
  });

  const { data: myAttempts } = useQuery({
    queryKey: ['my-attempts', id],
    queryFn: () => api.get(`/quizzes/${id}/my-attempts`).then(r => r.data.data),
  });

  // ২. সাবমিশন মিউটেশন
  const submit = useMutation({
    mutationFn: (answersArr: any[]) => api.post(`/quizzes/${id}/attempt`, { answers: answersArr }),
    onSuccess: (res) => {
      setResult(res.data.data);
      setStarted(false);
      qc.invalidateQueries({ queryKey: ['my-attempts', id] });
      qc.invalidateQueries({ queryKey: ['course-progress'] });
      toast.success('Quiz submitted successfully!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const handleSubmit = useCallback(() => {
    if (!quiz?.questions || submit.isPending) return;
    const answersArr = quiz.questions.map((q: any) => ({
      question_id: q.id,
      selected_option: answers[q.id] || null,
    }));
    submit.mutate(answersArr);
  }, [quiz, answers, submit]);

  // ৩. টাইমার লজিক
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, handleSubmit]);

  const startQuiz = () => {
    if (!quiz) return;
    setAnswers({});
    setResult(null);
    setTimeLeft((quiz.time_limit_min || 30) * 60);
    setStarted(true);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerPct = quiz ? (timeLeft / (quiz.time_limit_min * 60)) * 100 : 100;

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 p-6">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  );

  if (!quiz) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
      <h2 className="text-xl font-bold">No Quiz Available</h2>
      <p className="text-sm text-muted-foreground mb-6">This course doesn't have an active quiz yet.</p>
      <Button onClick={() => router.back()} variant="outline">Go Back</Button>
    </div>
  );

  // --- RESULT SCREEN ---
  if (result) return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
      <Card className="border-none shadow-xl ring-1 ring-border/50 overflow-hidden">
        <div className={cn(
          "py-12 text-center text-white",
          result.is_passed ? "bg-emerald-600" : "bg-destructive"
        )}>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30">
            {result.is_passed ? <Award className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>
          <h2 className="text-3xl font-black">{result.is_passed ? 'Congratulations! 🎉' : 'Keep Practicing!'}</h2>
          <p className="text-white/80 font-medium">You scored {result.score}% in this attempt</p>
        </div>
        
        <CardContent className="py-8 grid grid-cols-3 gap-4 border-b">
          <div className="text-center border-r">
            <p className="text-2xl font-bold">{result.correct_count}/{result.total_questions}</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground">Correct</p>
          </div>
          <div className="text-center border-r">
            <p className="text-2xl font-bold">{result.pass_percentage}%</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground">Passing Score</p>
          </div>
          <div className="text-center">
            <p className={cn("text-2xl font-bold", result.is_passed ? "text-emerald-600" : "text-destructive")}>
              {result.is_passed ? 'PASS' : 'FAIL'}
            </p>
            <p className="text-[10px] uppercase font-black text-muted-foreground">Status</p>
          </div>
        </CardContent>

        <CardContent className="p-6 bg-muted/30 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="font-bold" onClick={() => setResult(null)}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
          {result.is_passed && (
            <Button className="font-bold bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/student/certificates">
                <Award className="h-4 w-4 mr-2" /> View Certificate
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Detailed Review
        </h3>
        {result.graded_answers?.map((a: any, i: number) => (
          <Card key={a.question_id} className={cn(
            "border-l-4 transition-all hover:translate-x-1",
            a.is_correct ? 'border-l-emerald-500' : 'border-l-destructive'
          )}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className={cn(
                  "h-6 w-6 rounded-full shrink-0 flex items-center justify-center mt-0.5",
                  a.is_correct ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  {a.is_correct ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-foreground leading-tight">{a.question_text}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <p className="text-[11px] font-medium">
                      <span className="text-muted-foreground uppercase">Your Choice:</span>{' '}
                      <span className={a.is_correct ? "text-emerald-600" : "text-destructive"}>
                        Option {a.selected_option?.toUpperCase() || 'N/A'}
                      </span>
                    </p>
                    {!a.is_correct && (
                      <p className="text-[11px] font-medium">
                        <span className="text-muted-foreground uppercase">Correct Answer:</span>{' '}
                        <span className="text-emerald-600 font-bold">Option {a.correct_option?.toUpperCase()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // --- QUIZ TAKING ---
  if (started) return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-32">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
             <div className="flex justify-between items-end mb-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Remaining Time</p>
                <span className={cn(
                  "font-mono font-bold text-xl tabular-nums",
                  timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"
                )}>
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
             </div>
             <Progress value={timerPct} className={cn("h-2.5", timeLeft < 60 ? "bg-destructive/20" : "")} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions?.map((q: any, i: number) => (
          <Card key={q.id} className={cn(
            "transition-all duration-300",
            answers[q.id] ? "ring-1 ring-primary/30 bg-primary/5" : ""
          )}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-4">
                  <p className="font-bold text-foreground text-base md:text-lg leading-snug">
                    {q.question_text}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                          answers[q.id] === opt
                            ? "border-primary bg-background shadow-md shadow-primary/10"
                            : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-black",
                          answers[q.id] === opt ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                        )}>
                          {opt.toUpperCase()}
                        </div>
                        <span className={cn("text-sm font-bold", answers[q.id] === opt ? "text-primary" : "")}>
                          {q[`option_${opt}`]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* সাবমিট ফ্লোটিং বার */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-30 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">
              {Object.keys(answers).length} of {quiz.questions?.length} Answered
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
              Progress: {Math.round((Object.keys(answers).length / quiz.questions?.length) * 100)}%
            </p>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={submit.isPending} 
            size="lg" 
            className="px-10 font-black shadow-lg shadow-primary/20"
          >
            {submit.isPending ? 'Submitting...' : 'Finish Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );

  // --- PRE-QUIZ SCREEN ---
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-4 pb-20">
      <Card className="border-none shadow-xl ring-1 ring-border/50">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black">{quiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Please read the instructions carefully before starting.</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Questions', value: quiz.questions?.length || 0, icon: <FileText className="h-3 w-3" /> },
              { label: 'Time Limit', value: `${quiz.time_limit_min} min`, icon: <Timer className="h-3 w-3" /> },
              { label: 'Pass Score', value: `${quiz.pass_percentage}%`, icon: <CheckCircle className="h-3 w-3" /> },
              { label: 'Attempts Left', value: quiz.max_attempts - (myAttempts?.length || 0), icon: <RotateCcw className="h-3 w-3" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-secondary/40 rounded-xl p-4 border border-border/50 text-center group hover:bg-secondary transition-colors">
                <p className="text-xl font-black text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-center gap-1">
                  {icon} {label}
                </p>
              </div>
            ))}
          </div>

          {myAttempts && myAttempts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Attempt History</h4>
              <div className="space-y-2">
                {myAttempts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-2 w-2 rounded-full", a.is_passed ? "bg-emerald-500" : "bg-destructive")} />
                      <span className="text-xs font-bold">{new Date(a.attempted_at).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={a.is_passed ? 'success' : 'destructive'} className="font-black">
                      {a.score}% • {a.is_passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            {myAttempts && myAttempts.length >= quiz.max_attempts ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-bold italic">You have reached the maximum number of attempts allowed for this quiz.</p>
              </div>
            ) : (
              <Button className="w-full h-14 text-lg font-black shadow-lg shadow-primary/25" onClick={startQuiz}>
                Start Quiz <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}