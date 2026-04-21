'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Send, BookOpen, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

// UI Components - আলাদা ইম্পোর্ট
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Shared Components
import { Modal } from '@/components/ui/modal';
import { PageHeader, StatusBadge, EmptyState } from '@/components/shared';

export default function InstructorCoursesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // 1. Fetch My Courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => api.get('/courses/my').then(r => r.data.data),
  });

  // 2. Create Course Mutation
  const createCourse = useMutation({
    mutationFn: (fd: FormData) => 
      api.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { 
      toast.success('Course created!'); 
      reset(); 
      setShowForm(false); 
      qc.invalidateQueries({ queryKey: ['instructor-courses'] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create'),
  });

  // 3. Delete Course Mutation
  const deleteCourse = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => { 
      toast.success('Course deleted'); 
      qc.invalidateQueries({ queryKey: ['instructor-courses'] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  // 4. Submit for Review Mutation
  const submitCourse = useMutation({
    mutationFn: (id: number) => api.patch(`/courses/${id}/submit`),
    onSuccess: () => { 
      toast.success('Submitted for review!'); 
      qc.invalidateQueries({ queryKey: ['instructor-courses'] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const onSubmit = (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { 
      if (v && k !== 'thumbnail') fd.append(k, v as string); 
    });
    if (data.thumbnail?.[0]) fd.append('thumbnail', data.thumbnail[0]);
    createCourse.mutate(fd);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Courses"
        description="Create and manage your course content"
        action={
          <Button onClick={() => setShowForm(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />New Course
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <EmptyState 
              icon={<BookOpen className="h-12 w-12 text-muted-foreground/40" />} 
              title="No courses yet" 
              description="Create your first course to start sharing your knowledge."
              action={
                <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />Create First Course
                </Button>
              } 
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c: any) => (
            <Card key={c.id} className="group hover:border-primary/30 transition-all shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                      <span className="bg-secondary px-2 py-0.5 rounded capitalize">{c.category || 'Uncategorized'}</span>
                      <span>•</span>
                      <span className="capitalize">{c.difficulty}</span>
                      <span>•</span>
                      <span className="text-foreground font-bold">{c.price == 0 ? 'Free' : `$${c.price}`}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {c.description || 'No description provided for this course.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <p className="text-xs font-bold text-primary">
                    {c.enrollment_count || 0} students enrolled
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Link href={`/instructor/courses/${c.id}`}><Edit2 className="h-4 w-4" /></Link>
                    </Button>
                    
                    {c.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => submitCourse.mutate(c.id)}
                        disabled={submitCourse.isPending}
                      >
                        {submitCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                        Submit
                      </Button>
                    )}

                    {(c.status === 'draft' || c.status === 'rejected') && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => { if(confirm('Delete this course?')) deleteCourse.mutate(c.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Form Modal */}
      <Modal 
        open={showForm} 
        onClose={() => { setShowForm(false); reset(); }} 
        title="Create New Course" 
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Course Title *</Label>
            <Input {...register('title',{required:true})} placeholder="e.g. Modern Web Development" />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              {...register('description')}
              placeholder="What will students learn in this course?" 
              rows={4} 
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input {...register('category')} placeholder="e.g. Design, Business" />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <select 
                {...register('difficulty')} 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input {...register('price')} type="number" min="0" step="0.01" placeholder="0 = Free" />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <Input {...register('thumbnail')} type="file" accept="image/*" className="cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="ghost" type="button" onClick={() => { setShowForm(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCourse.isPending} className="min-w-[120px]">
              {createCourse.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}