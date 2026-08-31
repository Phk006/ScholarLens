"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import {
  Compass,
  Target,
  Radar,
  FileText,
  User,
  LogOut,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "My Matches", icon: Target },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/applications", label: "Applications", icon: FileText },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "S";

  return (
    <>
      {/* Desktop Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              Scholar<span className="text-emerald-600">Lens</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  initials
                )}
              </div>
            </Link>
            <button
              onClick={() => signOut()}
              className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:block"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-around px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition ${
                  isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition ${
              pathname.startsWith("/profile") ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <User className="h-5 w-5" />
            Profile
          </Link>
        </div>
      </nav>
    </>
  );
}
