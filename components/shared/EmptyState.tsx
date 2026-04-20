'use client';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-secondary/5 p-8 text-center animate-in fade-in zoom-in-95 duration-300',
      className
    )}>
      {/* Icon Wrapper with soft background */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/40 shadow-inner">
        {/* React Node handle korar somoy icon size barate paren */}
        <div className="[&>svg]:h-10 [&>svg]:w-10">
          {icon}
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-[420px] space-y-2 mb-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action Button Section */}
      {action && (
        <div className="animate-in slide-in-from-bottom-2 delay-150 duration-500">
          {action}
        </div>
      )}
    </div>
  );
}