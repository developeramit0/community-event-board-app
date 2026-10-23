"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { EventFilters } from "@/components/EventFilters";
import { EventCard, EventItem } from "@/components/EventCard";
import { EventsGridSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Pagination } from "@/components/Pagination";
import { apiFetch } from "@/lib/api";

interface EventsApiResponse {
  items: EventItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserProfile {
  id: string;
}

function EventsListContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSearch = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    apiFetch<UserProfile | null>("/api/me")
      .then((user) => setIsLoggedIn(Boolean(user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    if (currentCity) params.set("city", currentCity);
    if (currentSearch) params.set("q", currentSearch);
    params.set("page", currentPage.toString());
    params.set("pageSize", "9");

    try {
      const data = await apiFetch<EventsApiResponse>(`/api/events?${params.toString()}`);
      setEvents(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load events";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentCity, currentSearch, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (filters: { category?: string; city?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.q) params.set("q", filters.q);
    params.set("page", "1");

    router.push(`/events?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/events?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Discover Local Gatherings</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Community Events
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          Find workshops, concerts, food walks, and family activities happening near you.
        </p>
      </div>

      <EventFilters
        currentCategory={currentCategory}
        currentCity={currentCity}
        currentSearch={currentSearch}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <EventsGridSkeleton count={6} />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your search"
          description="We couldn't find any upcoming active events matching your filter criteria. Try resetting the filters."
          actionLabel="Clear all filters"
          onAction={() => handleFilterChange({})}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
            <span>
              Showing <span className="font-semibold text-slate-700">{events.length}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalCount}</span> events
            </span>
            {currentCategory && (
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                Category: {currentCategory}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} isLoggedIn={isLoggedIn} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><EventsGridSkeleton count={6} /></div>}>
      <EventsListContent />
    </Suspense>
  );
}
