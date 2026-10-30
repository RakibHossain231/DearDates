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
  Globe,
} from "lucide-react";
import AiWishModal from "@/components/AiWishModal";
import CountrySelect from "@/components/CountrySelect";
import { OCCASIONS } from "@/lib/occasions";
import { fromZonedTime } from "date-fns-tz";

export default function NewWishPage() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["WHATSAPP"]);
  const [contacts, setContacts] = useState<{
    WHATSAPP: string;
    SMS: string;
    EMAIL: string;
    TELEGRAM: string;
  }>({
    WHATSAPP: "",
    SMS: "",
    EMAIL: "",
    TELEGRAM: "",
  });
  const [recipientTimezone, setRecipientTimezone] = useState("Asia/Dhaka");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("00:01"); // Midnight default!
  const [repeat, setRepeat] = useState<"NONE" | "YEARLY" | "MONTHLY">("YEARLY");
  const [deliveryMode, setDeliveryMode] = useState<"DEFAULT" | "PERSONAL_GMAIL">("DEFAULT");
  const [category, setCategory] = useState("BIRTHDAY");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length === 1) return; // Keep at least one
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const selectAllChannels = () => {
    if (selectedChannels.length === 4) {
      setSelectedChannels(["WHATSAPP"]);
    } else {
      setSelectedChannels(["WHATSAPP", "SMS", "EMAIL", "TELEGRAM"]);
    }
  };

  // Copy first non-empty phone number to all selected phone-based channels
  const copyFirstPhoneToAll = () => {
    const phone =
      contacts.WHATSAPP.trim() ||
      contacts.SMS.trim() ||
      contacts.TELEGRAM.trim();

    if (!phone) return;

    setContacts((prev) => ({
      ...prev,
      WHATSAPP: selectedChannels.includes("WHATSAPP") ? phone : prev.WHATSAPP,
      SMS: selectedChannels.includes("SMS") ? phone : prev.SMS,
      TELEGRAM: selectedChannels.includes("TELEGRAM") ? phone : prev.TELEGRAM,
    }));
  };

  const selectedPhoneChannels = selectedChannels.filter((c) => c !== "EMAIL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipientName || !scheduledDate || !message) {
      setError("Please complete all required fields");
      return;
    }

    // Verify each selected channel has its contact filled out
    for (const ch of selectedChannels) {
      const contactVal = contacts[ch as keyof typeof contacts];
      if (!contactVal || !contactVal.trim()) {
        const chName =
          ch === "WHATSAPP"
            ? "WhatsApp"
            : ch === "SMS"
            ? "Direct SMS"
            : ch === "EMAIL"
            ? "Email"
            : "Telegram";
        setError(`Please enter recipient contact info for ${chName}`);
        return;
      }
    }

    let combinedDateTime: Date;
    try {
      // Convert receiver's local time in their timezone directly to UTC instant
      combinedDateTime = fromZonedTime(`${scheduledDate} ${scheduledTime || "00:00"}:00`, recipientTimezone);
    } catch {
      combinedDateTime = new Date(`${scheduledDate}T${scheduledTime || "00:00"}:00`);
    }

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
          channels: selectedChannels,
          contacts,
          channel: selectedChannels[0],
          recipientContact: contacts[selectedChannels[0] as keyof typeof contacts],
          recipientTimezone,
          scheduledDate: combinedDateTime.toISOString(),
          repeat,
          deliveryMode,
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
              Set it once, and let DearDates deliver it right on time
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
                {OCCASIONS.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.emoji} {occ.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Channels (Multi-Channel Supported - Idea 2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Delivery Channels * (Choose one or multiple channels)
              </label>
              <button
                type="button"
                onClick={selectAllChannels}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {selectedChannels.length === 4
                    ? "Reset to Single"
                    : "⚡ Select All (সব মাধ্যমে পাঠান)"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: "WHATSAPP",
                  label: "WhatsApp",
                  icon: MessageSquare,
                  activeClass: "border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20",
                },
                {
                  id: "SMS",
                  label: "Direct SMS",
                  icon: Phone,
                  activeClass: "border-blue-500 bg-blue-50/70 text-blue-800 ring-2 ring-blue-500/20",
                },
                {
                  id: "EMAIL",
                  label: "Email",
                  icon: Mail,
                  activeClass: "border-indigo-500 bg-indigo-50/70 text-indigo-800 ring-2 ring-indigo-500/20",
                },
                {
                  id: "TELEGRAM",
                  label: "Telegram",
                  icon: Send,
                  activeClass: "border-sky-500 bg-sky-50/70 text-sky-800 ring-2 ring-sky-500/20",
                },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = selectedChannels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChannel(c.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 relative cursor-pointer ${
                      isSelected
                        ? `${c.activeClass} font-semibold shadow-xs`
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{c.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedChannels.length > 1 && (
              <p className="text-[11px] text-indigo-700 font-medium">
                ✨ Multi-Channel Delivery: Your wish will be delivered to all {selectedChannels.length} selected channels at the same time!
              </p>
            )}
          </div>

          {/* Recipient Contact Information (Per-Channel Dedicated Cards - Idea 2) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700">
                Recipient Contact Information * ({selectedChannels.length} channel{selectedChannels.length > 1 ? "s" : ""} selected)
              </label>

              {/* Show Copy-to-all button if at least 2 phone-based channels are selected */}
              {selectedPhoneChannels.length > 1 && (
                <button
                  type="button"
                  onClick={copyFirstPhoneToAll}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Copy same number to other channels (এক ক্লিকে কপি করুন)</span>
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 ${selectedChannels.length > 1 ? "sm:grid-cols-2" : ""} gap-3`}>
              {/* WhatsApp Card */}
              {selectedChannels.includes("WHATSAPP") && (
                <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Number *</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +8801712345678 or 017..."
                    value={contacts.WHATSAPP}
                    onChange={(e) => setContacts({ ...contacts, WHATSAPP: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <p className="text-[11px] text-emerald-600">
                    💡 Enter active WhatsApp number with country code
                  </p>
                </div>
              )}

              {/* Telegram Card */}
              {selectedChannels.includes("TELEGRAM") && (
                <div className="p-3.5 rounded-2xl border border-sky-200 bg-sky-50/30 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-800">
                    <Send className="w-4 h-4 text-sky-600" />
                    <span>Telegram Number or @username *</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 017..., +88017... or @username"
                    value={contacts.TELEGRAM}
                    onChange={(e) => setContacts({ ...contacts, TELEGRAM: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 bg-white"
                  />
                  <p className="text-[11px] text-sky-600">
                    💡 Personal Telegram phone number or @username
                  </p>
                </div>
              )}

              {/* Direct SMS Card */}
              {selectedChannels.includes("SMS") && (
                <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-800">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Direct SIM SMS Mobile Number *</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01712345678 or +88017..."
                    value={contacts.SMS}
                    onChange={(e) => setContacts({ ...contacts, SMS: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  />
                  <p className="text-[11px] text-blue-600">
                    💡 Mobile number for direct phone SIM inbox
                  </p>
                </div>
              )}

              {/* Email Card */}
              {selectedChannels.includes("EMAIL") && (
                <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-xs font-bold text-indigo-800">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Recipient Email Address *</span>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="e.g. friend@gmail.com"
                    value={contacts.EMAIL}
                    onChange={(e) => setContacts({ ...contacts, EMAIL: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                  <p className="text-[11px] text-indigo-600">
                    💡 Delivered directly to recipient&apos;s email inbox
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Receiver Location & Country Select */}
          <div>
            <CountrySelect
              value={recipientTimezone}
              onChange={setRecipientTimezone}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
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
