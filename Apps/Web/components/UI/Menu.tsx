"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Settings01Icon,
  UserCircle02Icon,
} from "@hugeicons/core-free-icons";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import SearchBox from "./SearchBox";
import Button from "./Button";

import LiteChatLogoH from "../../public/LiteChat-Logo-H.png";

interface MenuProps {
  children: ReactNode;
}
export default function Menus({ children }: MenuProps) {
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
        <div className="flex items-center">
          <Button icon={Settings01Icon} variant="text" color="neutral" />
          <Button icon={UserCircle02Icon} variant="text" color="neutral" />
        </div>
      </nav>
      <div className="flex flex-1 min-h-0">
        <aside className="w-64">SIDE MENU</aside>
        <main className="flex flex-col p-3 w-full rounded-tl-3xl bg-white overflow-auto inner-shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
