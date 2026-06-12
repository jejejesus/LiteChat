"use client";

import React, { ReactNode, CSSProperties } from "react";

const bgActiveClasses = {
  primary: "bg-primary text-white shadow-sm",
  secondary: "bg-secondary text-white shadow-sm",
  accent: "bg-accent text-white shadow-sm",
  highlight: "bg-highlight text-foreground shadow-sm",
  neutral: "bg-neutral text-white shadow-sm",
};

const textActiveClasses = {
  primary: "text-white",
  secondary: "text-white",
  accent: "text-white",
  highlight: "text-foreground",
  neutral: "text-white",
};

export interface SegmentOption<K extends string | number> {
  value: K;
  label: ReactNode;
}

export interface SegmentedControlProps<K extends string | number> {
  options: SegmentOption<K>[];
  value: K;
  onChange: (val: K) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function SegmentedControl<K extends string | number>({
  options,
  value,
  onChange,
  color = "primary",
  disabled = false,
  className = "",
  style,
}: SegmentedControlProps<K>) {
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleSelect = (val: K) => {
    if (disabled) return;
    onChange(val);
  };

  return (
    <div
      style={style}
      className={`relative flex bg-zinc-150/80 p-1 rounded-xl select-none w-full border border-zinc-200/20  ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
    >
      {/* Sliding Background Pill */}
      {options.length > 0 && (
        <div
          style={{
            width: `${100 / options.length}%`,
            transform: `translateX(${safeIndex * 100}%)`,
          }}
          className={`absolute top-1 bottom-1 left-1 rounded-lg transition-transform duration-250 ease-[cubic-bezier(0.25,1,0.5,1)] z-0 ${bgActiveClasses[color]}`}
        />
      )}

      {/* Button Controls */}
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => handleSelect(opt.value)}
            className={`relative z-10 text-xs font-bold text-center flex-1 py-1.5 rounded-lg select-none cursor-pointer transition-colors duration-200 ${
              isSelected
                ? textActiveClasses[color]
                : "text-zinc-500 hover:text-zinc-700 "
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
