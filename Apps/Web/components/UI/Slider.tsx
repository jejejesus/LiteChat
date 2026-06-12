/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  ReactNode,
} from "react";

const textActiveClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  highlight: "text-highlight",
  neutral: "text-neutral",
};

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number | [number, number];
  onChange?: (val: any) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  tooltip?: boolean;
  marks?: Record<number, ReactNode>;
}

interface SliderThumbProps {
  pct: number;
  val: number;
  index: number;
  color: string;
  disabled: boolean;
  tooltip: boolean;
  activeThumbIndex: React.MutableRefObject<number | null>;
  onStartDrag: (clientX: number, thumbIndex: number) => void;
  borderColors: Record<string, string>;
}

// Separate SliderThumb to avoid React Hook state limits/warnings
function SliderThumb({
  pct,
  val,
  index,
  color,
  disabled,
  tooltip,
  activeThumbIndex,
  onStartDrag,
  borderColors,
}: SliderThumbProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isDragging = activeThumbIndex.current === index;

  return (
    <div
      style={{ left: `${pct}%` }}
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 group z-20 select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onStartDrag(e.clientX, index);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onStartDrag(e.touches[0].clientX, index);
        }}
        className={`w-4.5 h-4.5 rounded-full bg-white border-2 ${borderColors[color]} shadow-md cursor-pointer transition-all duration-150 hover:scale-120 hover:shadow-lg active:scale-95 active:shadow-inner ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }`}
      />
      {tooltip && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-xl bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-extrabold tracking-tight select-none pointer-events-none shadow-md transition-all duration-150 whitespace-nowrap ${
            showTooltip || isDragging
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-75"
          }`}
        >
          {val}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900/90 w-0 h-0" />
        </div>
      )}
    </div>
  );
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      onChange,
      color = "primary",
      disabled = false,
      className = "",
      style,
      tooltip = true,
      marks,
    },
    ref,
  ) => {
    const isRange = Array.isArray(value);
    const [localValue, setLocalValue] = useState<number | [number, number]>(
      () => {
        if (value !== undefined) return value;
        return isRange ? [min, max] : min;
      },
    );

    useEffect(() => {
      if (value !== undefined) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(value);
      }
    }, [value, isRange]);

    const trackRef = useRef<HTMLDivElement>(null);
    const activeThumbIndex = useRef<number | null>(null);

    const getValueFromClientX = (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = (clientX - rect.left) / rect.width;
      const clampedPct = Math.min(Math.max(pct, 0), 1);
      const rawVal = min + clampedPct * (max - min);
      const stepped = Math.round(rawVal / step) * step;
      return parseFloat(stepped.toFixed(4));
    };

    const handleStartDrag = (clientX: number, thumbIndex?: number) => {
      if (disabled) return;
      const clickVal = getValueFromClientX(clientX);

      let targetIndex = 0;
      if (isRange) {
        const valArr = localValue as [number, number];
        if (thumbIndex !== undefined) {
          targetIndex = thumbIndex;
        } else {
          const dist0 = Math.abs(valArr[0] - clickVal);
          const dist1 = Math.abs(valArr[1] - clickVal);
          targetIndex = dist0 < dist1 ? 0 : 1;
        }
      }

      activeThumbIndex.current = targetIndex;
      updateValue(clickVal, targetIndex);

      document.addEventListener("mousemove", handleMoveDrag);
      document.addEventListener("mouseup", handleEndDrag);
      document.addEventListener("touchmove", handleTouchMoveDrag, {
        passive: false,
      });
      document.addEventListener("touchend", handleEndDrag);
    };

    const updateValue = (newVal: number, index: number) => {
      let finalVal: number | [number, number];
      if (isRange) {
        const currentArr = [...(localValue as [number, number])] as [
          number,
          number,
        ];
        if (index === 0) {
          currentArr[0] = Math.min(newVal, currentArr[1]);
        } else {
          currentArr[1] = Math.max(newVal, currentArr[0]);
        }
        currentArr[0] = Math.min(Math.max(currentArr[0], min), max);
        currentArr[1] = Math.min(Math.max(currentArr[1], min), max);
        finalVal = currentArr;
      } else {
        finalVal = Math.min(Math.max(newVal, min), max);
      }

      setLocalValue(finalVal);
      if (onChange) onChange(finalVal);
    };

    const handleMoveDrag = (e: MouseEvent) => {
      if (activeThumbIndex.current === null) return;
      const clickVal = getValueFromClientX(e.clientX);
      updateValue(clickVal, activeThumbIndex.current);
    };

    const handleTouchMoveDrag = (e: TouchEvent) => {
      if (activeThumbIndex.current === null) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      const clickVal = getValueFromClientX(touch.clientX);
      updateValue(clickVal, activeThumbIndex.current);
    };

    const handleEndDrag = () => {
      activeThumbIndex.current = null;
      document.removeEventListener("mousemove", handleMoveDrag);
      document.removeEventListener("mouseup", handleEndDrag);
      document.removeEventListener("touchmove", handleTouchMoveDrag);
      document.removeEventListener("touchend", handleEndDrag);
    };

    useEffect(() => {
      return () => {
        document.removeEventListener("mousemove", handleMoveDrag);
        document.removeEventListener("mouseup", handleEndDrag);
        document.removeEventListener("touchmove", handleTouchMoveDrag);
        document.removeEventListener("touchend", handleEndDrag);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue]);

    const val0 = isRange
      ? (localValue as [number, number])[0]
      : (localValue as number);
    const val1 = isRange ? (localValue as [number, number])[1] : max;

    const pct0 = ((val0 - min) / (max - min)) * 100;
    const pct1 = isRange ? ((val1 - min) / (max - min)) * 100 : 0;
    const singlePct = ((val0 - min) / (max - min)) * 100;

    const trackActiveStyle: CSSProperties = isRange
      ? { left: `${pct0}%`, right: `${100 - pct1}%` }
      : { left: "0%", right: `${100 - singlePct}%` };

    const bgColors = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      highlight: "bg-highlight",
      neutral: "bg-neutral",
    };

    const borderColors = {
      primary: "border-primary",
      secondary: "border-secondary",
      accent: "border-accent",
      highlight: "border-highlight",
      neutral: "border-neutral",
    };

    return (
      <div
        ref={ref}
        style={style}
        className={`relative w-full py-4 select-none ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      >
        <div
          ref={trackRef}
          onMouseDown={(e) => handleStartDrag(e.clientX)}
          onTouchStart={(e) => handleStartDrag(e.touches[0].clientX)}
          className="relative w-full h-1.5 bg-zinc-200 rounded-full cursor-pointer select-none"
        >
          {/* Active track segment */}
          <div
            style={trackActiveStyle}
            className={`absolute h-full rounded-full transition-all duration-75 ${bgColors[color]}`}
          />

          {/* Stepper Marks */}
          {marks && (
            <div className="absolute inset-0 select-none pointer-events-none">
              {Object.keys(marks).map((markValStr) => {
                const markVal = parseFloat(markValStr);
                const markPct = ((markVal - min) / (max - min)) * 100;
                const isFilled = isRange
                  ? markVal >= (localValue as [number, number])[0] &&
                    markVal <= (localValue as [number, number])[1]
                  : markVal <= (localValue as number);
                return (
                  <div
                    key={markValStr}
                    style={{ left: `${markPct}%` }}
                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-white transition-colors duration-200 ${
                      isFilled ? bgColors[color] : "bg-zinc-350"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Sliders Thumbs */}
        {!isRange ? (
          <SliderThumb
            pct={singlePct}
            val={val0}
            index={0}
            color={color}
            disabled={disabled}
            tooltip={tooltip}
            activeThumbIndex={activeThumbIndex}
            onStartDrag={handleStartDrag}
            borderColors={borderColors}
          />
        ) : (
          <>
            <SliderThumb
              pct={pct0}
              val={val0}
              index={0}
              color={color}
              disabled={disabled}
              tooltip={tooltip}
              activeThumbIndex={activeThumbIndex}
              onStartDrag={handleStartDrag}
              borderColors={borderColors}
            />
            <SliderThumb
              pct={pct1}
              val={val1}
              index={1}
              color={color}
              disabled={disabled}
              tooltip={tooltip}
              activeThumbIndex={activeThumbIndex}
              onStartDrag={handleStartDrag}
              borderColors={borderColors}
            />
          </>
        )}

        {/* Mark Labels rendering below slider */}
        {marks && (
          <div className="relative w-full h-5 mt-2.5 select-none pointer-events-none">
            {Object.entries(marks).map(([markValStr, label]) => {
              const markVal = parseFloat(markValStr);
              const markPct = ((markVal - min) / (max - min)) * 100;
              const isFilled = isRange
                ? markVal >= (localValue as [number, number])[0] &&
                  markVal <= (localValue as [number, number])[1]
                : markVal <= (localValue as number);
              return (
                <div
                  key={markValStr}
                  style={{ left: `${markPct}%` }}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                >
                  <span
                    className={`text-[10px] font-bold transition-colors duration-150 ${
                      isFilled ? textActiveClasses[color] : "text-zinc-400 "
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
Slider.displayName = "Slider";
