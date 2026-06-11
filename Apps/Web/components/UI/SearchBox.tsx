"use client";

import {
  useState,
  InputHTMLAttributes,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  Ref,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

const colorFocusRingClasses = {
  primary:
    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
  secondary:
    "focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary",
  accent:
    "focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent",
  highlight:
    "focus-within:ring-2 focus-within:ring-highlight/20 focus-within:border-highlight",
  neutral:
    "focus-within:ring-2 focus-within:ring-neutral/20 focus-within:border-neutral",
};

export interface SearchBoxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  prefixIcon?: ReactNode;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
}

export default function SearchBox({
  value = "",
  onChange,
  onSearch,
  color = "primary",
  prefixIcon,
  disabled = false,
  className = "",
  placeholder = "Buscar...",
  ref,
  ...props
}: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleSearch = () => {
    if (onSearch) onSearch(internalValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    props.onKeyDown?.(e);
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-xl bg-white transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : colorFocusRingClasses[color]
      } ${className}`}
    >
      {prefixIcon && <div className="text-zinc-400 shrink-0">{prefixIcon}</div>}
      <input
        {...props}
        ref={ref}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full text-sm outline-none bg-transparent text-foreground placeholder-zinc-400 font-medium"
      />
      <button
        type="button"
        onClick={handleSearch}
        disabled={disabled}
        className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Buscar"
      >
        <HugeiconsIcon icon={Search01Icon} size={18} />
      </button>
    </div>
  );
}
