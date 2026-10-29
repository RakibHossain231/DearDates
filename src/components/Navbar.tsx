"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Calendar, PlusCircle, User, LogOut, Clock, Gift } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Calendar },
    { name: "Schedule Wish", href: "/wishes/new", icon: PlusCircle },
    { name: "Activity Logs", href: "/activity", icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AutoWISH
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Never Forget
            </span>
          </div>
        </Link>

        {/* Navigation items for logged-in user */}
        {user ? (
          <nav className="flex items-center space-x-1 sm:space-x-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}

            <div className="h-5 w-[1px] bg-slate-200 mx-2" />

            {/* Profile Dropdown / Link */}
            <Link
              href="/profile"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
                pathname === "/profile"
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all hover:scale-[1.02]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
