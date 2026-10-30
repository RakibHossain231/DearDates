"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gift,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Verification step (for unverified accounts)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Step 1: Normal Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard");
        router.refresh();
      } else if (data.requiresVerification) {
        setNeedsVerification(true);
        setSuccessMsg(data.message || "Please enter the 6-digit OTP sent to your contact.");
        if (data.otpCode) {
          setDevCode(data.otpCode);
        }
      } else {
        setError(data.error || "Failed to log in. Please check your credentials.");
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Verification & Auto-Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: otpCode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Account verified successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Invalid or expired verification code");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || "A fresh verification code has been dispatched!");
        if (data.otpCode) {
          setDevCode(data.otpCode);
        }
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch {
      setError("Network error while resending verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100 mb-3">
            {needsVerification ? <KeyRound className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {needsVerification ? "Verify Your Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {needsVerification
              ? `Enter the 6-digit code sent to ${identifier}`
              : "Sign in with Email or Phone Number"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {!needsVerification ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="your@email.com or +88017..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Entry Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {devCode && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5 text-amber-900">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Instant Verification Code:</span>
                  </span>
                  <span className="text-base font-extrabold tracking-widest text-indigo-700 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-xs">
                    {devCode}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Use this instant code to complete your verification and sign in right away!
                </p>
                <button
                  type="button"
                  onClick={() => setOtpCode(devCode)}
                  className="w-full py-2 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1 shadow-xs"
                >
                  <span>⚡ Auto-fill Code ({devCode})</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                Enter the 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 text-center tracking-widest text-2xl font-bold rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Sign In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setNeedsVerification(false)}
                className="text-xs text-slate-500 hover:text-indigo-600"
              >
                ← Back to Password
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
