import { QueryClient } from "@tanstack/react-query";

/**
 * The app's single QueryClient. Provided at the root in app/_layout.tsx.
 * Server state lives here (TanStack Query) — never in useEffect + useState.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // treat data fresh for 30s; realtime invalidation pushes updates sooner
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
