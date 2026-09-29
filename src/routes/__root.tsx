import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p>Page not found</p>
        <Link to="/" className="text-blue-500">Go Home</Link>
      </div>
    </div>
  );
}

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div style={{height:"100vh", width:"100vw", background:"#020617", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <img src="/613d49fd-735f-4105-b57a-38b75fb3fc02.png" style={{width:"100%", height:"100%", objectFit:"cover"}} />
      </div>
    );
  }

  return (
    <div>
      <HeadContent />
      <AuthProvider>
        <Outlet />
      </AuthProvider>
      <Toaster />
      <Scripts />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});