"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Repeat,
  MessageSquare,
  Mail,
  Phone,
  Send,
  Edit3,
  Trash2,
  Sparkles,
  RefreshCw,
  Search,
} from "lucide-react";
import { format } from "date-fns";

interface Wish {
  id: string;
  recipientName: string;
  channel: string;
  recipientContact: string;
  scheduledDate: string;
  repeat: string;
  message: string;
  category: string;
  status: string;
  lastSentAt?: string;
  autoDeleteAt?: string;
}

export default function DashboardPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [cronRunning, setCronRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch(`/api/wishes?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes || []);
      }
    } catch (err) {
      console.error("Failed to load wishes:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the scheduled wish for ${name}?`)) return;

    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
        setStatusMessage("Wish removed successfully");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch {
      alert("Failed to delete wish");
    }
  };

  const handleManualCron = async () => {
    setCronRunning(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/cron/dispatch", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(
          `Cron executed! Dispatched: ${data.summary?.dispatchedCount || 0}, Cleaned up: ${
            data.summary?.cleanedUpCount || 0
          }`
        );
        fetchWishes();
      } else {
        setStatusMessage(`Cron trigger failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      setStatusMessage("Failed to connect to scheduler");
    } finally {
      setCronRunning(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const filteredWishes = wishes.filter((w) =>
    w.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    w.message.toLowerCase().includes(search.toLowerCase()) ||
    w.recipientContact.includes(search)
  );

  const pendingCount = wishes.filter((w) => w.status === "PENDING").length;
  const sentCount = wishes.filter((w) => w.status === "SENT").length;
  const recurringCount = wishes.filter((w) => w.repeat !== "NONE").length;

  const getChannelBadge = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <MessageSquare className="w-3 h-3" />
            <span>WhatsApp</span>
          </span>
        );
      case "SMS":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Phone className="w-3 h-3" />
            <span>Phone SMS</span>
          </span>
        );
      case "EMAIL":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Mail className="w-3 h-3" />
            <span>Email</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
            <Send className="w-3 h-3" />
            <span>{channel}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Celebration Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your scheduled wishes, automated greetings, and recurring dates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualCron}
            disabled={cronRunning}
            title="Check and trigger pending wishes immediately"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center space-x-2 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${cronRunning ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Check Now</span>
          </button>

          <Link
            href="/wishes/new"
            className="px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center space-x-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Wish</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} className="text-indigo-400 hover:text-indigo-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Wishes</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent (24h retention)</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{sentCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeated (Yearly/Monthly)</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{recurringCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "PENDING", "SENT", "FAILED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "ALL" ? "All Wishes" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Wishes Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-sm">Loading scheduled wishes...</p>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No scheduled wishes found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You don&apos;t have any wishes matching this criteria. Schedule your first wish now so you never miss an important date!
          </p>
          <div className="mt-6">
            <Link
              href="/wishes/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule First Wish</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWishes.map((wish) => {
            const dateObj = new Date(wish.scheduledDate);
            const isSent = wish.status === "SENT";
            const isFailed = wish.status === "FAILED";

            return (
              <div
                key={wish.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between glow-card relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center uppercase text-sm shadow-xs">
                        {wish.recipientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">
                          {wish.recipientName}
                        </h3>
                        <p className="text-xs text-slate-500">{wish.recipientContact}</p>
                      </div>
                    </div>

                    {getChannelBadge(wish.channel)}
                  </div>

                  {/* Scheduled Date & Repeat badge */}
                  <div className="flex flex-wrap items-center gap-2 my-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{format(dateObj, "MMM d, yyyy • h:mm a")}</span>
                    </div>

                    {wish.repeat !== "NONE" ? (
                      <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        <Repeat className="w-3 h-3" />
                        <span>Repeats {wish.repeat.toLowerCase()}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">One-time</span>
                    )}
                  </div>

                  {/* Message Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50/70 text-slate-700 text-xs leading-relaxed line-clamp-3 italic border border-slate-100">
                    &ldquo;{wish.message}&rdquo;
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    {isSent ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered {wish.repeat === "NONE" && "(Purges in 24h)"}</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center space-x-1 text-red-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed to deliver</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-indigo-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled & Waiting</span>
                      </span>
                    )}

                    <span className="text-[11px] font-medium text-slate-400 capitalize">
                      {wish.category.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/wishes/edit/${wish.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Message</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(wish.id, wish.recipientName)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete this wish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
