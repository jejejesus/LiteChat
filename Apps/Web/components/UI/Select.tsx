"use client";

import React, { useState, useEffect, useRef, CSSProperties } from "react";

const borderFocusClasses = {
  primary: "focus:border-primary focus:ring-2 focus:ring-primary/20",
  secondary: "focus:border-secondary focus:ring-2 focus:ring-secondary/20",
  accent: "focus:border-accent focus:ring-2 focus:ring-accent/20",
  highlight: "focus:border-highlight focus:ring-2 focus:ring-highlight/20",
  neutral: "focus:border-neutral focus:ring-2 focus:ring-neutral/20",
};

const bgActiveClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-white",
  highlight: "bg-highlight text-foreground",
  neutral: "bg-neutral text-white",
};

export interface SelectProps<K extends string | number> {
  options: Record<K, string>;
  value?: K;
  onChange?: (val: K) => void;
  placeholder?: string;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  searchable?: boolean;
}

export default function Select<K extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  color = "primary",
  className = "",
  style,
  disabled = false,
  searchable = false,
}: SelectProps<K>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Autofocus the search box inside dropdown when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  const handleSelect = (key: K) => {
    if (disabled) return;
    if (onChange) onChange(key);
    setIsOpen(false);
  };

  const keys = Object.keys(options) as K[];
  const selectedDisplay = value !== undefined ? options[value] : "";

  const filteredKeys = searchable
    ? keys.filter((key) =>
        options[key].toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : keys;

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full ${className}`}
      style={style}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border border-zinc-200  rounded-xl bg-white transition-all duration-200 text-left text-sm font-medium ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : isOpen
              ? borderFocusClasses[color]
              : "hover:border-zinc-300   hover:shadow-xs"
        }`}
      >
        <span
          className={selectedDisplay ? "text-foreground" : "text-zinc-400 "}
        >
          {selectedDisplay || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-zinc-150   bg-white/95    backdrop-blur-md shadow-lg z-50 py-1.5 animate-fadeIn">
          {searchable && (
            <div className="px-2 pb-1.5 pt-0.5 sticky top-0 bg-white/95   backdrop-blur-md z-10 border-b border-zinc-100   mb-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200  bg-zinc-50   outline-none text-foreground placeholder-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          )}

          {filteredKeys.length === 0 ? (
            <div className="px-3 py-3 text-xs text-zinc-400   italic select-none">
              No matching options found
            </div>
          ) : (
            filteredKeys.map((key) => {
              const display = options[key];
              const isSelected = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isSelected
                      ? bgActiveClasses[color]
                      : "hover:bg-zinc-100    text-foreground"
                  }`}
                >
                  {display}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
