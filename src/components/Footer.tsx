"use client";

import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-5 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Copyright */}
        <div className="flex items-center space-x-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>&copy; 2026 DearDates. All rights reserved.</span>
        </div>

        {/* Right: Powered by Builder with LinkedIn link */}
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
          <span className="text-amber-500 font-bold">⚡</span>
          <span>powered by</span>
          <a
            href="https://www.linkedin.com/in/rakibhossain231/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 hover:underline transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <span>Rakib</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
