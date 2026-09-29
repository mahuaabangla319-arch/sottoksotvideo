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
      <div style={{height:"100vh", width:"100vw", background:"#020617", display:"flex", alignItems:"center", justifyContent:"center", position:"relative"}}>
        <img src="/613d49fd-735f-4105-b57a-38b75fb3fc02.png" alt="SOT TOK Splash" style={{width:"100%", height:"100%", objectFit:"contain", background:"#020617"}} />
        
        <button 
          onClick={() => setShowSplash(false)}
          style={{position:"absolute", top:"20px", right:"20px", background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid white", padding:"8px 16px", borderRadius:"20px", fontSize:"14px", cursor:"pointer", backdropFilter:"blur(5px)"}}
        >
          Skip X
        </button>

        <div style={{position:"absolute", bottom:"30px", color:"#888", fontSize:"12px"}}>
          5s loading...
        </div>
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