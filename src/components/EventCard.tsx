"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { formatPrice, formatEventDate } from "@/lib/format";
import { RemindButton } from "./RemindButton";

export interface EventItem {
  id: string;
  title: string;
  category: string;
  city: string;
  startsAt: string | Date;
  priceInPaise: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isReminded?: boolean;
}

interface EventCardProps {
  event: EventItem;
  isLoggedIn?: boolean;
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

export function EventCard({ event, isLoggedIn = false }: EventCardProps) {
  const [imgSrc, setImgSrc] = useState(event.imageUrl);

  useEffect(() => {
    setImgSrc(event.imageUrl);
  }, [event.imageUrl]);

  const formattedPrice = formatPrice(event.priceInPaise);
  const formattedDate = formatEventDate(event.startsAt);
  const badgeClass = CATEGORY_STYLES[event.category] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={imgSrc || FALLBACK_IMAGE}
          alt={event.title}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs backdrop-blur-sm ${badgeClass}`}>
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <RemindButton
            eventId={event.id}
            initialIsReminded={event.isReminded}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
            <span className="flex items-center gap-1 font-medium text-indigo-600">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0 font-medium text-slate-600">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{event.city}</span>
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
            <Link href={`/events/${event.id}`} className="focus:outline-none">
              {event.title}
            </Link>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Price
            </span>
            <span className="text-base font-bold text-slate-900">
              {formattedPrice}
            </span>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-xs font-semibold rounded-lg transition-all"
            aria-label={`View details for ${event.title}`}
          >
            View Event
          </Link>
        </div>
      </div>
    </article>
  );
}
