"use client";

import { useState } from "react";
import { useNav } from "@/contexts/NavContext";
import ChatList from "@/components/Chat/ChatList";
import ChatView from "@/components/Chat/ChatView";
import FriendsPanel from "@/components/Friends/FriendsPanel";
import { type Conversation } from "@/lib/messages.api";

export default function HomePage() {
  const { activeView } = useNav();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  if (activeView === "friends") {
    return (
      <div className="flex flex-1 min-h-0">
        <FriendsPanel />
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-80 border-r border-zinc-200 overflow-auto">
        <ChatList selectedId={selectedConv?.id} onSelect={setSelectedConv} />
      </div>
      <div className="flex-1 overflow-auto">
        {selectedConv ? (
          <ChatView conversation={selectedConv} />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            Selecciona una conversación
          </div>
        )}
      </div>
    </div>
  );
}
