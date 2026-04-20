'use client';
import { Badge } from '@/components/ui/badge'; 
import { cn } from '@/lib/utils';

// স্ট্যাটাস কনফিগারেশন
const statusMap: Record<string, { className: string; label: string }> = {
  active:         { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20', label: 'Active' },
  published:      { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20', label: 'Published' },
  free:           { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20', label: 'Free' },
  
  pending:        { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20', label: 'Pending' },
  pending_review: { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20', label: 'In Review' },
  
  rejected:       { className: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20', label: 'Rejected' },
  unpublished:    { className: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20', label: 'Unpublished' },
  
  suspended:      { className: 'bg-muted text-muted-foreground border-border', label: 'Suspended' },
  draft:          { className: 'bg-muted text-muted-foreground border-border', label: 'Draft' },
  
  paid:           { className: 'bg-primary/10 text-primary border-primary/20', label: 'Paid' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // কনফিগারেশন না পাওয়া গেলে ডিফল্ট স্টাইল
  const config = statusMap[status?.toLowerCase()] ?? { 
    className: 'bg-secondary text-secondary-foreground', 
    label: status 
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "capitalize font-semibold text-[10px] tracking-wide px-2 py-0.5 rounded-full transition-colors", 
        config.className, 
        className
      )}
    >
      {config.label}
    </Badge>
  );
}