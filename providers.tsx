"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen">
          {mounted ? (
            <div className="bg-background text-foreground">
              {children}
              <Toaster richColors position="top-right" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900">{children}</div>
          )}
        </div>
      </QueryClientProvider>
    </ConvexProvider>
  );
}
