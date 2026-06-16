"use client";

import { useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  MailSend01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import {
  getConversationMessages,
  sendMessage,
  type Conversation,
  type Message,
} from "@/lib/messages.api";

interface ChatViewProps {
  conversation: Conversation;
}

export default function ChatView({ conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getConversationMessages(conversation.id);
      setMessages(data.reverse());
    } catch {
      console.error("Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(conversation.id, body);
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch {
      console.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-200 bg-white">
        <h2 className="text-sm font-semibold text-foreground">
          {conversation.name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-primary" size={24} />
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
              className="flex items-start gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-secondary">
                  {msg.senderName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-700">{msg.body}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
