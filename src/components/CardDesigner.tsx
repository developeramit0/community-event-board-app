"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Save, Info, AlertCircle, X } from "lucide-react";
import { AVAILABLE_STICKERS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { formatEventDate, formatPrice } from "@/lib/format";
import { useToast } from "./Toast";
import { EventItem } from "./EventCard";

interface CardDesignData {
  theme: string;
  stickers: string[];
}

interface CardDesignerProps {
  event: EventItem;
  initialDesign?: CardDesignData | null;
  isLoggedIn?: boolean;
}

const THEME_GRADIENTS: Record<string, { id: string; name: string; bg: string }> = {
  sunset: {
    id: "sunset",
    name: "Sunset Glow",
    bg: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #9333ea 100%)",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Breeze",
    bg: "linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #4338ca 100%)",
  },
  forest: {
    id: "forest",
    name: "Mystic Forest",
    bg: "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #1c1917 100%)",
  },
};

export function CardDesigner({
  event,
  initialDesign,
  isLoggedIn = false,
}: CardDesignerProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(initialDesign?.theme || "sunset");
  const [stickers, setStickers] = useState<string[]>(initialDesign?.stickers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [maxWarning, setMaxWarning] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (initialDesign) {
      setSelectedTheme(initialDesign.theme || "sunset");
      setStickers(initialDesign.stickers || []);
    }
  }, [initialDesign]);

  const toggleSticker = (sticker: string) => {
    if (stickers.includes(sticker)) {
      setStickers(stickers.filter((s) => s !== sticker));
      setMaxWarning(false);
    } else {
      if (stickers.length >= 3) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 3000);
        return;
      }
      setStickers([...stickers, sticker]);
      setMaxWarning(false);
    }
  };

  const removeSticker = (sticker: string) => {
    setStickers(stickers.filter((s) => s !== sticker));
    setMaxWarning(false);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      error("Please sign in to save your custom event card design");
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch(`/api/events/${event.id}/card`, {
        method: "PUT",
        body: JSON.stringify({
          theme: selectedTheme,
          stickers,
        }),
      });
      success("Custom card design saved successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save design";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const activeGradient = THEME_GRADIENTS[selectedTheme] || THEME_GRADIENTS.sunset;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Interactive Card Designer
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Personalize and stylize your commemorative event card with custom themes and stickers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save Card"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Choose Background Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(THEME_GRADIENTS).map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="h-6 w-full rounded-md mb-2 shadow-xs"
                      style={{ background: th.bg }}
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {th.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Add Stickers ({stickers.length}/3)
              </label>
              {maxWarning && (
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> Max 3 stickers allowed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Tap any sticker to toggle it on or off your card.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {AVAILABLE_STICKERS.map((sticker) => {
                const isSelected = stickers.includes(sticker);
                return (
                  <button
                    key={sticker}
                    onClick={() => toggleSticker(sticker)}
                    className={`w-11 h-11 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-2xl border transition-all duration-200 flex items-center justify-center shadow-xs active:scale-90 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 scale-105"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                    aria-label={`Toggle sticker ${sticker}`}
                  >
                    {sticker}
                  </button>
                );
              })}
            </div>
          </div>

          {stickers.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Applied Stickers:
              </span>
              <div className="flex flex-wrap gap-2">
                {stickers.map((s, idx) => (
                  <span
                    key={`${s}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => removeSticker(s)}
                      className="text-slate-400 hover:text-rose-600 transition p-0.5"
                      aria-label={`Remove sticker ${s}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                You are currently in guest preview mode. Sign in to permanently save this card design to your profile.
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Live Card Preview
            </span>

            <div
              className="relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-xl transition-all duration-500 text-white min-h-[300px] flex flex-col justify-between"
              style={{ background: activeGradient.bg }}
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
                  {event.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md">
                  📍 {event.city}
                </span>
              </div>

              <div className="my-6">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug drop-shadow-sm mb-2">
                  {event.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-medium">
                  🗓️ {formatEventDate(event.startsAt)}
                </p>
                <p className="text-xs text-white/80 mt-1 font-semibold">
                  🎟️ {formatPrice(event.priceInPaise)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-auto">
                <div className="flex items-center gap-2 min-h-[40px]">
                  {stickers.length === 0 ? (
                    <span className="text-xs text-white/60 italic">
                      No stickers added yet
                    </span>
                  ) : (
                    stickers.map((stk, i) => (
                      <span
                        key={`${stk}-${i}`}
                        className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-md animate-popIn"
                      >
                        {stk}
                      </span>
                    ))
                  )}
                </div>

                <span className="text-[11px] font-medium tracking-wider uppercase text-white/60">
                  Community Pass
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
