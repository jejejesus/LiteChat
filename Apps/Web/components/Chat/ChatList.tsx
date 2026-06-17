"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { getUserConversations, type Conversation } from "@/lib/messages.api";
import { useAuth } from "@/contexts/AuthContext";
import { useSignalR } from "@/contexts/SignalRContext";
import type { MessagePayload } from "@/lib/signalr";

interface ChatListProps {
  selectedId?: string | null;
  onSelect: (conv: Conversation) => void;
}

export default function ChatList({ selectedId, onSelect }: ChatListProps) {
  const { user } = useAuth();
  const signalr = useSignalR();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  // ── Escuchar mensajes en tiempo real y actualizar la lista ──
  useEffect(() => {
    const handler = (payload: MessagePayload) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== payload.conversationId) return c;

          const unreadDelta = payload.senderUserId !== user?.userId ? 1 : 0;

          return {
            ...c,
            lastMessage: {
              id: payload.id,
              conversationId: payload.conversationId,
              senderUserId: payload.senderUserId,
              senderName: payload.senderName,
              senderAvatarUrl: payload.senderAvatarUrl,
              type: payload.type as any,
              body: payload.body,
              createdAt: payload.createdAt,
              editedAt: null,
              isEdited: false,
              attachments: [],
            },
            unreadCount: c.unreadCount + unreadDelta,
            updatedAt: payload.createdAt,
          };
        });

        // Reordenar: la conversación con mensaje nuevo al inicio
        const idx = updated.findIndex((c) => c.id === payload.conversationId);
        if (idx > 0) {
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
        }

        return updated;
      });
    };

    signalr.on("MessageReceived", handler);
    return () => signalr.off("MessageReceived", handler);
  }, [user?.userId, signalr]);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await getUserConversations();
      setConversations(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Conversaciones
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <HugeiconsIcon
              icon={Loading03Icon}
              className="animate-spin text-primary"
              size={24}
            />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">
            No hay conversaciones
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors hover:bg-zinc-100 cursor-pointer ${
                selectedId === conv.id
                  ? "bg-primary/10 border-l-3 border-primary"
                  : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon
                  icon={Message01Icon}
                  size={18}
                  className="text-secondary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {conv.name}
                  </span>
                  <span className="text-xs text-zinc-400 shrink-0">
                    {conv.lastMessage
                      ? new Date(
                          conv.lastMessage.createdAt,
                        ).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400 truncate">
                    {conv.lastMessage?.body ?? "Sin mensajes"}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
