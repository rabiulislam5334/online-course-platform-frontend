'use client';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  /** 'primary', 'success', 'warning', ব 'destructive' কালার পাস করা যাবে */
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
  trend?: {
    value: string;
    isUp?: boolean;
  };
  className?: string;
}

const variantStyles = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  success: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  warning: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  destructive: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
};

export function StatCard({ 
  label, 
  value, 
  icon, 
  variant = 'primary', 
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:shadow-primary/5",
      className
    )}>
      <div className="flex items-center gap-5">
        {/* Icon Wrapper */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 transition-transform group-hover:scale-110',
          variantStyles[variant]
        )}>
          {/* Lucide icons গুলোর সাইজ কন্ট্রোল করার জন্য */}
          <div className="[&>svg]:h-6 [&>svg]:w-6">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate mb-0.5">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {value ?? '0'}
            </h3>
            
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                trend.isUp 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              )}>
                {trend.isUp ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}