"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface NavContextType {
  activeView: "chats" | "friends";
  setActiveView: (view: "chats" | "friends") => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<"chats" | "friends">("chats");

  return (
    <NavContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within a NavProvider");
  return ctx;
}
