"use client";

import React, { ReactNode, CSSProperties } from "react";

// --- 1. FORM WRAPPER COMPONENT ---
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export default function Form({
  children,
  className = "",
  ...props
}: FormProps) {
  return (
    <form {...props} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}

// --- 2. FORM FIELD WRAPPER ---
export interface FormFieldProps {
  label?: ReactNode;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function FormField({
  label,
  error,
  helpText,
  required,
  children,
  className = "",
  style,
}: FormFieldProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 w-full text-left ${className}`}
      style={style}
    >
      {label && (
        <label className="text-sm font-semibold text-zinc-700  flex items-center gap-1 select-none">
          {label}
          {required && <span className="text-accent font-bold">*</span>}
        </label>
      )}
      <div className="relative w-full">{children}</div>
      {error && (
        <span className="text-xs text-accent flex items-center gap-1.5 font-medium animate-fadeIn">
          <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-accent/10 shrink-0 font-bold text-[10px]">
            !
          </span>
          {error}
        </span>
      )}
      {helpText && !error && (
        <span className="text-xs text-zinc-400  select-none">{helpText}</span>
      )}
    </div>
  );
}

// --- RE-EXPORT INPUTS FOR BACKWARD COMPATIBILITY & EASIER IMPORTS ---
export { default as TextBox } from "./TextBox";
export type { TextBoxProps } from "./TextBox";

export { default as NumericInput } from "./NumericInput";
export type { NumericInputProps } from "./NumericInput";

export { default as Select } from "./Select";
export type { SelectProps } from "./Select";

export { default as DateTimePicker } from "./DateTimePicker";
export type { DateTimePickerProps } from "./DateTimePicker";

export { Slider } from "./Slider";
export type { SliderProps } from "./Slider";

export { default as TextArea } from "./TextArea";
export type { TextAreaProps } from "./TextArea";

export { default as SegmentedControl } from "./SegmentedControl";
export type { SegmentedControlProps } from "./SegmentedControl";

export { default as Toggle } from "./Toggle";
export type { ToggleProps } from "./Toggle";

export { default as Card, CardHeader, CardBody, CardFooter } from "./Card";
export type { CardProps } from "./Card";
