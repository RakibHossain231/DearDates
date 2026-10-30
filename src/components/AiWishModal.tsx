"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Wand2, Check, RefreshCw } from "lucide-react";
import { OCCASIONS } from "@/lib/occasions";

interface AiWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWish: (wishText: string) => void;
  defaultRecipient?: string;
  defaultCategory?: string;
}

const RELATIONSHIPS = [
  { value: "Best Friend", label: "🤝 Best Friend (বেস্ট ফ্রেন্ড)" },
  { value: "Close Friend", label: "👥 Friend / Buddy (বন্ধু / বান্ধবী)" },
  { value: "Mother", label: "👩 Mother (মা)" },
  { value: "Father", label: "👨 Father (বাবা)" },
  { value: "Brother", label: "👦 Brother (ভাই)" },
  { value: "Sister", label: "👧 Sister (বোন)" },
  { value: "Husband", label: "💍 Husband (স্বামী)" },
  { value: "Wife", label: "👰 Wife (স্ত্রী)" },
  { value: "Partner / Lover", label: "💖 Romantic Partner / Lover (ভালোবাসার মানুষ)" },
  { value: "Fiancé / Fiancée", label: "💍 Fiancé / Fiancée (হবু জীবনসঙ্গী)" },
  { value: "Son", label: "👶 Son (ছেলে)" },
  { value: "Daughter", label: "👧 Daughter (মেয়ে)" },
  { value: "Cousin", label: "🧑‍🤝‍🧑 Cousin (কাজিন)" },
  { value: "Grandparent", label: "👴 Grandparent (দাদা-দাদী / নানা-নানী)" },
  { value: "Uncle / Aunt", label: "👨‍👩‍👧 Uncle / Aunt (চাচা / মামা / খালা / ফুফু)" },
  { value: "Teacher / Mentor", label: "🎓 Teacher / Mentor (শিক্ষক / গুরু)" },
  { value: "Boss / Leader", label: "👔 Boss / Manager (বস / টিম লিডার)" },
  { value: "Colleague", label: "💼 Colleague / Coworker (সহকর্মী)" },
  { value: "Client / Partner", label: "🤝 Business Client / Partner (ক্লায়েন্ট / পার্টনার)" },
  { value: "Family Friend", label: "🏡 Family Friend / Neighbor (পারিবারিক বন্ধু)" },
];

const TONES = [
  { value: "Warm & Heartfelt", label: "❤️ Warm & Heartfelt (আবেগঘন ও আন্তরিক)" },
  { value: "Funny & Playful", label: "🤣 Funny & Playful (মজার ও খুনসুটিপূর্ণ)" },
  { value: "Sweet & Romantic", label: "💖 Sweet & Romantic (মিষ্টি ও রোমান্টিক)" },
  { value: "Blessed & Islamic Duas", label: "🤲 Blessed & Islamic Duas (দোয়া ও বরকতপূর্ণ)" },
  { value: "Poetic & Aesthetic", label: "📖 Poetic & Aesthetic (কাব্যিক ও নান্দনিক)" },
  { value: "Inspiring & Motivational", label: "🚀 Inspiring & Motivational (অনুপ্রেরণাদায়ক)" },
  { value: "Formal & Respectful", label: "👔 Formal & Respectful (মার্জিত ও সম্মানজনক)" },
  { value: "Short, Punchy & Sweet", label: "⚡ Short, Punchy & Sweet (সংক্ষিপ্ত ও মিষ্টি)" },
  { value: "Friendly Roasting", label: "🔥 Friendly Roasting & Sarcasm (বন্ধুত্বপূর্ণ রোস্টিং)" },
  { value: "Emotional & Nostalgic", label: "🥺 Emotional & Nostalgic (স্মৃতিবিজড়িত ও গভীর)" },
];

const LANGUAGES = [
  { value: "bn", label: "🇧🇩 বাংলা (Pure Bengali)" },
  { value: "banglish", label: "🔤 Banglish (বাংলা ইন ইংলিশ হরফ)" },
  { value: "en", label: "🇬🇧 English (Global English)" },
  { value: "islamic", label: "🕌 ইসলামিক মোবারকবাদ (Islamic Greetings + Bangla)" },
  { value: "formal_bn", label: "📜 সাধু ও মার্জিত বাংলা (Formal Bengali)" },
];

export default function AiWishModal({
  isOpen,
  onClose,
  onSelectWish,
  defaultRecipient = "",
  defaultCategory = "BIRTHDAY",
}: AiWishModalProps) {
  const [recipientName, setRecipientName] = useState(defaultRecipient);
  const [relationship, setRelationship] = useState("Best Friend");
  const [occasion, setOccasion] = useState(defaultCategory);
  const [tone, setTone] = useState("Warm & Heartfelt");
  const [language, setLanguage] = useState("bn");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedWish, setGeneratedWish] = useState("");

  // Sync recipient name and occasion from scheduling form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultRecipient) setRecipientName(defaultRecipient);
      if (defaultCategory) setOccasion(defaultCategory);
      setGeneratedWish("");
    }
  }, [isOpen, defaultRecipient, defaultCategory]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!recipientName.trim()) {
      alert("Please enter the recipient's name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          relationship,
          occasion,
          tone,
          language,
          extraNotes: extraNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.wish) {
        setGeneratedWish(data.wish);
      } else {
        alert(data.error || "Failed to generate wish");
      }
    } catch {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">AI Wish Crafter</h3>
              <p className="text-xs text-slate-500">Personalized, thoughtful greetings in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Inputs */}
        <div className="space-y-4 my-4">
          {/* Occasion (Auto-selected from main form) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Celebration Occasion *
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-medium text-slate-800"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.emoji} {occ.label}
                </option>
              ))}
            </select>
          </div>

          {/* Name & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Auth, Farhana"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel.value} value={rel.value}>
                    {rel.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tone & Mood *
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Language *
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Extra Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Extra details / memories (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. loves biriyani, turning 25, always helps others"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Unique Wish...</span>
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
            <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generated Wish:</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Another</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-purple-100 text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs font-normal">
                {generatedWish}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleUseThis}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-1.5 shadow-md shadow-indigo-100 cursor-pointer transition-all"
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
