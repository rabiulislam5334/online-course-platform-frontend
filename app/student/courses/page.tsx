'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, BookOpen, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce'; // একটি কাস্টম হুক (নিচে বুঝিয়ে দিচ্ছি)

// UI Components
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Shared Components
import { PageHeader, CourseCard, EmptyState } from '@/components/shared';

export default function StudentCoursesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [pricing, setPricing] = useState('all');
  
  // ১. সার্চে দেবোন্স (Debounce) ব্যবহার করা যাতে প্রতি কি-স্ট্রোকে API কল না হয়
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['public-courses', debouncedSearch, difficulty, pricing],
    queryFn: () => api.get('/courses', { 
      params: { 
        search: debouncedSearch, 
        difficulty: difficulty === 'all' ? '' : difficulty, 
        pricing: pricing === 'all' ? '' : pricing 
      } 
    }).then(r => r.data.data),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data.data),
  });

  const enrolledIds = new Set(enrollments?.map((e: any) => e.course_id));

  // ২. ইনডেক্সড মিউটেশন (Loading state নির্দিষ্ট কার্ডের জন্য)
  const [activeEnrollId, setActiveEnrollId] = useState<number | null>(null);

  const enroll = useMutation({
    mutationFn: (course_id: number) => {
      setActiveEnrollId(course_id);
      return api.post('/enrollments', { course_id });
    },
    onSuccess: () => { 
      toast.success('Successfully enrolled in course!'); 
      qc.invalidateQueries({ queryKey: ['my-enrollments'] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Enrollment failed'),
    onSettled: () => setActiveEnrollId(null),
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Explore Courses" 
        description="Expand your skills with our wide range of professional courses." 
      />

      {/* ৩. উন্নত ফিল্টার সেকশন */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="What do you want to learn today?" 
            className="pl-10 bg-background border-none ring-1 ring-border focus-visible:ring-primary" 
          />
        </div>

        <div className="flex gap-2">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pricing} onValueChange={setPricing}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20">
            <EmptyState 
              icon={<BookOpen className="h-16 w-16 text-muted-foreground/20" />} 
              title="No courses found" 
              description="We couldn't find any courses matching your current filters. Try different keywords or reset filters." 
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((c: any) => (
            <CourseCard
              key={c.id}
              course={c}
              isEnrolled={enrolledIds.has(c.id)}
              onEnroll={() => enroll.mutate(c.id)}
              // ৪. শুধুমাত্র যে কার্ডে ক্লিক করা হয়েছে তাতে লোডার দেখাবে
              enrolling={activeEnrollId === c.id} 
            />
          ))}
        </div>
      )}
    </div>
  );
}