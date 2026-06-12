"use client";

import React, {
  useState,
  useEffect,
  InputHTMLAttributes,
  ChangeEvent,
  FocusEvent,
  Ref,
} from "react";

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

export interface NumericInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "min" | "max" | "step"
> {
  value?: number;
  onChange?: (val: number) => void;
  decimals?: number;
  thousandsSeparator?: string;
  currencySymbol?: string;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  showControls?: boolean;
  min?: number;
  max?: number;
  step?: number;
  ref?: Ref<HTMLInputElement>;
}

const formatNumericValue = (
  val: number,
  decimals: number = 2,
  thousands: string = ",",
  currency: string = "",
) => {
  const fixed = val.toFixed(decimals);
  const parts = fixed.split(".");
  let num = parts[0];
  const dec = parts[1];
  const reg = /\B(?=(\d{3})+(?!\d))/g;
  num = num.replace(reg, thousands);
  const formattedNum = decimals > 0 ? `${num}.${dec}` : num;
  return currency ? `${currency} ${formattedNum}` : formattedNum;
};

export default function NumericInput({
  value = 0,
  onChange,
  decimals = 2,
  thousandsSeparator = ",",
  currencySymbol = "",
  color = "primary",
  disabled = false,
  showControls = false,
  min,
  max,
  step = 1,
  className = "",
  ref,
  ...props
}: NumericInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(
        formatNumericValue(value, decimals, thousandsSeparator, currencySymbol),
      );
    } else {
      setDisplayValue(value !== 0 ? value.toString() : "");
    }
  }, [value, isFocused, decimals, thousandsSeparator, currencySymbol]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const filtered = raw.replace(/[^\d.-]/g, "");
    setDisplayValue(filtered);

    const parsed = parseFloat(filtered);
    if (!isNaN(parsed)) {
      if (onChange) onChange(parsed);
    } else if (raw === "" && onChange) {
      onChange(0);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let checkedVal = value;
    if (min !== undefined && checkedVal < min) checkedVal = min;
    if (max !== undefined && checkedVal > max) checkedVal = max;
    if (checkedVal !== value && onChange) {
      onChange(checkedVal);
    }
    if (props.onBlur) props.onBlur(e);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const nextVal = value - step;
    const clampedVal = min !== undefined ? Math.max(min, nextVal) : nextVal;
    if (onChange) onChange(parseFloat(clampedVal.toFixed(decimals)));
  };

  const handleIncrement = () => {
    if (disabled) return;
    const nextVal = value + step;
    const clampedVal = max !== undefined ? Math.min(max, nextVal) : nextVal;
    if (onChange) onChange(parseFloat(clampedVal.toFixed(decimals)));
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 border border-zinc-200    rounded-xl bg-white    transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : colorFocusRingClasses[color]
      } ${className}`}
    >
      {showControls && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={handleDecrement}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/50   hover:bg-zinc-100    text-zinc-500    font-extrabold transition-colors disabled:opacity-40 disabled:pointer-events-none select-none text-sm cursor-pointer shrink-0"
        >
          -
        </button>
      )}

      {currencySymbol && (
        <span className="text-zinc-400 font-semibold select-none text-sm shrink-0">
          {currencySymbol}
        </span>
      )}

      <input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-full text-sm outline-none bg-transparent text-foreground placeholder-zinc-400  text-right font-medium"
      />

      {showControls && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={handleIncrement}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-50    border border-zinc-200/50   hover:bg-zinc-100    text-zinc-500    font-extrabold transition-colors disabled:opacity-40 disabled:pointer-events-none select-none text-sm cursor-pointer shrink-0"
        >
          +
        </button>
      )}
    </div>
  );
}
