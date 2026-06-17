"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Settings01Icon,
  UserCircle02Icon,
  Logout04Icon,
  Message01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

import SearchBox from "./SearchBox";
import Button from "./Button";

import LiteChatLogoH from "@/public/LiteChat-Logo-H.png";

interface MenuProps {
  children: ReactNode;
  activeView: "chats" | "friends";
  onViewChange: (view: "chats" | "friends") => void;
}

export default function Menus({
  children,
  activeView,
  onViewChange,
}: MenuProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { key: "chats" as const, label: "Chats", icon: Message01Icon },
    { key: "friends" as const, label: "Amigos", icon: UserGroupIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      <nav className="flex h-14 justify-between px-1 py-2 align-middle">
        <div className="flex">
          <button className="cursor-pointer">
            <HugeiconsIcon icon={Menu01Icon} className="my-2 mx-3" />
          </button>
          <Link href="/">
            <Image src={LiteChatLogoH} height={37} alt="LiteChat Logo" />
          </Link>
        </div>
        <div className="w-1/3">
          <SearchBox className="w-full" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-zinc-500 font-medium mr-1">
            {user?.fullName}
          </span>
          <Button icon={Settings01Icon} variant="text" color="neutral" />
          <Button icon={UserCircle02Icon} variant="text" color="neutral" />
          <Button
            icon={Logout04Icon}
            variant="text"
            color="neutral"
            onClick={logout}
          />
        </div>
      </nav>
      <div className="flex flex-1 min-h-0">
        <aside className="w-64 flex flex-col">
          <nav className="flex flex-col p-2 gap-1">
            {navItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onViewChange(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeView === key
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                }`}
              >
                <HugeiconsIcon icon={icon} size={20} />
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex flex-col p-3 w-full rounded-tl-3xl bg-white overflow-auto inner-shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
