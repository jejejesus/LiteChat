import Link from "next/link";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

interface LinkButtonParams {
  href: string;
  text?: string;
  icon?: IconSvgElement;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  className?: string;
}

const colorStyles = {
  primary: "text-primary hover:text-primary/80",
  secondary: "text-secondary hover:text-secondary/80",
  accent: "text-accent hover:text-accent/80",
  highlight: "text-highlight hover:text-highlight/80",
  neutral: "text-neutral hover:text-neutral/80",
};

export default function LinkButton({
  href,
  text,
  icon,
  color = "primary",
  className,
}: LinkButtonParams) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 underline font-medium transition-colors ${colorStyles[color]} ${className}`}
    >
      {icon && <HugeiconsIcon icon={icon} size={16} />}
      {text}
    </Link>
  );
}
