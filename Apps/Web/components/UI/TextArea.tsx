"use client";

import React, { useEffect, useRef, ChangeEvent, Ref } from "react";

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

export interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  value?: string;
  onChange?: (val: string) => void;
  autoSize?: boolean;
  maxRows?: number;
  showCount?: boolean;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  ref?: Ref<HTMLTextAreaElement>;
}

export default function TextArea({
  value = "",
  onChange,
  autoSize = true,
  maxRows,
  showCount = false,
  color = "primary",
  disabled = false,
  className = "",
  maxLength,
  ref,
  ...props
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto resize height calculations
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoSize) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    if (maxRows) {
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const paddingTop = parseInt(computedStyle.paddingTop) || 8;
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 8;
      const maxHt = maxRows * lineHeight + paddingTop + paddingBottom;
      textarea.style.height = `${Math.min(scrollHeight, maxHt)}px`;
    } else {
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value, autoSize, maxRows]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="relative w-full flex flex-col">
      <textarea
        {...props}
        ref={(node) => {
          textareaRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (
              ref as React.MutableRefObject<HTMLTextAreaElement | null>
            ).current = node;
        }}
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        maxLength={maxLength}
        rows={props.rows || 3}
        className={`w-full text-sm px-3 py-2 border border-zinc-200 rounded-xl bg-white transition-all duration-200 outline-none resize-none ${
          disabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : colorFocusRingClasses[color]
        } ${className}`}
      />
      {showCount && maxLength !== undefined && (
        <span className="absolute bottom-2.5 right-3 text-[9px] font-bold text-zinc-400  bg-zinc-50/80  px-1.5 py-0.5 rounded-md border border-zinc-150  select-none pointer-events-none">
          {value.length} / {maxLength}
        </span>
      )}
    </div>
  );
}
