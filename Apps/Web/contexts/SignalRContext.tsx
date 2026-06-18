"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import * as signalr from "@/lib/signalr";

interface SignalRContextType {
  connected: boolean;
  joinConversation: (id: string) => Promise<void>;
  leaveConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, body: string, type?: string, parentMessageId?: string | null) => Promise<void>;
  sendTyping: (conversationId: string, isTyping: boolean) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  on: typeof signalr.on;
  off: typeof signalr.off;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      signalr.disconnect();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnected(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    signalr.connect(token).then(() => setConnected(true)).catch((err) => {
      console.error("SignalR connection failed:", err);
    });

    const onState = (state: string) => {
      setConnected(state === "connected");
    };
    signalr.on("ConnectionState", onState);
    return () => {
      signalr.off("ConnectionState", onState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const joinConversation = useCallback(async (id: string) => {
    if (connected) await signalr.joinConversation(id);
  }, [connected]);

  const leaveConversation = useCallback(async (id: string) => {
    if (connected) await signalr.leaveConversation(id);
  }, [connected]);

  const sendMessage = useCallback(async (
    conversationId: string,
    body: string,
    type?: string,
    parentMessageId?: string | null,
  ) => {
    if (connected) await signalr.sendMessage(conversationId, body, type, parentMessageId);
  }, [connected]);

  const sendTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (connected) await signalr.sendTyping(conversationId, isTyping);
  }, [connected]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (connected) await signalr.markAsRead(conversationId);
  }, [connected]);

  return (
    <SignalRContext.Provider
      value={{
        connected,
        joinConversation,
        leaveConversation,
        sendMessage,
        sendTyping,
        markAsRead,
        on: signalr.on,
        off: signalr.off,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used within a SignalRProvider");
  return ctx;
}
