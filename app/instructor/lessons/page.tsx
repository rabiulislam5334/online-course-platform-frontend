'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, ChevronUp, ChevronDown, FileText, Loader2, Video, Paperclip } from 'lucide-react';
import { useForm } from 'react-hook-form';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';

export default function InstructorLessonsPage() {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState<any>(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  // 1. Fetch Courses
  const { data: courses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => api.get('/courses/my').then(r => r.data.data),
  });

  // 2. Fetch Lessons for Selected Course
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', selectedCourse],
    queryFn: () => api.get(`/lessons/course/${selectedCourse}`).then(r => r.data.data),
    enabled: !!selectedCourse,
  });

  // 3. Mutations
  const createLesson = useMutation({
    mutationFn: (fd: FormData) => api.post('/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { 
      toast.success('Lesson created'); 
      reset(); 
      setShowForm(false); 
      qc.invalidateQueries({ queryKey: ['lessons', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create lesson'),
  });

  const updateLesson = useMutation({
    mutationFn: ({ id, fd }: any) => api.put(`/lessons/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { 
      toast.success('Lesson updated'); 
      setEditLesson(null); 
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['lessons', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const deleteLesson = useMutation({
    mutationFn: (id: number) => api.delete(`/lessons/${id}`),
    onSuccess: () => { 
      toast.success('Lesson deleted'); 
      qc.invalidateQueries({ queryKey: ['lessons', selectedCourse] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message),
  });

  const reorder = useMutation({
    mutationFn: (orders: any[]) => api.patch('/lessons/reorder', { orders }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', selectedCourse] }),
  });

  const moveLesson = (idx: number, dir: -1 | 1) => {
    if (!lessons) return;
    const ordered = [...lessons].sort((a: any, b: any) => a.order_index - b.order_index);
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    
    const orders = ordered.map((l: any, i: number) => {
      if (i === idx) return { id: l.id, order_index: ordered[target].order_index };
      if (i === target) return { id: l.id, order_index: ordered[idx].order_index };
      return { id: l.id, order_index: l.order_index };
    });
    reorder.mutate(orders);
  };

  const onSubmit = (data: any) => {
    const fd = new FormData();
    if (selectedCourse) fd.append('course_id', String(selectedCourse));
    Object.entries(data).forEach(([k, v]) => { 
      if (v !== undefined && v !== null && k !== 'file') fd.append(k, v as string); 
    });
    if (data.file?.[0]) fd.append('file', data.file[0]);
    
    if (editLesson) updateLesson.mutate({ id: editLesson.id, fd });
    else createLesson.mutate(fd);
  };

  const openEdit = (l: any) => {
    setEditLesson(l);
    reset({
      title: l.title,
      content: l.content,
      video_url: l.video_url,
      is_free_preview: l.is_free_preview,
    });
    setShowForm(true);
  };

  const sortedLessons = lessons ? [...lessons].sort((a: any, b: any) => a.order_index - b.order_index) : [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Course Lessons</h1>
          <p className="text-sm text-muted-foreground">Manage and organize your lessons.</p>
        </div>
        {selectedCourse && (
          <Button onClick={() => { reset(); setEditLesson(null); setShowForm(true); }} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />Add New Lesson
          </Button>
        )}
      </div>

      {/* Course selector */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Course</Label>
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
              value={selectedCourse || ''} 
              onChange={e => setSelectedCourse(Number(e.target.value) || null)}
            >
              <option value="">— Choose a course to manage lessons —</option>
              {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : sortedLessons.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">No lessons found in this course.</p>
              <Button variant="link" onClick={() => setShowForm(true)} className="mt-2 text-primary">
                Add your first lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedLessons.map((l: any, idx: number) => (
              <Card key={l.id} className="group hover:border-primary/30 transition-all shadow-sm overflow-hidden">
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 border-r pr-4 border-border/40">
                    <button 
                      onClick={() => moveLesson(idx, -1)} 
                      disabled={idx === 0 || reorder.isPending} 
                      className="text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => moveLesson(idx, 1)} 
                      disabled={idx === sortedLessons.length - 1 || reorder.isPending} 
                      className="text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Index number */}
                  <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {l.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {l.is_free_preview && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] py-0 font-bold uppercase tracking-tighter">
                          Free Preview
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        {l.video_url && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>}
                        {l.file_url && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> Materials</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(l)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => { if(confirm('Delete this lesson permanently?')) deleteLesson.mutate(l.id); }} 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Lesson Modal */}
      <Modal 
        open={showForm} 
        onClose={() => { setShowForm(false); setEditLesson(null); reset(); }} 
        title={editLesson ? 'Edit Lesson' : 'Add New Lesson'} 
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Lesson Title *</Label>
            <Input {...register('title',{required:true})} placeholder="e.g. Introduction to React Hooks" />
          </div>
          
          <div className="space-y-2">
            <Label>Content / Description</Label>
            <Textarea 
              {...register('content')} 
              placeholder="What will students do in this lesson?" 
              rows={4} 
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input {...register('video_url')} placeholder="YouTube/Vimeo link" />
            </div>
            <div className="space-y-2">
              <Label>Attach Resource File</Label>
              <Input {...register('file')} type="file" className="cursor-pointer file:text-primary file:font-semibold" />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all mt-2">
            <input {...register('is_free_preview')} type="checkbox" className="h-4 w-4 accent-primary rounded" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Mark as Free Preview</span>
              <span className="text-xs text-muted-foreground">Students can watch this lesson without enrolling in the course.</span>
            </div>
          </label>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button variant="ghost" type="button" onClick={() => { setShowForm(false); setEditLesson(null); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLesson.isPending || updateLesson.isPending} className="min-w-[140px] font-bold shadow-md">
              {createLesson.isPending || updateLesson.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : editLesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}