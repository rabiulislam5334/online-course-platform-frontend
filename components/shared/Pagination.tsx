'use client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  page, 
  pages, 
  total, 
  limit, 
  onPageChange,
  className 
}: PaginationProps) {
  // যদি টোটাল ডাটা কম থাকে এবং মাত্র ১টা পেজ হয়, তবে নেভিগেশন দেখানোর দরকার নেই
  if (pages <= 1 && total > 0) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 border-t border-border px-4 py-4 sm:px-6",
      className
    )}>
      {/* বাম পাশের ইনফো টেক্সট - মোবাইলে এটি আরও ছোট দেখাবে */}
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Showing <span className="font-medium text-foreground">{from}</span>–
          <span className="font-medium text-foreground">{to}</span> of{' '}
          <span className="font-medium text-foreground">{total}</span>
        </p>
      </div>

      {/* নেভিগেশন বাটন */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-8 w-8 transition-all active:scale-95 disabled:opacity-30"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-secondary/50 border border-border/50">
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {page} <span className="text-muted-foreground/60 font-normal mx-1">/</span> {pages}
            </span>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="h-8 w-8 transition-all active:scale-95 disabled:opacity-30"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}