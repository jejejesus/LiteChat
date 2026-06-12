/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, CSSProperties } from "react";

const borderFocusClasses = {
  primary: "focus:border-primary focus:ring-2 focus:ring-primary/20",
  secondary: "focus:border-secondary focus:ring-2 focus:ring-secondary/20",
  accent: "focus:border-accent focus:ring-2 focus:ring-accent/20",
  highlight: "focus:border-highlight focus:ring-2 focus:ring-highlight/20",
  neutral: "focus:border-neutral focus:ring-2 focus:ring-neutral/20",
};

const textActiveClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  highlight: "text-highlight",
  neutral: "text-neutral",
};

const bgActiveClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-white",
  highlight: "bg-highlight text-foreground",
  neutral: "bg-neutral text-white",
};

export interface DateTimePickerProps {
  mode?:
    | "date"
    | "datetime"
    | "daterange"
    | "time"
    | "month-day"
    | "month"
    | "year-month"
    | "year";
  value?: any; // String date ISO, YYYY-MM-DD or { start: string, end: string }
  onChange?: (val: any) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

export default function DateTimePicker({
  mode = "date",
  value,
  onChange,
  color = "primary",
  placeholder = "Select date/time",
  disabled = false,
  className = "",
  style,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [timeState, setTimeState] = useState({ hour: 12, minute: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleDayClick = (day: number) => {
    if (disabled) return;
    const clickedDate = new Date(currentYear, currentMonth, day);

    if (mode === "date") {
      if (onChange) onChange(clickedDate.toISOString().split("T")[0]);
      setIsOpen(false);
    } else if (mode === "datetime") {
      clickedDate.setHours(timeState.hour);
      clickedDate.setMinutes(timeState.minute);
      if (onChange) onChange(clickedDate.toISOString());
    } else if (mode === "daterange") {
      const currentRange =
        value && typeof value === "object"
          ? { ...value }
          : { start: "", end: "" };
      const dateString = clickedDate.toISOString().split("T")[0];

      if (!currentRange.start || (currentRange.start && currentRange.end)) {
        currentRange.start = dateString;
        currentRange.end = "";
      } else {
        if (new Date(dateString) < new Date(currentRange.start)) {
          currentRange.start = dateString;
        } else {
          currentRange.end = dateString;
          setIsOpen(false);
        }
      }
      if (onChange) onChange(currentRange);
    } else if (mode === "month-day") {
      const mm = String(currentMonth + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      if (onChange) onChange(`${mm}-${dd}`);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", increment: boolean) => {
    setTimeState((prev) => {
      let val = prev[type] + (increment ? 1 : -1);
      if (type === "hour") {
        if (val > 23) val = 0;
        if (val < 0) val = 23;
      } else {
        if (val > 59) val = 0;
        if (val < 0) val = 59;
      }
      const updated = { ...prev, [type]: val };

      if (mode === "datetime" && value && typeof value === "string") {
        const d = new Date(value);
        d.setHours(updated.hour);
        d.setMinutes(updated.minute);
        if (onChange) onChange(d.toISOString());
      } else if (mode === "time") {
        const hh = String(updated.hour).padStart(2, "0");
        const mm = String(updated.minute).padStart(2, "0");
        if (onChange) onChange(`${hh}:${mm}`);
      }
      return updated;
    });
  };

  const handleYearClick = (year: number) => {
    if (mode === "year") {
      if (onChange) onChange(String(year));
      setIsOpen(false);
    } else {
      setCurrentYear(year);
    }
  };

  const changeMonth = (increment: boolean) => {
    let nextMonth = currentMonth + (increment ? 1 : -1);
    let nextYear = currentYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Render display string
  const getDisplayValue = () => {
    if (!value) return "";
    if (mode === "daterange" && typeof value === "object") {
      if (!value.start) return "";
      return `${value.start} to ${value.end || "..."}`;
    }
    if (typeof value === "string") {
      if (mode === "datetime") {
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
      }
      if (mode === "month") {
        const monthIndex = parseInt(value, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return MONTH_NAMES[monthIndex];
        }
      }
      if (mode === "year-month") {
        const parts = value.split("-");
        if (parts.length === 2) {
          const yr = parts[0];
          const monthIndex = parseInt(parts[1], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            return `${MONTH_NAMES[monthIndex]} ${yr}`;
          }
        }
      }
      return value;
    }
    return String(value);
  };

  const displayString = getDisplayValue();

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={style}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border border-zinc-200 rounded-xl bg-white  transition-all duration-200 text-left text-sm font-medium ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : isOpen
              ? borderFocusClasses[color]
              : "hover:border-zinc-300  hover:shadow-xs"
        }`}
      >
        <span className={displayString ? "text-foreground" : "text-zinc-400 "}>
          {displayString || placeholder}
        </span>
        <svg
          className="w-4 h-4 text-zinc-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mode === "time" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-1.5 rounded-2xl border border-zinc-150  bg-white backdrop-blur-md shadow-xl z-50 p-4 w-70 sm:w-77.5 animate-fadeIn select-none">
          {/* 1. TIME ONLY MODE */}
          {mode === "time" && (
            <div className="flex flex-col items-center py-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 select-none">
                Set Time
              </span>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleTimeChange("hour", true)}
                    className="p-1 text-zinc-400 hover:text-foreground hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer select-none"
                  >
                    ▲
                  </button>
                  <span className="text-2xl font-black">
                    {String(timeState.hour).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTimeChange("hour", false)}
                    className="p-1 text-zinc-400 hover:text-foreground hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer select-none"
                  >
                    ▼
                  </button>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                    HR
                  </span>
                </div>
                <span className="text-2xl font-black text-zinc-300 animate-pulse">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleTimeChange("minute", true)}
                    className="p-1 text-zinc-400 hover:text-foreground hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer select-none"
                  >
                    ▲
                  </button>
                  <span className="text-2xl font-black">
                    {String(timeState.minute).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTimeChange("minute", false)}
                    className="p-1 text-zinc-400 hover:text-foreground hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer select-none"
                  >
                    ▼
                  </button>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                    MIN
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. YEAR ONLY MODE */}
          {mode === "year" && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
                Select Year
              </span>
              <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                {Array.from(
                  { length: 25 },
                  (_, i) => new Date().getFullYear() - 12 + i,
                ).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearClick(yr)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      value === String(yr)
                        ? bgActiveClasses[color]
                        : "hover:bg-zinc-100  text-foreground"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. MONTH ONLY MODE */}
          {mode === "month" && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
                Select Month
              </span>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((mon, idx) => {
                  const mmString = String(idx + 1).padStart(2, "0");
                  const isSelected = value === mmString;
                  return (
                    <button
                      key={mon}
                      type="button"
                      onClick={() => {
                        if (onChange) onChange(mmString);
                        setIsOpen(false);
                      }}
                      className={`py-2.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? bgActiveClasses[color]
                          : "hover:bg-zinc-100  text-foreground"
                      }`}
                    >
                      {mon.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. YEAR-MONTH MODE */}
          {mode === "year-month" && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <button
                  type="button"
                  onClick={() => setCurrentYear((prev) => prev - 1)}
                  className="p-1 rounded-lg hover:bg-zinc-100  text-zinc-650 cursor-pointer"
                >
                  ◀
                </button>
                <span className="text-sm font-extrabold text-foreground">
                  {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentYear((prev) => prev + 1)}
                  className="p-1 rounded-lg hover:bg-zinc-100  text-zinc-650 cursor-pointer"
                >
                  ▶
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((mon, idx) => {
                  const mmString = String(idx + 1).padStart(2, "0");
                  const combined = `${currentYear}-${mmString}`;
                  const isSelected = value === combined;
                  return (
                    <button
                      key={mon}
                      type="button"
                      onClick={() => {
                        if (onChange) onChange(combined);
                        setIsOpen(false);
                      }}
                      className={`py-2.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? bgActiveClasses[color]
                          : "hover:bg-zinc-100  text-foreground"
                      }`}
                    >
                      {mon.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. CALENDAR GENERATION MODES (date, datetime, daterange, month-day) */}
          {(mode === "date" ||
            mode === "datetime" ||
            mode === "daterange" ||
            mode === "month-day") && (
            <div>
              {/* Header Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => changeMonth(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100  text-zinc-600  cursor-pointer"
                >
                  ◀
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-foreground">
                    {MONTH_NAMES[currentMonth]}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 ">
                    {currentYear}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => changeMonth(true)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100  text-zinc-600  cursor-pointer"
                >
                  ▶
                </button>
              </div>

              {/* Week Day Titles */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase mb-2">
                {WEEK_DAYS.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({
                  length: getFirstDayOfMonth(currentYear, currentMonth),
                }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {Array.from({
                  length: getDaysInMonth(currentYear, currentMonth),
                }).map((_, idx) => {
                  const day = idx + 1;
                  const dayDate = new Date(currentYear, currentMonth, day);
                  const dayString = dayDate.toISOString().split("T")[0];

                  let isSelected = false;
                  let isInRange = false;

                  if (mode === "date" && value === dayString) {
                    isSelected = true;
                  } else if (mode === "datetime" && value) {
                    isSelected =
                      new Date(value).toDateString() === dayDate.toDateString();
                  } else if (mode === "month-day") {
                    const mm = String(currentMonth + 1).padStart(2, "0");
                    const dd = String(day).padStart(2, "0");
                    isSelected = value === `${mm}-${dd}`;
                  } else if (
                    mode === "daterange" &&
                    value &&
                    typeof value === "object"
                  ) {
                    if (value.start === dayString || value.end === dayString) {
                      isSelected = true;
                    } else if (value.start && value.end) {
                      const current = new Date(dayString);
                      isInRange =
                        current > new Date(value.start) &&
                        current < new Date(value.end);
                    }
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? bgActiveClasses[color]
                          : isInRange
                            ? `${textActiveClasses[color]} bg-zinc-100 rounded-none`
                            : "hover:bg-zinc-100  text-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Datetime Time spinner add-on */}
              {mode === "datetime" && (
                <div className="mt-4 pt-3 border-t border-zinc-100  flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Set Time:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", false)}
                      className="text-[11px] font-extrabold hover:bg-zinc-100 w-5 h-5 flex items-center justify-center rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-12 text-center bg-zinc-50 py-0.5 rounded border border-zinc-200 ">
                      {String(timeState.hour).padStart(2, "0")}:
                      {String(timeState.minute).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", true)}
                      className="text-[11px] font-extrabold hover:bg-zinc-100 w-5 h-5 flex items-center justify-center rounded cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
