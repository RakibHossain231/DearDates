"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
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
  RefreshCw,
  Globe,
} from "lucide-react";
import AiWishModal from "@/components/AiWishModal";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

function EditWishForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS" | "EMAIL" | "TELEGRAM">("WHATSAPP");
  const [recipientContact, setRecipientContact] = useState("");
  const [recipientTimezone, setRecipientTimezone] = useState("Asia/Dhaka");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("00:01");
  const [repeat, setRepeat] = useState<"NONE" | "YEARLY" | "MONTHLY">("YEARLY");
  const [deliveryMode, setDeliveryMode] = useState<"DEFAULT" | "PERSONAL_GMAIL">("DEFAULT");
  const [category, setCategory] = useState("BIRTHDAY");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/wishes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Wish not found");
        return res.json();
      })
      .then((data) => {
        const wish = data.wish;
        if (wish) {
          setRecipientName(wish.recipientName);
          setChannel(wish.channel as "WHATSAPP" | "SMS" | "EMAIL" | "TELEGRAM");
          setRecipientContact(wish.recipientContact);
          if (wish.recipientTimezone) setRecipientTimezone(wish.recipientTimezone);
          setRepeat(wish.repeat as "NONE" | "YEARLY" | "MONTHLY");
          if (wish.deliveryMode) setDeliveryMode(wish.deliveryMode as "DEFAULT" | "PERSONAL_GMAIL");
          setCategory(wish.category);
          setMessage(wish.message);

          const d = new Date(wish.scheduledDate);
          setScheduledDate(format(d, "yyyy-MM-dd"));
          setScheduledTime(format(d, "HH:mm"));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load wish details");
      })
      .finally(() => setLoadingInitial(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!recipientName || !recipientContact || !scheduledDate || !message) {
      setError("Please fill out all required fields");
      return;
    }

    let combinedDateTime: Date;
    try {
      combinedDateTime = fromZonedTime(`${scheduledDate} ${scheduledTime || "00:00"}:00`, recipientTimezone);
    } catch {
      combinedDateTime = new Date(`${scheduledDate}T${scheduledTime || "00:00"}:00`);
    }

    if (isNaN(combinedDateTime.getTime())) {
      setError("Please select a valid date and time");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/wishes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          channel,
          recipientContact,
          recipientTimezone,
          scheduledDate: combinedDateTime.toISOString(),
          repeat,
          deliveryMode,
          category,
          message,
          status: "PENDING",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Wish message & schedule updated successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        setError(data.error || "Failed to update wish");
      }
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading wish details...</p>
      </div>
    );
  }

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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Scheduled Wish</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update greeting message, delivery channel, or schedule date anytime
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
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
                { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
                { id: "SMS", label: "Direct SMS", icon: Phone },
                { id: "EMAIL", label: "Email", icon: Mail },
                { id: "TELEGRAM", label: "Telegram", icon: Send },
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

          {/* Email Delivery Mode Options */}
          {channel === "EMAIL" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-800">
                Email Dispatch Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("DEFAULT")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryMode === "DEFAULT"
                      ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-indigo-700">
                    <span>⚡ DearDates Cloud Delivery (Default)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Delivered automatically. Your name and contact details are clearly shown in the email so the recipient recognizes you.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode("PERSONAL_GMAIL")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryMode === "PERSONAL_GMAIL"
                      ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-800">
                    <span>📬 Personal Gmail Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Delivers directly from your personal Gmail address using the Google App Password configured in your Profile.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Contact Input & Receiver Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Contact Information *
              </label>
              <input
                type="text"
                required
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              {channel === "TELEGRAM" ? (
                <p className="text-[11px] text-sky-600 mt-1">
                  💡 Enter recipient&apos;s phone number or @username! Delivered directly to their personal Telegram chat without needing them to start any bot.
                </p>
              ) : channel === "WHATSAPP" ? (
                <p className="text-[11px] text-emerald-600 mt-1">
                  💡 Enter recipient&apos;s active WhatsApp number with country code (e.g. +88017... or 017...)
                </p>
              ) : channel === "EMAIL" ? (
                <p className="text-[11px] text-indigo-600 mt-1">
                  💡 Enter recipient&apos;s email address. Delivered directly to their inbox on time!
                </p>
              ) : channel === "SMS" ? (
                <p className="text-[11px] text-blue-600 mt-1">
                  💡 Enter recipient&apos;s mobile number (e.g. 017... or +88017...). Delivered directly to their phone SIM message inbox!
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Receiver&apos;s Country / Timezone *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={recipientTimezone}
                  onChange={(e) => setRecipientTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
                >
                  <option value="Asia/Dhaka">🇧🇩 Bangladesh (GMT+6)</option>
                  <option value="Asia/Kolkata">🇮🇳 India (GMT+5:30)</option>
                  <option value="Asia/Dubai">🇦🇪 UAE / Dubai (GMT+4)</option>
                  <option value="Asia/Riyadh">🇸🇦 Saudi Arabia (GMT+3)</option>
                  <option value="Asia/Qatar">🇶🇦 Qatar (GMT+3)</option>
                  <option value="Asia/Kuwait">🇰🇼 Kuwait (GMT+3)</option>
                  <option value="Asia/Muscat">🇴🇲 Oman (GMT+4)</option>
                  <option value="Asia/Kuala_Lumpur">🇲🇾 Malaysia (GMT+8)</option>
                  <option value="Asia/Singapore">🇸🇬 Singapore (GMT+8)</option>
                  <option value="Europe/London">🇬🇧 United Kingdom (GMT+0 / BST)</option>
                  <option value="Europe/Berlin">🇩🇪 Germany / Central Europe (GMT+1)</option>
                  <option value="Europe/Rome">🇮🇹 Italy (GMT+1)</option>
                  <option value="Europe/Paris">🇫🇷 France (GMT+1)</option>
                  <option value="America/New_York">🇺🇸 USA East (New York, Florida - EST)</option>
                  <option value="America/Chicago">🇺🇸 USA Central (Texas, Chicago - CST)</option>
                  <option value="America/Los_Angeles">🇺🇸 USA West (California, Seattle - PST)</option>
                  <option value="America/Toronto">🇨🇦 Canada (Toronto, Montreal)</option>
                  <option value="America/Vancouver">🇨🇦 Canada West (Vancouver)</option>
                  <option value="Australia/Sydney">🇦🇺 Australia (Sydney, Melbourne)</option>
                  <option value="Asia/Tokyo">🇯🇵 Japan (GMT+9)</option>
                  <option value="Asia/Seoul">🇰🇷 South Korea (GMT+9)</option>
                  <option value="Pacific/Auckland">🇳🇿 New Zealand (GMT+12/13)</option>
                  <option value="UTC">🌐 Universal UTC</option>
                </select>
              </div>
            </div>
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
                Exact Time
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
                  desc: "Repeats automatically each year. Editable anytime!",
                },
                {
                  id: "NONE",
                  label: "One-Time",
                  desc: "Sent once. Auto-purged 24h after sending.",
                },
                {
                  id: "MONTHLY",
                  label: "Every Month",
                  desc: "Repeats every month on this date.",
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
                Greeting Message (Editable anytime) *
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>You can freely modify this message before the next scheduled dispatch.</span>
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
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:scale-[1.01] transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              {saving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Wish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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

export default function EditWishPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-slate-500 text-sm">Loading page...</p>
        </div>
      }
    >
      <EditWishForm />
    </Suspense>
  );
}
