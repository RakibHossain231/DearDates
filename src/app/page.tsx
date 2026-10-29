import Link from "next/link";
import { Gift, Sparkles, MessageSquare, Clock, ShieldCheck, Heart, ArrowRight, Zap, Bell, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-200/40 via-purple-100/40 to-amber-100/30 blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs sm:text-sm font-medium mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Automated Wishes for Busy Lives</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
          Never Forget Your Loved Ones&apos;{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Special Dates Again
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Pre-schedule personalized greetings for birthdays, anniversaries, and holidays. Delivered right on time via WhatsApp, SMS, Email, and Telegram &mdash; 100% automatically.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Scheduling Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all flex items-center justify-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600 text-xs sm:text-sm font-medium">
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp & Direct SMS</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>AI Wish Crafter</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>24h Auto-Cleanup</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Edit Anytime</span>
          </div>
        </div>
      </section>

      {/* 4 Multi-Channel Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Supported Delivery Channels</h2>
          <p className="mt-2 text-slate-600">Send greetings through the channels people actually check every day</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WhatsApp */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs glow-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">WhatsApp</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Direct message to their WhatsApp phone number. Instant, intimate, and never missed.
            </p>
            <div className="mt-4 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Most Popular
            </div>
          </div>

          {/* Direct SMS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs glow-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Direct Phone SMS</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Arrives directly on their mobile phone network inbox without requiring internet on recipient&apos;s phone.
            </p>
            <div className="mt-4 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              Universal Reach
            </div>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs glow-card">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Celebration Email</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Beautiful rich HTML greeting card delivered straight into their email inbox.
            </p>
            <div className="mt-4 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
              Rich Media
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs glow-card">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Telegram Bot</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Lightning-fast automated alerts and customized greetings right into Telegram chats.
            </p>
            <div className="mt-4 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
              100% Free API
            </div>
          </div>
        </div>
      </section>

      {/* Smart Retention & Editing Highlight */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">24-Hour Auto-Cleanup</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                One-time wishes are kept for 24 hours so you can confirm delivery, then automatically purged from the database to keep storage clean and lightweight.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Edit Repeated Wishes Anytime</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Yearly birthday wishes advance automatically to the next year. You can change your message, update photos, or edit details whenever inspiration strikes.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Multi-Channel OTP Recovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Never lose access to your account. Recover your password via 6-digit OTP sent to your verified Email, WhatsApp, or Phone number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Make Someone Smile on Their Special Day
        </h2>
        <p className="mt-3 text-slate-600">
          Setup takes less than 60 seconds. Free forever for personal use.
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
