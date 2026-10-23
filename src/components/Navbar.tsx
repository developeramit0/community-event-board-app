"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Compass,
  SlidersHorizontal,
  ShieldAlert,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const data = await apiFetch<UserProfile | null>("/api/me");
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    checkUserSession();
  }, [pathname]);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch("/api/me", { method: "DELETE" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      setShowLogoutModal(false);
      router.push("/events");
      router.refresh();
    } catch {
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { label: "Events", href: "/events", icon: CalendarDays },
    ...(user
      ? [
          { label: "My Feed", href: "/feed", icon: Compass },
          { label: "Preferences", href: "/preferences", icon: SlidersHorizontal },
        ]
      : []),
    ...(user?.role === "ADMIN"
      ? [{ label: "Admin Board", href: "/admin", icon: ShieldAlert }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/events"
            className="flex items-center gap-2.5 font-black text-lg sm:text-xl text-slate-900 tracking-tight hover:opacity-90 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>
              Community<span className="text-indigo-600">Events</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/events"
                  ? pathname === "/events" || pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2">
                  <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[140px]">
                      {user.email}
                    </span>
                    <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider block">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-xl transition"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition shadow-indigo-100"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <>
          <div
            className={`fixed inset-0 z-[9900] bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className={`fixed top-0 right-0 bottom-0 z-[9950] w-[82vw] max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900">
                  Community<span className="text-indigo-600">Events</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Menu
              </span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/events"
                    ? pathname === "/events" || pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                    <span className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user.email}
                      </p>
                      <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {mounted && showLogoutModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center relative z-10 m-auto animate-popIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 id="logout-modal-title" className="text-xl font-bold text-slate-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to log out of your session? You can sign back in at any time.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-xs sm:text-sm font-semibold text-white shadow-xs transition"
              >
                {isLoggingOut ? "Logging out..." : "Yes, Log Out"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
