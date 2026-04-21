'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

// UI Components - আলাদা ইম্পোর্ট
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  // 1. Fetch Course Data
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data.data),
  });

  // 2. Set Initial Form Values
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        price: course.price,
      });
    }
  }, [course, reset]);

  // 3. Update Mutation
  const update = useMutation({
    mutationFn: (fd: FormData) => 
      api.put(`/courses/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { 
      toast.success('Course updated successfully!'); 
      qc.invalidateQueries({ queryKey: ['instructor-courses'] }); 
      qc.invalidateQueries({ queryKey: ['course', id] });
      router.push('/instructor/courses'); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const onSubmit = (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { 
      if (v !== undefined && v !== null && k !== 'thumbnail') {
        fd.append(k, v as string); 
      }
    });
    if (data.thumbnail?.[0]) {
      fd.append('thumbnail', data.thumbnail[0]);
    }
    update.mutate(fd);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-secondary">
          <Link href="/instructor/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Course</h1>
          <p className="text-sm text-muted-foreground">Modify your course details and settings.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/10">
          <CardTitle className="text-lg">Course Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input 
                id="title"
                {...register('title', { required: true })} 
                placeholder="e.g. Master Next.js 14" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                {...register('description')} 
                placeholder="Describe what students will learn..." 
                rows={5} 
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} placeholder="e.g. Programming" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select 
                  id="difficulty"
                  {...register('difficulty')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price"
                  {...register('price')} 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00 for Free"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Update Thumbnail</Label>
                <Input 
                  id="thumbnail"
                  {...register('thumbnail')} 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer file:text-primary file:font-semibold" 
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-border/50">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => router.back()}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={update.isPending}
                className="min-w-[140px] font-bold shadow-md"
              >
                {update.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}