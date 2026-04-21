'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Award, Download, FileCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentCertificatesPage() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { data: certs, isLoading } = useQuery({
    queryKey: ['my-certs'],
    queryFn: () => api.get('/certificates/my').then(r => r.data.data),
  });

  const downloadCert = async (id: number, courseTitle: string) => {
    try {
      setDownloadingId(id);
      
      // ব্লোব (Blob) হিসেবে ডাটা ফেচ করা যাতে অথরাইজেশন টোকেন পাঠানো যায়
      const response = await api.get(`/certificates/${id}/download`, {
        responseType: 'blob',
      });

      // ফাইল ডাউনলোড লিঙ্ক তৈরি
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // ফাইলের নাম সুন্দরভাবে সেট করা
      const fileName = `Certificate-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      // ক্লিনআপ
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          My Certificates
        </h1>
        <p className="text-sm text-muted-foreground">
          Official recognition of your course completions and achievements.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl shadow-sm" />
          ))}
        </div>
      ) : certs?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">No certificates yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Pass your course quizzes with the required score to unlock your official certificates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs?.map((c: any) => (
            <Card key={c.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-amber-500/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <FileCheck className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm leading-tight truncate group-hover:text-amber-700 transition-colors">
                      {c.course_title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                      Instructor: {c.instructor_name}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Score: {c.score}%
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(c.issued_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-5 font-bold text-xs h-9 bg-card hover:bg-amber-500 hover:text-white transition-all"
                  onClick={() => downloadCert(c.id, c.course_title)}
                  disabled={downloadingId === c.id}
                >
                  {downloadingId === c.id ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> Generating...</>
                  ) : (
                    <><Download className="h-3.5 w-3.5 mr-2" /> Download Certificate</>
                  )}
                </Button>
              </CardContent>
              {/* Decorative Background Icon */}
              <Award className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-500/5 rotate-12" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}