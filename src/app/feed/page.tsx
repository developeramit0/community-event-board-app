"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, SlidersHorizontal, LogIn } from "lucide-react";
import { EventCard, EventItem } from "@/components/EventCard";
import { EventsGridSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Pagination } from "@/components/Pagination";
import { apiFetch } from "@/lib/api";

interface FeedApiResponse {
  hasFavourites: boolean;
  categories: string[];
  items: EventItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserProfile {
  id: string;
  email: string;
}

function FeedContent() {
  const [feedData, setFeedData] = useState<FeedApiResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setIsAuthChecking(true);
    apiFetch<UserProfile | null>("/api/me")
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  const loadFeed = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<FeedApiResponse>(
        `/api/me/feed?page=${currentPage}&pageSize=9`
      );
      setFeedData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load feed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentPage]);

  useEffect(() => {
    if (currentUser) {
      loadFeed();
    }
  }, [currentUser, loadFeed]);

  const handlePageChange = (newPage: number) => {
    router.push(`/feed?page=${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isAuthChecking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EventsGridSkeleton count={6} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your feed</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Your personal feed shows events curated strictly from your favourite categories.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?from=/feed"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Feed</h1>
          </div>
          <p className="text-sm text-slate-500">
            Handpicked upcoming events matched to your personal categories.
          </p>
        </div>

        <Link
          href="/preferences"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Edit Categories</span>
        </Link>
      </div>

      {isLoading ? (
        <EventsGridSkeleton count={6} />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={loadFeed} />
      ) : feedData && !feedData.hasFavourites ? (
        <EmptyState
          title="No favourite categories chosen"
          description="You haven't selected any favourite categories yet. Pick your favourite categories to tailor your personal feed."
          actionLabel="Choose Categories"
          onAction={() => router.push("/preferences")}
        />
      ) : feedData && feedData.items.length === 0 ? (
        <EmptyState
          title="No upcoming events in your categories"
          description={`There are currently no upcoming events matching your favourite categories (${feedData?.categories.join(
            ", "
          )}). Check back soon or expand your preferences!`}
          actionLabel="Adjust Preferences"
          onAction={() => router.push("/preferences")}
        />
      ) : feedData ? (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Topics:
            </span>
            {feedData.categories.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedData.items.map((event) => (
              <EventCard key={event.id} event={event} isLoggedIn={true} />
            ))}
          </div>

          <Pagination
            page={feedData.page}
            totalPages={feedData.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><EventsGridSkeleton count={6} /></div>}>
      <FeedContent />
    </Suspense>
  );
}
