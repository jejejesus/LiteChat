"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  MailSend01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import {
  getConversationMessages,
  type Conversation,
  type Message,
} from "@/lib/messages.api";
import { useSignalR } from "@/contexts/SignalRContext";
import { useAuth } from "@/contexts/AuthContext";
import type { MessagePayload, MessagesReadInfo, TypingInfo } from "@/lib/signalr";

interface ChatViewProps {
  conversation: Conversation;
}

export default function ChatView({ conversation }: ChatViewProps) {
  const { user } = useAuth();
  const signalr = useSignalR();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef(user?.userId);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = user?.userId;

  useEffect(() => {
    userIdRef.current = user?.userId;
  }, [user?.userId]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getConversationMessages(conversation.id);
      setMessages(data.slice().reverse());
    } catch {
      console.error("Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }

  // ── Cargar mensajes históricos vía REST ──
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // ── Unirse al grupo SignalR de la conversación ──
  useEffect(() => {
    signalr.joinConversation(conversation.id);
    return () => {
      signalr.leaveConversation(conversation.id);
    };
  }, [conversation.id, signalr]);

  // ── Escuchar mensajes en tiempo real ──
  useEffect(() => {
    const handler = (payload: MessagePayload) => {
      if (payload.conversationId !== conversation.id) return;
      const newMsg: Message = {
        id: payload.id,
        conversationId: payload.conversationId,
        senderUserId: payload.senderUserId,
        senderName: payload.senderName,
        senderAvatarUrl: payload.senderAvatarUrl,
        type: payload.type as Message["type"],
        body: payload.body,
        createdAt: payload.createdAt,
        editedAt: null,
        isEdited: false,
        attachments: [],
        seenAt: null,
      };
      setMessages((prev) => [...prev, newMsg]);
      signalr.markAsRead(conversation.id);
    };

    signalr.on("MessageReceived", handler);
    return () => signalr.off("MessageReceived", handler);
  }, [conversation.id, signalr]);

  // ── Marcar mensajes como leídos al abrir la conversación ──
  useEffect(() => {
    signalr.markAsRead(conversation.id);
  }, [conversation.id, signalr]);

  // ── Escuchar evento MessagesRead para actualizar visto ──
  useEffect(() => {
    const handler = (info: MessagesReadInfo) => {
      if (info.conversationId !== conversation.id) return;
      if (info.userId !== currentUserId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.senderUserId === currentUserId && !msg.seenAt) {
              return { ...msg, seenAt: new Date().toISOString() };
            }
            return msg;
          }),
        );
      }
    };

    signalr.on("MessagesRead", handler);
    return () => signalr.off("MessagesRead", handler);
  }, [conversation.id, currentUserId, signalr]);

  // ── Escuchar indicadores de escritura ──
  useEffect(() => {
    const handler = (info: TypingInfo) => {
      if (info.conversationId !== conversation.id) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (info.isTyping) {
          next.set(info.userId, "escribiendo...");
        } else {
          next.delete(info.userId);
        }
        return next;
      });
    };

    signalr.on("UserTyping", handler);
    return () => signalr.off("UserTyping", handler);
  }, [conversation.id, signalr]);

  // ── Scroll al último mensaje ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;

    // Cancelar typing al enviar
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      signalr.sendTyping(conversation.id, false);
    }

    setSending(true);
    try {
      await signalr.sendMessage(conversation.id, body);
      setText("");
    } catch {
      console.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  }

  const handleTyping = useCallback(
    (value: string) => {
      setText(value);

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      signalr.sendTyping(conversation.id, true);

      typingTimerRef.current = setTimeout(() => {
        signalr.sendTyping(conversation.id, false);
        typingTimerRef.current = null;
      }, 2000);
    },
    [conversation.id, signalr],
  );

  const typingEntries = Array.from(typingUsers.entries()).filter(
    ([id]) => id !== currentUserId,
  );

  return (
    <div className="flex flex-col py-1 px-2 h-full">
      <div className="px-4 py-3 border-b border-zinc-200 bg-white">
        <h2 className="text-sm font-semibold text-foreground">
          {conversation.name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <HugeiconsIcon
              icon={Loading03Icon}
              className="animate-spin text-primary"
              size={24}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <HugeiconsIcon icon={Message01Icon} size={40} />
            <p className="text-sm mt-2">No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.senderUserId === currentUserId ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-secondary">
                  {msg.senderName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div
                className={`flex-1 min-w-0 ${msg.senderUserId === currentUserId ? "text-right" : ""}`}
              >
                <div
                  className={`flex items-baseline gap-2 ${msg.senderUserId === currentUserId ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-xs font-semibold text-foreground">
                    {msg.senderUserId === currentUserId
                      ? "Tú"
                      : msg.senderName}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p
                  className={`text-sm mt-0.5 inline-block px-3 py-1.5 rounded-2xl max-w-[80%] ${
                    msg.senderUserId === currentUserId
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-zinc-100 text-zinc-700 rounded-bl-md"
                  }`}
                >
                  {msg.body}
                </p>
                {msg.senderUserId === currentUserId && msg.seenAt && (
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    Visto
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {typingEntries.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
            <span className="animate-pulse">●</span>
            {typingEntries.map(([, name]) => name).join(", ")}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <HugeiconsIcon
              icon={sending ? Loading03Icon : MailSend01Icon}
              size={18}
              className={sending ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
