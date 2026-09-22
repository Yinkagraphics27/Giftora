import { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  framed?: boolean;
}

/**
 * AppShell — full-width responsive wrapper.
 * Content is centered with a max-width on large screens (like Amazon/Jiji desktop).
 * No phone frame.
 */
export function MobileShell({ children }: MobileShellProps) {
  return <div className="min-h-screen bg-canvas-50">{children}</div>;
}