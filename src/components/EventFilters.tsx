"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, RotateCcw } from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { apiFetch } from "@/lib/api";

interface EventFiltersProps {
  currentCategory?: string;
  currentCity?: string;
  currentSearch?: string;
  onFilterChange: (filters: {
    category?: string;
    city?: string;
    q?: string;
  }) => void;
}

export function EventFilters({
  currentCategory = "",
  currentCity = "",
  currentSearch = "",
  onFilterChange,
}: EventFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [cities, setCities] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    apiFetch<string[]>("/api/events/cities")
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setCities(data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        startTransition(() => {
          onFilterChange({
            category: currentCategory || undefined,
            city: currentCity || undefined,
            q: searchTerm.trim() || undefined,
          });
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, currentSearch, currentCategory, currentCity, onFilterChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      category: val || undefined,
      city: currentCity || undefined,
      q: searchTerm.trim() || undefined,
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      category: currentCategory || undefined,
      city: val || undefined,
      q: searchTerm.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    onFilterChange({});
  };

  const hasActiveFilters = Boolean(currentCategory || currentCity || currentSearch);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition placeholder:text-slate-400"
            aria-label="Search events"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 items-center">
          <div className="relative w-full sm:w-44">
            <select
              value={currentCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-40">
            <select
              value={currentCity}
              onChange={handleCityChange}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 cursor-pointer"
              aria-label="Filter by city"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
