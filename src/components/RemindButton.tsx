"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "./Toast";

interface RemindButtonProps {
  eventId: string;
  initialIsReminded?: boolean;
  isLoggedIn?: boolean;
  className?: string;
}

export function RemindButton({
  eventId,
  initialIsReminded = false,
  isLoggedIn = false,
  className = "",
}: RemindButtonProps) {
  const [isReminded, setIsReminded] = useState(initialIsReminded);
  const [isPending, setIsPending] = useState(false);

  const { error, success } = useToast();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      error("Please sign in to set event reminders");
      router.push(`/login?from=/events/${eventId}`);
      return;
    }

    const previousState = isReminded;
    const nextState = !previousState;
    setIsReminded(nextState);
    setIsPending(true);

    try {
      if (nextState) {
        await apiFetch(`/api/events/${eventId}/reminder`, {
          method: "PUT",
        });
        success("Reminder set for this event!");
      } else {
        await apiFetch(`/api/events/${eventId}/reminder`, {
          method: "DELETE",
        });
        success("Reminder removed");
      }
    } catch (err: unknown) {
      setIsReminded(previousState);
      const msg = err instanceof Error ? err.message : "Failed to update reminder";
      error(`Error: ${msg}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isReminded ? "Remove event reminder" : "Set event reminder"}
      aria-pressed={isReminded}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        isReminded
          ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
          : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : isReminded ? (
        <Bell className="w-3.5 h-3.5 fill-current text-amber-600" />
      ) : (
        <Bell className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>{isReminded ? "Reminded" : "Remind me"}</span>
    </button>
  );
}
