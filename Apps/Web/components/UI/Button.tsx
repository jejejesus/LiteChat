"use client";

import {
  useState,
  ButtonHTMLAttributes,
  MouseEvent,
  CSSProperties,
} from "react";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

interface BaseButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  variant?: "solid" | "outlined" | "dashed" | "filled" | "text";
  isLoading?: boolean;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
}

type ButtonProps = BaseButtonProps &
  (
    | { text: string; icon?: IconSvgElement }
    | { text?: string; icon: IconSvgElement }
  );

const colorMaps = {
  primary: {
    solid: "bg-primary text-white hover:bg-primary/90",
    outlined:
      "bg-transparent text-primary border border-primary hover:bg-primary/5",
    dashed:
      "bg-transparent text-primary border border-dashed border-primary hover:bg-primary/5",
    filled: "bg-primary/10 text-primary hover:bg-primary/20",
    text: "bg-transparent text-primary hover:bg-primary/10",
  },
  secondary: {
    solid: "bg-secondary text-white hover:bg-secondary/90",
    outlined:
      "bg-transparent text-secondary border border-secondary hover:bg-secondary/5",
    dashed:
      "bg-transparent text-secondary border border-dashed border-secondary hover:bg-secondary/5",
    filled: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    text: "bg-transparent text-secondary hover:bg-secondary/10",
  },
  accent: {
    solid: "bg-accent text-white hover:bg-accent/90",
    outlined:
      "bg-transparent text-accent border border-accent hover:bg-accent/5",
    dashed:
      "bg-transparent text-accent border border-dashed border-accent hover:bg-accent/5",
    filled: "bg-accent/10 text-accent hover:bg-accent/20",
    text: "bg-transparent text-accent hover:bg-accent/10",
  },
  highlight: {
    solid: "bg-highlight text-foreground hover:bg-highlight/90",
    outlined:
      "bg-transparent text-highlight border border-highlight hover:bg-highlight/5",
    dashed:
      "bg-transparent text-highlight border border-dashed border-highlight hover:bg-highlight/5",
    filled: "bg-highlight/10 text-highlight hover:bg-highlight/20",
    text: "bg-transparent text-highlight hover:bg-highlight/10",
  },
  neutral: {
    solid: "bg-neutral text-white hover:bg-neutral/90",
    outlined:
      "bg-transparent text-neutral border border-neutral hover:bg-neutral/5",
    dashed:
      "bg-transparent text-neutral border border-dashed border-neutral hover:bg-neutral/5",
    filled: "bg-neutral/10 text-neutral hover:bg-neutral/20",
    text: "bg-transparent text-neutral hover:bg-neutral/10",
  },
};

const waveColorVars: Record<string, string> = {
  primary: "var(--dodger-blue)",
  secondary: "var(--muted-teal)",
  accent: "var(--light-coral)",
  highlight: "var(--mustard)",
  neutral: "var(--taupe-grey)",
};

const disabledStyles = {
  solid: "bg-zinc-200 text-zinc-400 border-none",
  outlined: "bg-transparent text-zinc-400 border border-zinc-200",
  dashed: "bg-transparent text-zinc-400 border border-dashed border-zinc-200",
  filled: "bg-zinc-100 text-zinc-400 border-none",
  text: "bg-transparent text-zinc-400 border-none",
};

export default function Button({
  text,
  icon,
  onClick,
  disabled,
  variant = "solid",
  isLoading,
  color = "primary",
  className,
  style,
  type = "button",
  ...props
}: ButtonProps) {
  const [isAnimateWave, setIsAnimateWave] = useState(false);
  const isDisabled = disabled || isLoading;
  const currentIcon = isLoading ? Loading03Icon : icon;
  const isIconOnly = !!currentIcon && !text;

  const baseStyles =
    "inline-flex items-center gap-2 m-1 justify-center transition-all duration-200 select-none font-medium relative";
  const shapeStyles = isIconOnly
    ? "rounded-full p-2 aspect-square"
    : "rounded-lg px-2 py-1";
  const interactionStyles = isDisabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer";
  const finalVariantClass = isDisabled
    ? disabledStyles[variant]
    : colorMaps[color][variant];

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    setIsAnimateWave(false);
    void e.currentTarget.offsetWidth;
    setIsAnimateWave(true);
    if (onClick) onClick(e);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes clickWave { 0% { box-shadow: 0 0 0 0px var(--wave-color); opacity: 0.4; } 100% { box-shadow: 0 0 0 6px var(--wave-color); opacity: 0; } }
        .click-wave-active::after { content: ''; position: absolute; inset: 0px; border-radius: inherit; opacity: 0; animation: clickWave 0.5s cubic-bezier(0.08, 0.82, 0.17, 1); pointer-events: none; }
      `,
        }}
      />
      <button
        className={`${baseStyles} ${shapeStyles} ${interactionStyles} ${finalVariantClass} ${isAnimateWave ? "click-wave-active" : ""} ${className || ""}`}
        onClick={handleButtonClick}
        onAnimationEnd={() => setIsAnimateWave(false)}
        type={type}
        disabled={isDisabled}
        style={
          { ...style, "--wave-color": waveColorVars[color] } as CSSProperties
        }
        {...props}
      >
        {currentIcon && (
          <HugeiconsIcon
            icon={currentIcon}
            className={isLoading ? "animate-spin" : ""}
          />
        )}
        {text}
      </button>
    </>
  );
}
