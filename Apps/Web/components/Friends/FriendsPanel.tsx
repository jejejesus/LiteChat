"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserAdd01Icon,
  Notification01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Loading03Icon,
  Search01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  searchUsers,
  sendFriendRequest,
  getPendingFriendRequests,
  respondToFriendRequest,
  getFriendsList,
  type UserDTO,
  type FriendRequestDTO,
} from "@/lib/messages.api";

type Tab = "friends" | "pending" | "search";

export default function FriendsPanel() {
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<UserDTO[]>([]);
  const [pending, setPending] = useState<FriendRequestDTO[]>([]);
  const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "friends") loadFriends();
    if (tab === "pending") loadPending();
  }, [tab]);

  async function loadFriends() {
    setLoadingFriends(true);
    try {
      const data = await getFriendsList();
      setFriends(data);
    } catch {
      setError("Error al cargar amigos");
    } finally {
      setLoadingFriends(false);
    }
  }

  async function loadPending() {
    setLoadingPending(true);
    try {
      const data = await getPendingFriendRequests();
      setPending(data);
    } catch {
      setError("Error al cargar solicitudes");
    } finally {
      setLoadingPending(false);
    }
  }

  async function handleSearch() {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const data = await searchUsers(searchQuery.trim());
      setSearchResults(data);
    } catch {
      setError("Error al buscar usuarios");
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(userId: string) {
    setSendingTo(userId);
    setError(null);
    try {
      await sendFriendRequest(userId);
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSendingTo(null);
    }
  }

  async function handleRespond(requestId: string, status: "Accepted" | "Rejected") {
    setResponding(requestId);
    setError(null);
    try {
      await respondToFriendRequest(requestId, status);
      setPending((prev) => prev.filter((r) => r.id !== requestId));
      if (status === "Accepted") loadFriends();
    } catch {
      setError("Error al responder solicitud");
    } finally {
      setResponding(null);
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "friends", label: "Amigos", icon: UserGroupIcon },
    { key: "pending", label: "Solicitudes", icon: Notification01Icon },
    { key: "search", label: "Buscar", icon: UserAdd01Icon },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Amigos
        </h2>
      </div>

      <div className="flex border-b border-zinc-200">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors cursor-pointer ${
              tab === key
                ? "text-primary border-b-2 border-primary"
                : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <HugeiconsIcon icon={icon} size={14} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-3 py-2 bg-accent/10 text-accent text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {tab === "friends" && (
          <>
            {loadingFriends ? (
              <div className="flex justify-center py-8">
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-primary" size={24} />
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-zinc-400">
                <HugeiconsIcon icon={UserGroupIcon} size={32} />
                <p className="text-xs mt-2">Sin amigos aún</p>
                <p className="text-[10px]">Busca usuarios para agregar</p>
              </div>
            ) : (
              friends.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={UserCircleIcon} size={16} className="text-secondary" />
                  </div>
                  <span className="text-sm text-foreground">{u.fullName}</span>
                </div>
              ))
            )}
          </>
        )}

        {tab === "pending" && (
          <>
            {loadingPending ? (
              <div className="flex justify-center py-8">
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-primary" size={24} />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-zinc-400">
                <HugeiconsIcon icon={Notification01Icon} size={32} />
                <p className="text-xs mt-2">Sin solicitudes pendientes</p>
              </div>
            ) : (
              pending.map((req) => (
                <div key={req.id} className="flex items-center justify-between px-3 py-2 hover:bg-zinc-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={UserCircleIcon} size={16} className="text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-foreground block truncate">
                        {req.senderName}
                      </span>
                      {req.message && (
                        <span className="text-[10px] text-zinc-400 truncate block">
                          {req.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, "Accepted")}
                      disabled={responding === req.id}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={responding === req.id ? Loading03Icon : CheckmarkCircle02Icon}
                        size={18}
                        className={responding === req.id ? "animate-spin" : ""}
                      />
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "Rejected")}
                      disabled={responding === req.id}
                      className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === "search" && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar por nombre o correo..."
                className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={searchQuery.trim().length < 2 || searching}
                className="p-1.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <HugeiconsIcon
                  icon={searching ? Loading03Icon : Search01Icon}
                  size={16}
                  className={searching ? "animate-spin" : ""}
                />
              </button>
            </div>

            {searchResults.length === 0 && !searching ? (
              <p className="text-xs text-zinc-400 text-center py-4">
                Busca usuarios por nombre o correo
              </p>
            ) : (
              searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-2 py-2 hover:bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={UserCircleIcon} size={16} className="text-secondary" />
                    </div>
                    <span className="text-sm text-foreground truncate">{u.fullName}</span>
                  </div>
                  <button
                    onClick={() => handleSendRequest(u.id)}
                    disabled={sendingTo === u.id}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={sendingTo === u.id ? Loading03Icon : UserAdd01Icon}
                      size={18}
                      className={sendingTo === u.id ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
