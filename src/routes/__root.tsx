import { useState, useEffect } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            fontWeight: "900",
            background: "linear-gradient(90deg, #00E5FF, #FF00FF, #FFD600, #FF6A00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "2px",
          }}
        >
          SOT TOK
        </h1>
        <p style={{ color: "#888", marginTop: "10px", fontSize: "14px" }}>
          নিজের পরিচয় নিজেই তৈরি করো
        </p>
      </div>
    );
  }

  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
});