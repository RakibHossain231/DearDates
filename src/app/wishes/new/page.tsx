"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Gift,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Repeat,
} from "lucide-react";
import AiWishModal from "@/components/AiWishModal";

export default function NewWishPage() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS" | "EMAIL" | "TELEGRAM">("WHATSAPP");
  const [recipientContact, setRecipientContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("00:01"); // Midnight default!
  const [repeat, setRepeat] = useState<"NONE" | "YEARLY" | "MONTHLY">("YEARLY");
  const [category, setCategory] = useState("BIRTHDAY");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const getContactPlaceholder = () => {
    switch (channel) {
      case "WHATSAPP":
        return "Recipient's WhatsApp number (e.g. +8801712345678)";
      case "SMS":
        return "Recipient's Mobile number (e.g. 01712345678)";
      case "EMAIL":
        return "Recipient's Email address (e.g. friend@gmail.com)";
      case "TELEGRAM":
        return "Telegram Chat ID or @username";
      default:
        return "Contact address";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipientName || !recipientContact || !scheduledDate || !message) {
      setError("Please complete all required fields");
      return;
    }

    const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime || "00:00"}:00`);
    if (isNaN(combinedDateTime.getTime())) {
      setError("Please select a valid date and time");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          channel,
          recipientContact,
          scheduledDate: combinedDateTime.toISOString(),
          repeat,
          category,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to schedule wish");
      }
    } catch {
      setError("An unexpected error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule a Celebration Wish</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Set it once, and let AutoWISH deliver it right on time
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient&apos;s Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahat, Mother, Nusrat"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Occasion / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                <option value="BIRTHDAY">🎂 Birthday Celebration</option>
                <option value="ANNIVERSARY">💍 Wedding / Anniversary</option>
                <option value="NEW_YEAR">🎆 New Year Celebration</option>
                <option value="CUSTOM">🌟 Special Event / Custom</option>
              </select>
            </div>
          </div>

          {/* Delivery Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Delivery Channel *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare, color: "emerald" },
                { id: "SMS", label: "Direct SMS", icon: Phone, color: "blue" },
                { id: "EMAIL", label: "Email", icon: Mail, color: "indigo" },
                { id: "TELEGRAM", label: "Telegram", icon: Send, color: "sky" },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = channel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id as "WHATSAPP" | "SMS" | "EMAIL" | "TELEGRAM")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recipient Contact Information *
            </label>
            <input
              type="text"
              required
              placeholder={getContactPlaceholder()}
              value={recipientContact}
              onChange={(e) => setRecipientContact(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scheduled Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Exact Time (24h format)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: 00:01 sends right at the beginning of their special day!
              </p>
            </div>
          </div>

          {/* Recurrence Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Repeat Frequency
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "YEARLY",
                  label: "Every Year",
                  desc: "Ideal for birthdays. Message is editable anytime before next year!",
                },
                {
                  id: "NONE",
                  label: "One-Time",
                  desc: "Sent once. Automatically cleaned up 24h after sending.",
                },
                {
                  id: "MONTHLY",
                  label: "Every Month",
                  desc: "Repeats monthly on this day.",
                },
              ].map((r) => {
                const isSelected = repeat === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRepeat(r.id as "NONE" | "YEARLY" | "MONTHLY")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-800">
                      <Repeat className="w-3.5 h-3.5 text-amber-600" />
                      <span>{r.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Box with AI Helper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Greeting Message *
              </label>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:scale-105 transition-transform"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Craft with AI</span>
              </button>
            </div>

            <textarea
              required
              rows={4}
              placeholder="Write your heartfelt message here, or click 'Craft with AI' to generate a personalized wish in Bengali or English..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>Supports emojis and multiple languages</span>
              <span>{message.length} characters</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:scale-[1.01] transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Schedule Wish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Modal */}
      <AiWishModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectWish={(text) => setMessage(text)}
        defaultRecipient={recipientName}
        defaultCategory={category}
      />
    </div>
  );
}
