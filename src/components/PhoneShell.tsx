import type { ReactNode } from "react";

export function PhoneShell({
  children,
  className = "",
  withNavPadding = true,
}: {
  children: ReactNode;
  className?: string;
  withNavPadding?: boolean;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] overflow-hidden">
      <div className={`min-h-screen ${withNavPadding ? "pb-[68px]" : ""} ${className}`}>
        {children}
      </div>
    </div>
  );
}
