'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, HelpCircle, Users, Clock, Target, RotateCcw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Modal } from '@/components/ui/modal';

export default function InstructorQuizzesPage() {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQForm, setShowQForm] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [showAttempts, setShowAttempts] = useState(false);

  // Form hooks
  const { register, handleSubmit, reset } = useForm();
  const { register: rq, handleSubmit: hq, reset: rqreset, setValue: sqv } = useForm();

  // 1. Queries
  const { data: courses } = useQuery({ 
    queryKey: ['instructor-courses'], 
    queryFn: () => api.get('/courses/my').then(r => r.data.data) 
  });

  const { data: quiz, isLoading: qLoading } = useQuery({
    queryKey: ['quiz-course', selectedCourse],
    queryFn: () => api.get(`/quizzes/course/${selectedCourse}`).then(r => r.data.data).catch(() => null),
    enabled: !!selectedCourse,
  });

  const { data: attempts, isLoading: attLoading } = useQuery({
    queryKey: ['quiz-attempts', quiz?.id],
    queryFn: () => api.get(`/quizzes/${quiz?.id}/attempts`).then(r => r.data.data),
    enabled: !!quiz?.id && showAttempts,
  });

  // 2. Mutations
  const createQuiz = useMutation({
    mutationFn: (d: any) => api.post('/quizzes', { ...d, course_id: selectedCourse }),
    onSuccess: () => { 
      toast.success('Quiz created'); 
      setShowQuizForm(false); 
      qc.invalidateQueries({ queryKey: ['quiz-course', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create quiz'),
  });

  const addQuestion = useMutation({
    mutationFn: (d: any) => api.post(`/quizzes/${quiz?.id}/questions`, d),
    onSuccess: () => { 
      toast.success('Question added'); 
      rqreset(); 
      setShowQForm(false); 
      qc.invalidateQueries({ queryKey: ['quiz-course', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message),
  });

  const updateQuestion = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/quizzes/questions/${id}`, d),
    onSuccess: () => { 
      toast.success('Question updated'); 
      setEditQ(null); 
      setShowQForm(false);
      qc.invalidateQueries({ queryKey: ['quiz-course', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message),
  });

  const deleteQuestion = useMutation({
    mutationFn: (id: number) => api.delete(`/quizzes/questions/${id}`),
    onSuccess: () => { 
      toast.success('Question deleted'); 
      qc.invalidateQueries({ queryKey: ['quiz-course', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message),
  });

  // 3. Helpers
  const openEditQ = (q: any) => {
    setEditQ(q);
    ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option'].forEach(k => sqv(k, q[k]));
    setShowQForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Quiz Management</h1>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Course</Label>
          <select 
            className="w-full h-10 mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
            value={selectedCourse || ''} 
            onChange={e => setSelectedCourse(Number(e.target.value) || null)}
          >
            <option value="">— Choose a course to manage quiz —</option>
            {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </CardContent>
      </Card>

      {selectedCourse && (
        qLoading ? <Skeleton className="h-48 w-full rounded-xl" /> :
        !quiz ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium mb-4">No quiz has been created for this course yet.</p>
              <Button onClick={() => setShowQuizForm(true)} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />Create Initial Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quiz Overview Info */}
            <Card className="overflow-hidden border-primary/10 shadow-md">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {quiz.title}
                    <Badge variant="outline" className="ml-2 font-normal">Active</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAttempts(!showAttempts)} className="h-9">
                      <Users className="h-4 w-4 mr-2" />
                      {showAttempts ? 'Hide' : 'View'} Attempts
                    </Button>
                    <Button size="sm" onClick={() => { setShowQForm(true); setEditQ(null); rqreset(); }} className="h-9">
                      <Plus className="h-4 w-4 mr-2" />Add Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time Limit
                    </span>
                    <span className="text-sm font-semibold">{quiz.time_limit_min} Minutes</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" /> Passing Score
                    </span>
                    <span className="text-sm font-semibold">{quiz.pass_percentage}%</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" /> Max Attempts
                    </span>
                    <span className="text-sm font-semibold">{quiz.max_attempts} Times</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> Questions
                    </span>
                    <span className="text-sm font-semibold">{quiz.questions?.length || 0} Total</span>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Questions List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Questions Detail</h3>
                  {quiz.questions?.length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground italic">No questions added yet. Click 'Add Question' to start.</p>
                  ) : (
                    quiz.questions.map((q: any, i: number) => (
                      <div key={q.id} className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-all shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="h-6 w-6 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground">
                            {i+1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground pr-20 leading-relaxed">{q.question_text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                              {['a','b','c','d'].map(opt => (
                                <div 
                                  key={opt} 
                                  className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                                    q.correct_option === opt 
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold' 
                                      : 'bg-muted/30 border-transparent text-muted-foreground'
                                  }`}
                                >
                                  <span className="uppercase opacity-60 font-black">{opt}.</span>
                                  {q[`option_${opt}`]}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => openEditQ(q)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('Permanently delete this question?')) deleteQuestion.mutate(q.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attempts Management */}
            {showAttempts && (
              <Card className="border-border shadow-sm animate-in slide-in-from-top-2 duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Student Performance Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attLoading ? (
                       [...Array(2)].map((_,i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : attempts?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-10 text-center">No students have attempted this quiz yet.</p>
                    ) : (
                      attempts.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/10 p-4 hover:bg-secondary/20 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase">
                              {a.student_name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{a.student_name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {new Date(a.attempted_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-[11px] font-black uppercase ${a.is_passed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-destructive hover:bg-destructive'}`}>
                              {a.score}% · {a.is_passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
      )}

      {/* Modal - Create/Edit Question */}
      <Modal 
        open={showQForm} 
        onClose={() => { setShowQForm(false); setEditQ(null); }} 
        title={editQ ? 'Update Question' : 'Add New Question'} 
        className="max-w-lg"
      >
        <form onSubmit={hq((d) => editQ ? updateQuestion.mutate({id:editQ.id,...d}) : addQuestion.mutate(d))} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Question Statement *</Label>
            <Input {...rq('question_text',{required:true})} placeholder="e.g. What is the virtual DOM in React?" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['a','b','c','d'].map(opt => (
              <div key={opt} className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Option {opt.toUpperCase()}</Label>
                <Input {...rq(`option_${opt}`,{required:true})} placeholder={`Option ${opt.toUpperCase()}`} className="h-9 text-sm" />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <Label>Correct Answer *</Label>
            <select 
              {...rq('correct_option',{required:true})}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Select the correct option</option>
              {['a','b','c','d'].map(o => <option key={o} value={o}>Option {o.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button variant="ghost" type="button" onClick={() => { setShowQForm(false); setEditQ(null); }}>Cancel</Button>
            <Button type="submit" disabled={addQuestion.isPending || updateQuestion.isPending} className="min-w-[120px]">
              {(addQuestion.isPending || updateQuestion.isPending) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : editQ ? 'Update Question' : 'Add to Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Create Quiz */}
      <Modal open={showQuizForm} onClose={() => setShowQuizForm(false)} title="New Quiz Setup" className="max-w-md">
        <form onSubmit={handleSubmit((d) => createQuiz.mutate(d))} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Quiz Title *</Label>
            <Input {...register('title',{required:true})} placeholder="e.g. Intermediate JS Proficiency" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground">Minutes</Label>
              <Input {...register('time_limit_min')} type="number" defaultValue={30} min={1} />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground">Pass %</Label>
              <Input {...register('pass_percentage')} type="number" defaultValue={60} min={1} max={100} />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-bold text-muted-foreground">Attempts</Label>
              <Input {...register('max_attempts')} type="number" defaultValue={3} min={1} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setShowQuizForm(false)}>Cancel</Button>
            <Button type="submit" disabled={createQuiz.isPending}>
              {createQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Now'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}