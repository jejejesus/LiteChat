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

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "color"
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
}

const checkedColorClasses = {
  primary: "bg-primary border-primary text-white",
  secondary: "bg-secondary border-secondary text-white",
  accent: "bg-accent border-accent text-white",
  highlight: "bg-highlight border-highlight text-foreground",
  neutral: "bg-neutral border-neutral text-white",
};

const hoverBorderClasses = {
  primary: "hover:border-primary",
  secondary: "hover:border-secondary",
  accent: "hover:border-accent",
  highlight: "hover:border-highlight",
  neutral: "hover:border-neutral",
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

export default function Checkbox({
  checked = false,
  onChange,
  label,
  color = "primary",
  disabled = false,
  className = "",
  style,
  ...props
}: CheckboxProps) {
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
    if (e.animationName === "checkboxEffect") {
      setIsAnimateWave(false);
    }
  };

  const waveClass = isAnimateWave ? "checkbox-wave-active" : "";

  // Base Box Layout
  const baseBoxStyles =
    "w-[18px] h-[18px] rounded border transition-all duration-200 flex items-center justify-center relative aspect-square shrink-0 select-none";

  // Unchecked state styles
  const uncheckedBoxStyles = "bg-white border-zinc-300";

  // Interaction styles when not disabled
  const interactionStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : `cursor-pointer active:scale-95 ${hoverBorderClasses[color]}`;

  // Checked state styles
  const checkedBoxStyles = checkedColorClasses[color];

  // Final composite class names for the box
  const boxClassName = `${baseBoxStyles} ${
    checked ? checkedBoxStyles : uncheckedBoxStyles
  } ${interactionStyles} ${waveClass}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes checkboxEffect {
          0% {
            box-shadow: 0 0 0 0px var(--checkbox-wave-color);
            opacity: 0.5;
          }
          100% {
            box-shadow: 0 0 0 6px var(--checkbox-wave-color);
            opacity: 0;
          }
        }
        .checkbox-wave-active {
          position: relative;
        }
        .checkbox-wave-active::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 4px;
          opacity: 0;
          box-shadow: 0 0 0 0px var(--checkbox-wave-color);
          animation: checkboxEffect 0.4s ease-out;
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
          className={`${boxClassName} ${focusRingClasses[color]}`}
          onAnimationEnd={handleAnimationEnd}
          style={
            { "--checkbox-wave-color": waveColorVars[color] } as CSSProperties
          }
        >
          <svg
            className={`w-3.5 h-3.5 stroke-current stroke-[3.5] fill-none transition-all duration-200 ease-[cubic-bezier(0.12,0.4,0.29,1.46)] ${
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        {label && (
          <span className="font-medium text-sm leading-none">{label}</span>
        )}
      </label>
    </>
  );
}
