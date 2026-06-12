"use client";

import { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "dashed" | "flat";
  hoverable?: boolean;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral" | "none";
  children: ReactNode;
}

const colorBorderClasses = {
  none: "",
  primary: "border-t-4 border-t-primary",
  secondary: "border-t-4 border-t-secondary",
  accent: "border-t-4 border-t-accent",
  highlight: "border-t-4 border-t-highlight",
  neutral: "border-t-4 border-t-neutral",
};

const variantClasses = {
  default: "bg-white border border-zinc-200/60  shadow-xs",
  bordered: "bg-transparent border border-zinc-300",
  dashed: "bg-transparent border border-dashed border-zinc-300 ",
  flat: "bg-zinc-50  border-none",
  glass: "bg-white/70  backdrop-blur-md border border-zinc-200/40  shadow-sm",
};

export default function Card({
  variant = "default",
  hoverable = false,
  color = "none",
  className = "",
  children,
  style,
  ...props
}: CardProps) {
  const baseClasses =
    "rounded-2xl transition-all duration-300 flex flex-col relative text-left overflow-hidden";
  const hoverClasses = hoverable
    ? "hover:shadow-md hover:-translate-y-1 hover:border-zinc-300 cursor-default"
    : "";
  const colorClasses = colorBorderClasses[color];
  const designClasses = variantClasses[variant];

  return (
    <div
      {...props}
      style={style}
      className={`${baseClasses} ${designClasses} ${hoverClasses} ${colorClasses} ${className}`}
    >
      {children}
    </div>
  );
}

// --- HEADER SUB-COMPONENT ---
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({
  children,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      {...props}
      className={`px-6 py-4 border-b border-zinc-200  border-dashed flex items-center justify-between gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

// --- BODY SUB-COMPONENT ---
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({
  children,
  className = "",
  ...props
}: CardBodyProps) {
  return (
    <div {...props} className={`px-6 py-5 flex-1 ${className}`}>
      {children}
    </div>
  );
}

// --- FOOTER SUB-COMPONENT ---
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      {...props}
      className={`px-6 py-4 bg-zinc-50/50  border-t border-zinc-200  border-dashed flex items-center gap-4 ${className}`}
    >
      {children}
    </div>
  );
}
