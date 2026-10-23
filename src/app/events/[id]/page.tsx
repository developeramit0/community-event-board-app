"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  ChevronLeft,
  Share2,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice, formatEventDate } from "@/lib/format";
import { RemindButton } from "@/components/RemindButton";
import { CardDesigner } from "@/components/CardDesigner";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/components/Toast";
import { EventItem } from "@/components/EventCard";

interface EventDetailResponse extends EventItem {
  _count?: {
    reminders: number;
  };
  cardDesign?: {
    theme: string;
    stickers: string[];
    updatedAt: string;
  } | null;
}

interface UserProfile {
  id: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";

const CATEGORY_STYLES: Record<string, string> = {
  MUSIC: "bg-purple-100 text-purple-800 border-purple-200",
  WORKSHOP: "bg-blue-100 text-blue-800 border-blue-200",
  FOOD: "bg-orange-100 text-orange-800 border-orange-200",
  SPORTS: "bg-emerald-100 text-emerald-800 border-emerald-200",
  KIDS: "bg-pink-100 text-pink-800 border-pink-200",
};

export default function EventDetailPage() {
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const params = useParams();
  const eventId = params.id as string;
  const { success } = useToast();

  useEffect(() => {
    apiFetch<UserProfile | null>("/api/me")
      .then((u) => setIsLoggedIn(Boolean(u)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const loadEventDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<EventDetailResponse>(`/api/events/${eventId}`);
      setEvent(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load event";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventDetail();
  }, [loadEventDetail]);

  useEffect(() => {
    if (event?.imageUrl) {
      setImgSrc(event.imageUrl);
    }
  }, [event?.imageUrl]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Event link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <ErrorState
          title="Event Not Found"
          message={errorMessage || "Could not retrieve the event you were looking for."}
          onRetry={loadEventDetail}
        />
        <div className="text-center mt-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to all events</span>
          </Link>
        </div>
      </div>
    );
  }

  const badgeClass = CATEGORY_STYLES[event.category] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Events</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-12">
        <div className="relative h-72 sm:h-96 w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc || FALLBACK_IMAGE}
            alt={event.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm mb-2 inline-block ${badgeClass}`}
              >
                {event.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {event.title}
              </h1>
            </div>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition shrink-0"
              title="Share event"
              aria-label="Share event"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900">
                  {formatEventDate(event.startsAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900">{event.city}</span>
              </div>
              {event._count && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{event._count.reminders} people interested</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs uppercase text-slate-400 block font-semibold">
                  Ticket Price
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatPrice(event.priceInPaise)}
                </span>
              </div>
              <RemindButton
                eventId={event.id}
                initialIsReminded={event.isReminded}
                isLoggedIn={isLoggedIn}
                className="px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">About this Event</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>
      </div>

      <CardDesigner
        event={event}
        initialDesign={event.cardDesign}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
