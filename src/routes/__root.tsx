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
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      404 - Not Found <br />
      <Link to="/" style={{ color: "blue" }}>
        Go Home
      </Link>
    </div>
  );
}

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);
  const img = "/613d49fd-735f-4105-b57a-38b75fb3fc02.png";

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={img}
          alt="SOT TOK"
          style={{ width: "85%", maxWidth: "400px" }}
        />
        <button
          onClick={() => setShowSplash(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#eee",
            border: "1px solid #ccc",
            padding: "8px 18px",
            borderRadius: "20px",
            fontWeight: "700",
          }}
        >
          Skip X
        </button>
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

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});