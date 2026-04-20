'use client';
import Link from 'next/link';
import { BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: {
    id: string | number;
    title: string;
    thumbnail_url?: string;
    instructor_name: string;
    price: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    enrollment_count: number;
    description: string;
  };
  isEnrolled?: boolean;
  onEnroll?: () => void;
  enrolling?: boolean;
  showActions?: boolean;
  actions?: React.ReactNode;
}

// Shadcn er default Badge e 'success' thake na, tai amra custom class use korbo
const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20';
    case 'intermediate':
      return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20';
    case 'advanced':
      return 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20';
    default:
      return '';
  }
};

export function CourseCard({ 
  course: c, 
  isEnrolled, 
  onEnroll, 
  enrolling, 
  showActions = true, 
  actions 
}: CourseCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Thumbnail Section */}
      <div className="relative h-44 bg-secondary/50 border-b border-border/50 overflow-hidden">
        {c.thumbnail_url ? (
          <img 
            src={c.thumbnail_url} 
            alt={c.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted/30">
            <BookOpen className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Price Tag Overlay */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={c.price === 0 ? 'default' : 'outline'} 
            className={cn(
              "backdrop-blur-md shadow-sm font-bold",
              c.price === 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none" : "bg-background/80 text-foreground"
            )}
          >
            {c.price === 0 ? 'FREE' : `$${c.price}`}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-5">
        {/* Course Title */}
        <div className="mb-2">
          <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {c.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">by {c.instructor_name}</p>
        </div>

        {/* Badges & Stats */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] font-semibold uppercase tracking-wider", getDifficultyStyles(c.difficulty))}
          >
            {c.difficulty}
          </Badge>
          
          {c.category && (
            <Badge variant="secondary" className="text-[10px] font-medium opacity-80">
              {c.category}
            </Badge>
          )}

          {c.enrollment_count > 0 && (
            <div className="ml-auto flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{c.enrollment_count} students</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground/80 line-clamp-2 flex-1 mb-5 leading-relaxed">
          {c.description}
        </p>

        {/* Actions Button */}
        {showActions && (
          <div className="mt-auto">
            {actions ? actions : (
              isEnrolled ? (
                <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 shadow-md">
                  <Link href={`/student/courses/${c.id}`}>Continue Learning</Link>
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={onEnroll} 
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enrolling...
                    </span>
                  ) : 'Enroll Now'}
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}