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
  value?: any;
  onChange?: (val: any) => void;
  color?: "primary" | "secondary" | "accent" | "highlight" | "neutral";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEK_DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateToDisplay(dateString: string): string {
  if (!dateString) return "";

  // Si es una fecha ISO (YYYY-MM-DD)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Si es un objeto Date o ISO string con hora
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    return dateString;
  }

  return dateString;
}

export default function DateTimePicker({
  mode = "date",
  value,
  onChange,
  color = "primary",
  placeholder = "Seleccionar fecha/hora",
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
  const [yearInput, setYearInput] = useState("");
  const [showYearInput, setShowYearInput] = useState(false);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowYearInput(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleDayClick(day: number) {
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
  }

  function handleTimeChange(type: "hour" | "minute", increment: boolean) {
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
  }

  function handleYearClick(year: number) {
    if (mode === "year") {
      if (onChange) onChange(String(year));
      setIsOpen(false);
    } else {
      setCurrentYear(year);
      setShowYearInput(false);
    }
  }

  function handleYearInputSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const year = parseInt(yearInput, 10);
      if (!isNaN(year) && year >= 1900 && year <= 2100) {
        handleYearClick(year);
        setYearInput("");
      }
    }
  }

  function changeMonth(increment: boolean) {
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
  }

  function jumpToToday() {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  function getDisplayValue() {
    if (!value) return "";

    if (mode === "daterange" && typeof value === "object") {
      if (!value.start) return "";
      const startFormatted = formatDateToDisplay(value.start);
      const endFormatted = value.end ? formatDateToDisplay(value.end) : "...";
      return `${startFormatted} hasta ${endFormatted}`;
    }

    if (typeof value === "string") {
      if (mode === "datetime") {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${day}/${month}/${year} ${hours}:${minutes}`;
          }
          return value;
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

      // Para modo "date" o cualquier otro, aplicamos formato dd/MM/yyyy
      if (mode === "date" || mode === "month-day") {
        return formatDateToDisplay(value);
      }

      return value;
    }

    return String(value);
  }

  const displayString = getDisplayValue();

  // Quick month jump buttons
  const quickMonthJumps = [-6, -3, -1, 0, 1, 3, 6];

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
        className={`w-full flex items-center justify-between px-3 py-2 border border-zinc-200 rounded-xl bg-white transition-all duration-200 text-left text-sm font-medium ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : isOpen
              ? borderFocusClasses[color]
              : "hover:border-zinc-300 hover:shadow-xs"
        }`}
      >
        <span className={displayString ? "text-foreground" : "text-zinc-400"}>
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
        <div className="absolute mt-1.5 rounded-2xl bg-white backdrop-blur-md shadow-xl z-50 p-4 w-70 sm:w-77.5 animate-fadeIn select-none">
          {mode === "time" && (
            <div className="flex flex-col items-center py-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 select-none">
                Seleccionar Hora
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
                    Hora
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
                    Min
                  </span>
                </div>
              </div>
            </div>
          )}

          {mode === "year" && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
                Seleccionar Año
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
                        : "hover:bg-zinc-100 text-foreground"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "month" && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
                Seleccionar Mes
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
                          : "hover:bg-zinc-100 text-foreground"
                      }`}
                    >
                      {mon.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "year-month" && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <button
                  type="button"
                  onClick={() => setCurrentYear((prev) => prev - 1)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-650 cursor-pointer"
                >
                  ◀
                </button>
                <span className="text-sm font-extrabold text-foreground">
                  {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentYear((prev) => prev + 1)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-650 cursor-pointer"
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
                          : "hover:bg-zinc-100 text-foreground"
                      }`}
                    >
                      {mon.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(mode === "date" ||
            mode === "datetime" ||
            mode === "daterange" ||
            mode === "month-day") && (
            <div>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeMonth(false)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                      title="Mes anterior"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(true)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                      title="Mes siguiente"
                    >
                      ▶
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={currentMonth}
                        onChange={(e) => {
                          setCurrentMonth(parseInt(e.target.value, 10));
                          setShowYearInput(false);
                        }}
                        className="text-sm font-bold text-foreground bg-transparent border border-zinc-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {MONTH_NAMES.map((month, idx) => (
                          <option key={idx} value={idx}>
                            {month.slice(0, 3)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {showYearInput ? (
                      <input
                        type="number"
                        value={yearInput || currentYear}
                        onChange={(e) => setYearInput(e.target.value)}
                        onKeyDown={handleYearInputSubmit}
                        onBlur={() => {
                          if (yearInput) {
                            const year = parseInt(yearInput, 10);
                            if (!isNaN(year) && year >= 1900 && year <= 2100) {
                              handleYearClick(year);
                            }
                          }
                          setYearInput("");
                          setShowYearInput(false);
                        }}
                        className="w-16 text-sm font-bold text-foreground bg-white border border-zinc-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                        min={1900}
                        max={2100}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setYearInput(String(currentYear));
                          setShowYearInput(true);
                        }}
                        className="text-sm font-bold text-foreground hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {currentYear} ▼
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={jumpToToday}
                    className="px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>

                <div className="flex gap-1 justify-center flex-wrap">
                  {quickMonthJumps.map((jump) => {
                    const label =
                      jump === 0
                        ? "Este"
                        : `${Math.abs(jump)}${jump > 0 ? "+" : "-"}`;
                    return (
                      <button
                        key={jump}
                        type="button"
                        onClick={() => {
                          const targetMonth = currentMonth + jump;
                          if (targetMonth >= 0 && targetMonth < 12) {
                            setCurrentMonth(targetMonth);
                          } else {
                            const yearOffset = Math.floor(targetMonth / 12);
                            const adjustedMonth =
                              ((targetMonth % 12) + 12) % 12;
                            setCurrentYear(currentYear + yearOffset);
                            setCurrentMonth(adjustedMonth);
                          }
                        }}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer ${
                          jump === 0
                            ? `${textActiveClasses[color]} bg-primary/10`
                            : "hover:bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase mb-2">
                {WEEK_DAYS.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

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
                            : "hover:bg-zinc-100 text-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {mode === "datetime" && (
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Seleccionar Hora:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", false)}
                      className="text-[11px] font-extrabold hover:bg-zinc-100 w-5 h-5 flex items-center justify-center rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-12 text-center bg-zinc-50 py-0.5 rounded border border-zinc-200">
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
