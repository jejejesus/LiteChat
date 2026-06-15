"use client";

import React, {
  useState,
  useEffect,
  useRef,
  InputHTMLAttributes,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
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

const borderFocusClasses = {
  primary: "focus:border-primary focus:ring-2 focus:ring-primary/20",
  secondary: "focus:border-secondary focus:ring-2 focus:ring-secondary/20",
  accent: "focus:border-accent focus:ring-2 focus:ring-accent/20",
  highlight: "focus:border-highlight focus:ring-2 focus:ring-highlight/20",
  neutral: "focus:border-neutral focus:ring-2 focus:ring-neutral/20",
};

export interface TextBoxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  type?: string;
  isOTP?: boolean;
  otpLength?: number;
  value?: string;
  onChange?: (val: string) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  prefixIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export default function TextBox({
  type = "text",
  isOTP = false,
  otpLength = 6,
  value = "",
  onChange,
  color = "primary",
  prefixIcon,
  disabled = false,
  className = "",
  ref,
  ...props
}: TextBoxProps) {
  const [otpVal, setOtpVal] = useState<string[]>(() =>
    Array(otpLength).fill(""),
  );
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOTP) {
      const arr = value.split("").slice(0, otpLength);
      while (arr.length < otpLength) arr.push("");
    }
  }, [value, isOTP, otpLength]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  };

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.slice(-1);
    const newOtp = [...otpVal];
    newOtp[index] = char;
    setOtpVal(newOtp);

    if (onChange) onChange(newOtp.join(""));

    if (char !== "" && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otpVal[index] === "" && index > 0) {
      const newOtp = [...otpVal];
      newOtp[index - 1] = "";
      setOtpVal(newOtp);
      if (onChange) onChange(newOtp.join(""));
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, otpLength);
    if (/^[\d\w]+$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      while (newOtp.length < otpLength) newOtp.push("");
      setOtpVal(newOtp);
      if (onChange) onChange(newOtp.join(""));
      otpRefs.current[Math.min(pasteData.length, otpLength - 1)]?.focus();
    }
  };

  if (isOTP) {
    return (
      <div className="flex gap-2 justify-start items-center py-1">
        {otpVal.map((char, i) => (
          <input
            key={i}
            ref={(el) => {
              otpRefs.current[i] = el;
            }}
            type="text"
            value={char}
            onChange={(e) => handleOtpChange(i, e)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            onPaste={handleOtpPaste}
            maxLength={1}
            disabled={disabled}
            className={`w-11 h-12 text-center text-lg font-bold border border-zinc-200   rounded-xl bg-white   transition-all duration-200 outline-none ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : borderFocusClasses[color]
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border border-zinc-200   rounded-xl bg-white    transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : colorFocusRingClasses[color]
      } ${className}`}
    >
      {prefixIcon && (
        <div className="text-zinc-400   shrink-0">{prefixIcon}</div>
      )}
      <input
        {...props}
        ref={ref}
        type={type}
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        className="w-full text-sm outline-none bg-transparent text-foreground placeholder-zinc-400   font-medium"
      />
    </div>
  );
}
