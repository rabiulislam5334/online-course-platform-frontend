// src/components/ui/spinner.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ইন্টারফেসের নাম SpinnerProps দিলে ভালো
interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "default"; // size প্রপস যোগ করা হলো
}

export function Spinner({ className, size = "default" }: SpinnerProps) {
  // সাইজ অনুযায়ী ক্লাস নির্ধারণ
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin text-current", 
        sizeClasses[size as keyof typeof sizeClasses], 
        className
      )} 
    />
  );
}