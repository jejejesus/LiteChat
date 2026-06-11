"use client";

import {
  useState,
  InputHTMLAttributes,
  ReactNode,
  useId,
  ChangeEvent,
  AnimationEvent,
  CSSProperties,
} from "react";

export interface ToggleProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "color"
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  labelPlacement?: "start" | "end";
}

const activeBgClasses = {
  primary: "bg-primary border-primary text-white",
  secondary: "bg-secondary border-secondary text-white",
  accent: "bg-accent border-accent text-white",
  highlight: "bg-highlight border-highlight text-foreground",
  neutral: "bg-neutral border-neutral text-white",
};

const focusRingClasses = {
  primary: "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30",
  secondary: "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/30",
  accent: "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30",
  highlight: "peer-focus-visible:ring-2 peer-focus-visible:ring-highlight/30",
  neutral: "peer-focus-visible:ring-2 peer-focus-visible:ring-neutral/30",
};

const waveColorVars = {
  primary: "var(--dodger-blue)",
  secondary: "var(--muted-teal)",
  accent: "var(--light-coral)",
  highlight: "var(--mustard)",
  neutral: "var(--taupe-grey)",
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  color = "primary",
  disabled = false,
  labelPlacement = "end",
  className = "",
  style,
  ...props
}: ToggleProps) {
  const [isAnimateWave, setIsAnimateWave] = useState(false);
  const generatedId = useId();
  const id = props.id || generatedId;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    setIsAnimateWave(false);
    // Force browser reflow to restart animation on fast double click
    void e.currentTarget.offsetWidth;
    setIsAnimateWave(true);

    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === "toggleEffect") {
      setIsAnimateWave(false);
    }
  };

  const waveClass = isAnimateWave ? "toggle-wave-active" : "";

  // Base Pill Container Layout
  const basePillStyles =
    "w-10 h-6 rounded-full transition-all duration-300 flex items-center relative aspect-video shrink-0 select-none p-0.5 border";

  // Unchecked state styles
  const uncheckedBgStyles = "bg-zinc-200 border-zinc-200 ";

  // Interaction styles when not disabled
  const interactionStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer active:scale-95 group-hover:brightness-95";

  // Checked state styles
  const checkedBgStyles = activeBgClasses[color];

  // Final composite class names for the pill container
  const pillClassName = `${basePillStyles} ${
    checked ? checkedBgStyles : uncheckedBgStyles
  } ${interactionStyles} ${waveClass}`;

  // Handle Translate position
  const handleTranslate = checked ? "translate-x-[16px]" : "translate-x-0";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes toggleEffect {
          0% {
            box-shadow: 0 0 0 0px var(--toggle-wave-color);
            opacity: 0.5;
          }
          100% {
            box-shadow: 0 0 0 6px var(--toggle-wave-color);
            opacity: 0;
          }
        }
        .toggle-wave-active {
          position: relative;
        }
        .toggle-wave-active::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 9999px;
          opacity: 0;
          box-shadow: 0 0 0 0px var(--toggle-wave-color);
          animation: toggleEffect 0.4s ease-out;
          pointer-events: none;
        }
      `,
        }}
      />
      <label
        className={`inline-flex items-center gap-2.5 select-none relative group ${
          disabled
            ? "cursor-not-allowed text-zinc-400 "
            : "cursor-pointer text-foreground"
        } rounded-md px-1 py-0.5 transition-all duration-200 outline-none ${className}`}
        style={style}
      >
        {label && labelPlacement === "start" && (
          <span className="font-medium text-sm leading-none">{label}</span>
        )}

        <input
          {...props}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only peer"
        />

        <div
          className={`${pillClassName} ${focusRingClasses[color]}`}
          onAnimationEnd={handleAnimationEnd}
          style={
            { "--toggle-wave-color": waveColorVars[color] } as CSSProperties
          }
        >
          <div
            className={`w-[18px] h-[18px] rounded-full bg-white  shadow-sm transition-all duration-250 ease-[cubic-bezier(0.12,0.4,0.29,1.46)] ${handleTranslate} group-active:w-[22px]`}
          />
        </div>

        {label && labelPlacement === "end" && (
          <span className="font-medium text-sm leading-none">{label}</span>
        )}
      </label>
    </>
  );
}
