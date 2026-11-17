import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from "@/components/NotificationListener";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center"><h1 className="text-7xl font-bold">404</h1><p className="mt-2 text-sm text-muted-foreground">Page not found</p><Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Go home</Link></div>
    </div>
  );
}
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4"><div className="text-center"><h1 className="text-xl font-semibold">This page didn't load</h1><button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button></div></div>
  );
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" }, { title: "SOT TOK" }, { name: "description", content: "SOT TOK — ভারতের নাম্বার ওয়ান শর্ট ভিডিও অ্যাপ।" }],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "manifest", href: "/manifest.json" }, { rel: "icon", href: "/favicon.png", type: "image/png" }],
  }),
  shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) {
  return (<html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>);
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
        <NotificationListener />
      </AuthProvider>
    </QueryClientProvider>
  );
}