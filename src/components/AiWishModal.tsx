"use client";

import { useState } from "react";
import { Sparkles, X, Wand2, Check, RefreshCw } from "lucide-react";
import { OCCASIONS } from "@/lib/occasions";

interface AiWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWish: (wishText: string) => void;
  defaultRecipient?: string;
  defaultCategory?: string;
}

export default function AiWishModal({
  isOpen,
  onClose,
  onSelectWish,
  defaultRecipient = "",
  defaultCategory = "BIRTHDAY",
}: AiWishModalProps) {
  const [recipientName, setRecipientName] = useState(defaultRecipient);
  const [relationship, setRelationship] = useState("Friend");
  const [occasion, setOccasion] = useState(defaultCategory);
  const [tone, setTone] = useState("Warm & Heartfelt");
  const [language, setLanguage] = useState<"bn" | "en" | "banglish">("bn");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedWish, setGeneratedWish] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!recipientName) {
      alert("Please enter the recipient's name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          relationship,
          occasion,
          tone,
          language,
          extraNotes,
        }),
      });

      const data = await res.json();
      if (data.wish) {
        setGeneratedWish(data.wish);
      } else {
        alert(data.error || "Failed to generate wish");
      }
    } catch (err) {
      alert("Error contacting AI service");
    } finally {
      setLoading(false);
    }
  };

  const handleUseThis = () => {
    if (generatedWish) {
      onSelectWish(generatedWish);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">AI Wish Crafter</h3>
              <p className="text-xs text-slate-500">Personalized greetings in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Celebration Occasion
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.emoji} {occ.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahim, Farhana"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="Best Friend">Best Friend</option>
                <option value="Friend">Friend</option>
                <option value="Mother">Mother / মা</option>
                <option value="Father">Father / বাবা</option>
                <option value="Brother">Brother / ভাই</option>
                <option value="Sister">Sister / বোন</option>
                <option value="Partner / Spouse">Partner / Spouse</option>
                <option value="Colleague">Colleague / সহকর্মী</option>
                <option value="Mentor / Boss">Mentor / Boss</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tone & Mood
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="Funny & Playful">Funny & Playful (মজার)</option>
                <option value="Warm & Heartfelt">Warm & Heartfelt (আবেগঘন)</option>
                <option value="Poetic & Aesthetic">Poetic (কাবিক)</option>
                <option value="Formal & Respectful">Formal (সম্মানজনক)</option>
                <option value="Short & Sweet">Short & Sweet (সংক্ষিপ্ত)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "bn" | "en" | "banglish")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="bn">বাংলা (Bengali)</option>
                <option value="banglish">Banglish (বাংলা ইন ইংলিশ)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Extra details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. turning 25, loves football, works late hours"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting unique wish...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Wish with AI</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {generatedWish && (
            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700">Preview:</span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {generatedWish}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleUseThis}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use This Wish in Form</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
