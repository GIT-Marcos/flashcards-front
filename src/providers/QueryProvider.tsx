import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ProblemDetail } from '@/types/api.types';

function handleGlobalError(error: unknown) {
  if (error instanceof AxiosError) {
    const problem = error.response?.data as ProblemDetail | undefined;
    if (problem?.detail) {
      toast.error(problem.detail);
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.message) {
      toast.error(error.message);
    }
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: handleGlobalError,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
