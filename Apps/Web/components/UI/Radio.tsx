/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  InputHTMLAttributes,
  ReactNode,
  useId,
  ChangeEvent,
  AnimationEvent,
  CSSProperties,
} from "react";

// --- RADIO GROUP CONTEXT ---
interface RadioGroupContextProps {
  name?: string;
  value?: any;
  onChange?: (value: any) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextProps | undefined>(
  undefined,
);

// --- RADIO GROUP COMPONENT ---
export interface RadioGroupProps {
  header?: ReactNode;
  value?: any;
  onChange?: (value: any) => void;
  name?: string;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function RadioGroup({
  header,
  value,
  onChange,
  name,
  color = "primary",
  disabled = false,
  direction = "vertical",
  className = "",
  style,
  children,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name || generatedName;

  const layoutClass =
    direction === "horizontal"
      ? "flex-row flex-wrap gap-4"
      : "flex-col gap-2.5";

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value, onChange, color, disabled }}
    >
      <div className={`flex flex-col gap-2 ${className}`} style={style}>
        {header && (
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left self-start select-none">
            {header}
          </span>
        )}
        <div className={`flex ${layoutClass}`}>{children}</div>
      </div>
    </RadioGroupContext.Provider>
  );
}

// --- RADIO COMPONENT ---
export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "color"
> {
  value?: any;
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

export default function Radio({
  value,
  checked: customChecked,
  onChange: customOnChange,
  label,
  color: customColor,
  disabled: customDisabled,
  className = "",
  style,
  ...props
}: RadioProps) {
  const context = useContext(RadioGroupContext);
  const [isAnimateWave, setIsAnimateWave] = useState(false);
  const generatedId = useId();
  const id = props.id || generatedId;

  // Resolve values from Context or local Props
  const name = context?.name || props.name;
  const disabled =
    context?.disabled !== undefined ? context.disabled : !!customDisabled;
  const color = context?.color || customColor || "primary";
  const isChecked =
    context !== undefined ? context.value === value : !!customChecked;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    setIsAnimateWave(false);
    // Force browser reflow to restart animation on fast double click
    void e.currentTarget.offsetWidth;
    setIsAnimateWave(true);

    if (context && context.onChange) {
      context.onChange(value);
    } else if (customOnChange) {
      customOnChange(e.target.checked);
    }
  };

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === "radioEffect") {
      setIsAnimateWave(false);
    }
  };

  const waveClass = isAnimateWave ? "radio-wave-active" : "";

  // Base circular Box Layout
  const baseBoxStyles =
    "w-[18px] h-[18px] rounded-full border transition-all duration-200 flex items-center justify-center relative aspect-square shrink-0 select-none";

  // Unchecked state styles
  const uncheckedBoxStyles = "bg-white border-zinc-300 ";

  // Interaction styles when not disabled
  const interactionStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : `cursor-pointer active:scale-95 ${hoverBorderClasses[color]}`;

  // Checked state styles
  const checkedBoxStyles = checkedColorClasses[color];

  // Final composite class names for the circular box
  const boxClassName = `${baseBoxStyles} ${
    isChecked ? checkedBoxStyles : uncheckedBoxStyles
  } ${interactionStyles} ${waveClass}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes radioEffect {
          0% {
            box-shadow: 0 0 0 0px var(--radio-wave-color);
            opacity: 0.5;
          }
          100% {
            box-shadow: 0 0 0 6px var(--radio-wave-color);
            opacity: 0;
          }
        }
        .radio-wave-active {
          position: relative;
        }
        .radio-wave-active::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 9999px;
          opacity: 0;
          box-shadow: 0 0 0 0px var(--radio-wave-color);
          animation: radioEffect 0.4s ease-out;
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
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only peer"
        />

        <div
          className={`${boxClassName} ${focusRingClasses[color]}`}
          onAnimationEnd={handleAnimationEnd}
          style={
            { "--radio-wave-color": waveColorVars[color] } as CSSProperties
          }
        >
          <div
            className={`w-[8px] h-[8px] rounded-full bg-current transition-all duration-200 ease-[cubic-bezier(0.12,0.4,0.29,1.46)] ${
              isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          />
        </div>

        {label && (
          <span className="font-medium text-sm leading-none">{label}</span>
        )}
      </label>
    </>
  );
}
