"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, SlidersHorizontal, ArrowRight, Music, Wrench, Utensils, Trophy, Baby, Loader2 } from "lucide-react";
import { EVENT_CATEGORIES, EventCategoryType } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface FavouritesResponse {
  categories: EventCategoryType[];
}

interface UserProfile {
  id: string;
  email: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  MUSIC: <Music className="w-5 h-5" />,
  WORKSHOP: <Wrench className="w-5 h-5" />,
  FOOD: <Utensils className="w-5 h-5" />,
  SPORTS: <Trophy className="w-5 h-5" />,
  KIDS: <Baby className="w-5 h-5" />,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  MUSIC: "Live gigs, indie bands, acoustic sets, jazz fusion & DJ sessions",
  WORKSHOP: "Hands-on tech bootcamps, masterclasses, arts, crafts & culinary labs",
  FOOD: "Street food walks, pop-up cafes, tasting tours & baking workshops",
  SPORTS: "Morning 10Ks, guided hill treks, football tourneys & cycling rides",
  KIDS: "Robotics camps, storytelling, clay pottery & hands-on science activities",
};

export default function PreferencesPage() {
  const [selected, setSelected] = useState<EventCategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useToast();
  const router = useRouter();

  useEffect(() => {
    apiFetch<UserProfile | null>("/api/me")
      .then((user) => {
        if (!user) {
          router.push("/login?from=/preferences");
          return;
        }
        return apiFetch<FavouritesResponse>("/api/me/favourites");
      })
      .then((res) => {
        if (res && res.categories) {
          setSelected(res.categories);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const toggleCategory = (cat: EventCategoryType) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter((c) => c !== cat));
    } else {
      setSelected([...selected, cat]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      error("Please select at least one favourite category");
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch("/api/me/favourites", {
        method: "PUT",
        body: JSON.stringify({ categories: selected }),
      });
      success("Preferences saved successfully!");
      router.push("/feed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save preferences";
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Favourite Categories
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Tailor your personalized feed. Pick the categories of community events you care about most.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-3">
          {EVENT_CATEGORIES.map((category) => {
            const isChecked = selected.includes(category);
            return (
              <div
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 select-none ${
                  isChecked
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleCategory(category);
                  }
                }}
              >
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 transition ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="w-4 h-4" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-indigo-600">
                      {CATEGORY_ICONS[category]}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{category}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            {selected.length} of {EVENT_CATEGORIES.length} categories selected
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/feed"
              className="w-full sm:w-auto text-center px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Skip for now
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs transition active:scale-95"
            >
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
