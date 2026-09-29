import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient } from "@tanstack/react-query";

function NotFoundComponent() {
  return <div style={{padding:"50px", textAlign:"center"}}>404 - Not Found <br/><Link to="/" style={{color:"blue"}}>Go Home</Link></div>;
}

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div style={{height:"100vh", width:"100vw", background:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative"}}>
        <img src="/613d49fd-735f-4105-b57a-38b75fb3fc02.png" />`
" alt="SOT TOK Splash" style={{width:"85%", maxWidth:"400px", height:"auto", objectFit:"contain"}} />
        
        <button 
          onClick={() => setShowSplash(false)}
          style={{position:"absolute", top:"20px", right:"20px", background:"rgba(0,0,0,0.08)", color:"#222", border:"1px solid #ccc", padding:"8px 18px", borderRadius:"20px", fontSize:"14px", fontWeight:"700", cursor:"pointer"}}
        >
          Skip ✕
        </button>
      </div>
    );
  }

  return (
    <div>
      <HeadContent />
      <AuthProvider><Outlet /></AuthProvider>
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