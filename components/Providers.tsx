'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // ডেভটুলস যোগ করা হয়েছে
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState ব্যবহার করা হয়েছে যাতে রেন্ডারের মধ্যে QueryClient-এর রেফারেন্স ঠিক থাকে
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ডাটা ৩০ সেকেন্ড পর্যন্ত 'fresh' থাকবে
            staleTime: 30 * 1000, 
            // নেটওয়ার্ক এরর হলে একবার রিট্রাই করবে
            retry: 1,
            // উইন্ডো ফোকাস করলে অটো রি-ফেচ বন্ধ রাখা (অপশনাল, আপনার প্রয়োজন অনুযায়ী)
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ডেভেলপমেন্ট মোডে ডাটা চেক করার জন্য ডেভটুলস খুব কাজে দেয় */}
      <ReactQueryDevtools
       initialIsOpen={false} />
    </QueryClientProvider>
  );
}