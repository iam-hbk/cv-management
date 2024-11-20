"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      > */}
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
      {/* </ThemeProvider> */}
    </QueryClientProvider>
  );
}
