'use client';
import { Skeleton } from '@/components/ui/skeleton'; 
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonRows?: number;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm leading-6">
        <thead>
          <tr className="border-b border-border bg-secondary/50 transition-colors">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-4 text-left text-xs font-bold uppercase tracking-tight text-muted-foreground',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            // Skeleton rendering with columns intact
            [...Array(skeletonRows)].map((_, i) => (
              <tr key={`skeleton-${i}`} className="animate-pulse">
                {columns.map((col) => (
                  <td key={`skeleton-col-${col.key}`} className="px-4 py-4">
                    <Skeleton className="h-5 w-full rounded-md opacity-60" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-20 text-center text-sm text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="group border-b border-border/40 hover:bg-secondary/20 transition-all duration-200"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-4 text-foreground/90 group-hover:text-foreground',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}