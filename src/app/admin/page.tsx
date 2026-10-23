"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Shield, MapPin, Calendar, Check, X, RefreshCw, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice, formatEventDate } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

interface AdminEventItem {
  id: string;
  title: string;
  category: string;
  city: string;
  startsAt: string;
  priceInPaise: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    reminders: number;
  };
}

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadAdminEvents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<AdminEventItem[]>("/api/admin/events");
      setEvents(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin events";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminEvents();
  }, [loadAdminEvents]);

  const handleToggleStatus = async (eventId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, isActive: nextStatus } : ev))
    );
    setPendingId(eventId);

    try {
      await apiFetch(`/api/admin/events/${eventId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextStatus }),
      });
      success(`Event status changed to ${nextStatus ? "Active" : "Inactive"}`);
    } catch (err: unknown) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, isActive: currentStatus } : ev))
      );
      const msg = err instanceof Error ? err.message : "Status update failed";
      error(`Error: ${msg}`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-slate-900 text-white rounded-lg">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Admin Event Management
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            View all published and drafted community events. Toggle status without deleting records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminEvents}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={loadAdminEvents} />
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm mb-4">No events found in database.</p>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Event</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Toggle Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const isPending = pendingId === ev.id;
                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !ev.isActive ? "bg-slate-50/30 opacity-75" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-semibold text-slate-900 max-w-xs">
                        <Link
                          href={`/events/${ev.id}`}
                          className="hover:text-indigo-600 transition line-clamp-1"
                        >
                          {ev.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {ev._count?.reminders ?? 0} reminders
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.city}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatEventDate(ev.startsAt)}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs">
                        {formatPrice(ev.priceInPaise)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            ev.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {ev.isActive ? (
                            <>
                              <Check className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(ev.id, ev.isActive)}
                          disabled={isPending}
                          aria-label={`Toggle active state for ${ev.title}`}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            ev.isActive ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          {isPending ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-3 h-3 text-white animate-spin" />
                            </span>
                          ) : (
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                ev.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
