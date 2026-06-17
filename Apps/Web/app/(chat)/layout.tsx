"use client";

import Menu from "@/components/UI/Menu";
import { NavProvider, useNav } from "@/contexts/NavContext";
import { SignalRProvider } from "@/contexts/SignalRContext";

function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const { activeView, setActiveView } = useNav();
  return (
    <Menu activeView={activeView} onViewChange={setActiveView}>
      {children}
    </Menu>
  );
}

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavProvider>
      <SignalRProvider>
        <ChatLayoutInner>{children}</ChatLayoutInner>
      </SignalRProvider>
    </NavProvider>
  );
}
