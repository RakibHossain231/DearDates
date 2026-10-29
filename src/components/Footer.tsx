"use client";

import { Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60 py-6 text-center text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>DearDates &copy; 2026</span>
          <span>&mdash; Automated Celebrations & Greetings</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>for busy humans who care</span>
        </div>
      </div>
    </footer>
  );
}
