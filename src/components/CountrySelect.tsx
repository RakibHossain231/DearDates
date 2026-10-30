"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Globe, Search, Check, ChevronDown, Clock, Sparkles } from "lucide-react";
import { COUNTRIES, CountryOption, getCurrentTimeInTimezone } from "@/lib/countries";
import { fromZonedTime } from "date-fns-tz";

interface CountrySelectProps {
  value: string; // Timezone string (e.g. "Asia/Dhaka")
  onChange: (timezone: string) => void;
  scheduledDate?: string;
  scheduledTime?: string;
}

export default function CountrySelect({
  value,
  onChange,
  scheduledDate,
  scheduledTime,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country
  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.timezone === value) || COUNTRIES[0];
  }, [value]);

  // Update receiver's live time every 15 seconds
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTimeInTimezone(selectedCountry.timezone));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [selectedCountry.timezone]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const query = search.toLowerCase().trim();
    return COUNTRIES.filter((c) => c.searchKey.includes(query));
  }, [search]);

  // Compute conversion between receiver's local time and sender's local time
  const timeComparison = useMemo(() => {
    if (!scheduledDate || !scheduledTime) return null;
    try {
      const utcTarget = fromZonedTime(
        `${scheduledDate} ${scheduledTime}:00`,
        selectedCountry.timezone
      );
      if (isNaN(utcTarget.getTime())) return null;

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const senderTimeFormatted = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(utcTarget);

      return {
        receiverTime: scheduledTime,
        senderTime: senderTimeFormatted,
        isSameZone: userTimezone === selectedCountry.timezone,
      };
    } catch {
      return null;
    }
  }, [scheduledDate, scheduledTime, selectedCountry.timezone]);

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700">
        Receiver&apos;s Country / Timezone *
      </label>

      {/* Main trigger button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white flex items-center justify-between text-left hover:border-slate-300"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-lg shrink-0">{selectedCountry.flag}</span>
            <span className="font-medium text-slate-800 truncate">
              {selectedCountry.name}
            </span>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold shrink-0">
              {selectedCountry.offset}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 absolute right-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown menu with search */}
        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Header */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search 190+ countries (e.g. Canada, Dubai, London)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 p-1">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No country found matching &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredCountries.map((c: CountryOption) => {
                  const isSelected = c.timezone === selectedCountry.timezone && c.name === selectedCountry.name;
                  return (
                    <button
                      key={`${c.code}-${c.timezone}-${c.name}`}
                      type="button"
                      onClick={() => {
                        onChange(c.timezone);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {c.offset}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Helper & Timezone Information Card */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-indigo-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Current time in {selectedCountry.name}:</span>
          </div>
          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
            {currentTime || selectedCountry.offset}
          </span>
        </div>

        {timeComparison && (
          <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
            {timeComparison.isSameZone ? (
              <p>
                🎯 Delivery is set for <strong>{timeComparison.receiverTime}</strong> local time.
              </p>
            ) : (
              <p>
                🎯 Arrives at <strong>{timeComparison.receiverTime}</strong> in {selectedCountry.name}&apos;s local clock (
                <span className="text-indigo-600 font-medium">{timeComparison.senderTime} in your local time</span>).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
