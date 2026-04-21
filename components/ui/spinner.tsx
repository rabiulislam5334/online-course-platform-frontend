// src/components/ui/spinner.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Spinner{
  className?: string;
}

export function Spinner({ className }: Spinner) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-current", className)} />
  );
}