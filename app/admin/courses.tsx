'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, EyeOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Assuming you have a reusable Modal/Dialog component
import { Modal } from '@/components/ui/modal'; 
import { Spinner } from '@/components/ui/spinner';

const statusVariants: Record<string, "success" | "outline" | "warning" | "destructive" | "secondary"> = { 
  published: 'success', 
  draft: 'outline', 
  pending_review: 'warning', 
  rejected: 'destructive', 
  unpublished: 'secondary' 
};


export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rejectModal, setRejectModal] = useState<{id: number; title: string} | null>(null);
  const [remark, setRemark] = useState('');

  // Fetch Courses
  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', search, status],
    queryFn: async () => {
      const response = await api.get('/courses/admin/all', { params: { search, status } });
      return response.data.data;
    },
  });

  // Mutations
  const approve = useMutation({
    mutationFn: (id: number) => api.patch(`/courses/${id}/approve`),
    onSuccess: () => {
      toast.success('Course approved & published');
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Approval failed'),
  });

  const reject = useMutation({
    mutationFn: ({ id, remark }: { id: number; remark: string }) => 
      api.patch(`/courses/${id}/reject`, { remark }),
    onSuccess: () => {
      toast.success('Course rejected');
      setRejectModal(null);
      setRemark('');
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Rejection failed'),
  });

  const unpublish = useMutation({
    mutationFn: (id: number) => api.patch(`/courses/${id}/unpublish`),
    onSuccess: () => {
      toast.success('Course unpublished');
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Course Oversight</h1>
        <Badge variant="outline" className="px-3 py-1">{data?.length || 0} Total Courses</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title or instructor..." 
            className="pl-10 h-10" 
          />
        </div>
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-input bg-card px-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
        >
          <option value="">All Status</option>
          <option value="pending_review">Pending Review</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {/* Table Content */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Course Details', 'Instructor', 'Category', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4"><Skeleton className="h-10 w-full rounded-md" /></td>
                  </tr>
                ))
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-20 text-center text-muted-foreground">No courses found matching your criteria.</td>
                </tr>
              ) : (
                data?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground truncate max-w-[200px]">{c.title}</p>
                      <span className="text-[11px] text-muted-foreground flex gap-2">
                        <span>{c.difficulty}</span> • <span>{c.price === 0 ? 'Free' : `$${c.price}`}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{c.instructor_name}</td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className="font-normal">{c.category || 'N/A'}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariants[c.status] || 'outline'}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {c.status === 'pending_review' && (
                          <>
                            <Button 
                              size="icon" variant="ghost" 
                              onClick={() => approve.mutate(c.id)}
                              className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" variant="ghost" 
                              onClick={() => setRejectModal({id: c.id, title: c.title})}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {c.status === 'published' && (
                          <Button 
                            size="icon" variant="ghost" 
                            onClick={() => unpublish.mutate(c.id)}
                            className="h-8 w-8 text-amber-500 hover:bg-amber-500/10"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal 
        open={!!rejectModal} 
        onClose={() => setRejectModal(null)} 
        title="Reject Course Submission"
      >
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Provide feedback for <span className="font-bold text-foreground">{rejectModal?.title}</span>. 
            The instructor will see this remark.
          </p>
          <textarea 
            value={remark} 
            onChange={e => setRemark(e.target.value)} 
            placeholder="E.g., Please improve audio quality in Module 2..." 
            rows={4}
            className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none" 
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => reject.mutate({ id: rejectModal!.id, remark })} 
              disabled={reject.isPending || !remark.trim()}
              className="min-w-[100px]"
            >
              {reject.isPending ? <Spinner className="mr-2" /> : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}