import React, { useRef } from "react";
import { SparklesIcon, FileTextIcon, MessageSquareIcon, AlignLeftIcon, EyeIcon, ZapIcon, ArrowDownIcon, MenuIcon } from "./Icons";

interface OnboardingProps {
  onStartWriting: () => void;
  onToggleSidebar?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStartWriting, onToggleSidebar }) => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#453027]/30 backdrop-blur-2xl border-l border-[#BABABA]/15 shadow-[-8px_0_32px_rgba(0,0,0,0.3)] overflow-y-auto z-0 relative scrollbar-none scroll-smooth">
      {/* Mobile Header Toggle */}
      {onToggleSidebar && (
        <div className="absolute top-0 left-0 w-full h-16 flex items-center px-6 lg:hidden border-b border-[#BABABA]/10 bg-[#161316]/50 backdrop-blur-md z-30">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white cursor-pointer active:scale-95"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      )}

      {/* Subtle Animated Aurora Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[600px] rounded-full bg-teal-500/8 blur-[120px] animate-aurora-teal" />
        <div className="absolute -bottom-[20%] right-[10%] h-[550px] w-[550px] rounded-full bg-amber-500/5 blur-[130px] animate-aurora-amber" />
        <div className="absolute top-[30%] -right-[15%] h-[400px] w-[450px] rounded-full bg-emerald-500/5 blur-[100px] animate-aurora-emerald" />
        <div className="absolute bottom-[20%] -left-[10%] h-[350px] w-[500px] rounded-full bg-indigo-500/3 blur-[110px] animate-aurora-indigo" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center space-y-24">
        
        {/* SECTION 1 — HERO */}
        <section className="w-full flex flex-col items-center text-center space-y-8 py-8 animate-chat-bubble select-none">
          {/* Glowing Glass Logo */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-600/20 to-emerald-500/20 border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.15)] animate-pulse">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-teal-650 to-emerald-500 opacity-0 hover:opacity-10 transition-opacity duration-300 blur-sm pointer-events-none"></div>
            <SparklesIcon size={38} className="text-teal-400 animate-pulse" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider font-serif text-white bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              AetherNote<span className="text-teal-400 font-bold">.ai</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-md mx-auto leading-relaxed font-sans font-medium">
              A reflective AI space for thoughts, clarity, and conversation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartWriting}
              className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group btn-premium-sweep"
            >
              <span>Start Writing</span>
            </button>

            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer btn-premium-sweep"
            >
              <span>Explore Features</span>
              <ArrowDownIcon size={14} className="animate-bounce" />
            </button>
          </div>
        </section>

        {/* SECTION 2 — CORE FEATURES */}
        <section ref={featuresRef} className="w-full space-y-12 animate-chat-bubble scroll-mt-10">
          <div className="text-center space-y-2 select-none">
            <h2 className="text-xs font-bold tracking-widest text-teal-400 font-mono uppercase">Core Architecture</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-wide font-serif text-white tracking-tight">An intelligent journaling & thought companion</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Smart Notes */}
            <div className="group rounded-2xl p-6 border border-white/[0.03] bg-white/[0.01] hover:bg-[#453027]/50 hover:border-teal-500/20 transition-all duration-500 space-y-4 shadow-lg shadow-black/10 glass-panel-light hover:shadow-[0_8px_30px_rgba(20,184,166,0.05)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <FileTextIcon size={18} />
              </div>
              <h4 className="text-sm font-bold font-serif text-white group-hover:text-teal-300 transition-colors tracking-wide">Smart Notes</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create elegant local notes with distraction-free typography and real-time auto-saving. Perfect for capture, drafts, and reflection.
              </p>
            </div>

            {/* Feature 2: Refine Draft */}
            <div className="group rounded-2xl p-6 border border-white/[0.03] bg-white/[0.01] hover:bg-[#453027]/50 hover:border-teal-500/20 transition-all duration-500 space-y-4 shadow-lg shadow-black/10 glass-panel-light hover:shadow-[0_8px_30px_rgba(20,184,166,0.05)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <SparklesIcon size={18} />
              </div>
              <h4 className="text-sm font-bold font-serif text-white group-hover:text-teal-300 transition-colors tracking-wide">Refine Draft</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tidy up sentence structures, simplify complex phrasing, and enhance readability instantly without losing your original writing style.
              </p>
            </div>

            {/* Feature 3: Summarize */}
            <div className="group rounded-2xl p-6 border border-white/[0.03] bg-white/[0.01] hover:bg-[#453027]/50 hover:border-teal-500/20 transition-all duration-500 space-y-4 shadow-lg shadow-black/10 glass-panel-light hover:shadow-[0_8px_30px_rgba(20,184,166,0.05)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <AlignLeftIcon size={18} />
              </div>
              <h4 className="text-sm font-bold font-serif text-white group-hover:text-teal-300 transition-colors tracking-wide">Summarize</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extract key bullet points and synthesize lengthy, unorganized streams of consciousness into clean, concise visual executive summaries.
              </p>
            </div>

            {/* Feature 4: Formal Polish */}
            <div className="group rounded-2xl p-6 border border-white/[0.03] bg-white/[0.01] hover:bg-[#453027]/50 hover:border-teal-500/20 transition-all duration-500 space-y-4 shadow-lg shadow-black/10 glass-panel-light hover:shadow-[0_8px_30px_rgba(20,184,166,0.05)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <EyeIcon size={18} />
              </div>
              <h4 className="text-sm font-bold font-serif text-white group-hover:text-teal-300 transition-colors tracking-wide">Formal Polish</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Correct minor grammar inconsistencies and elevate messy thoughts into professional, highly presentable structures.
              </p>
            </div>

            {/* Feature 5: Autocomplete */}
            <div className="group rounded-2xl p-6 border border-white/[0.03] bg-white/[0.01] hover:bg-[#453027]/50 hover:border-teal-500/20 transition-all duration-500 space-y-4 shadow-lg shadow-black/10 glass-panel-light hover:shadow-[0_8px_30px_rgba(20,184,166,0.05)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <ZapIcon size={18} />
              </div>
              <h4 className="text-sm font-bold font-serif text-white group-hover:text-teal-300 transition-colors tracking-wide">Autocomplete</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Stuck on a sentence? The AI evaluates the active context of your draft and appends relevant continuation lines seamlessly.
              </p>
            </div>

            {/* Feature 6: Talk Mode - MOST IMPORTANT */}
            <div className="group col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl p-6 border border-amber-500/20 bg-amber-500/[0.01] hover:bg-[#453027]/40 hover:border-amber-500/40 transition-all duration-500 space-y-5 shadow-lg shadow-amber-950/5 glass-panel-light relative overflow-hidden hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)]">
              <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-amber-500/[0.03] blur-2xl group-hover:bg-amber-500/[0.06] transition-colors pointer-events-none"></div>
              
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                  <MessageSquareIcon size={18} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md select-none">
                  Core Signature Feature
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors tracking-wide">Talk Mode</h4>
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  <strong>The note itself becomes conversational.</strong> Toggling the <span className="text-amber-400 font-semibold font-sans">"Talk"</span> action button in the toolbar seamlessly transforms your note editor canvas into a WhatsApp/iMessage-like dialogue sanctuary. 
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-white/[0.02] bg-white/[0.005] p-3 text-zinc-400 text-xs leading-relaxed">
                  <strong className="text-zinc-200 block mb-0.5 font-bold font-serif">Thoughtful Friend</strong>
                  The AI guide acts as an emotionally intelligent companion rather than a cold assistant.
                </div>
                <div className="rounded-xl border border-white/[0.02] bg-white/[0.005] p-3 text-zinc-400 text-xs leading-relaxed">
                  <strong className="text-zinc-200 block mb-0.5 font-bold font-serif">Self-Reflection</strong>
                  Type naturally to process emotions, organize random ideas, or conduct organic brainstorms.
                </div>
                <div className="rounded-xl border border-white/[0.02] bg-white/[0.005] p-3 text-zinc-400 text-xs leading-relaxed">
                  <strong className="text-zinc-200 block mb-0.5 font-bold font-serif">Session Archive</strong>
                  Click "Save Chat as Note" to compile full conversations into beautifully formatted markdown logs.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3 — HOW IT WORKS */}
        <section className="w-full space-y-12 animate-chat-bubble select-none">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold tracking-widest text-teal-400 font-mono uppercase">Seamless Flow</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How your sanctuary functions</h3>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 max-w-3xl mx-auto pt-4 relative">
            {/* Visual connector line for desktop */}
            <div className="hidden md:block absolute left-[8%] right-[8%] top-[25px] h-0.5 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-amber-500/20 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 md:w-1/4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-950/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-950/10">
                <span className="font-mono font-bold text-sm">01</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">You Write</h4>
              <p className="text-[11px] text-zinc-500 max-w-[150px] leading-relaxed">
                Draft outlines or journal thoughts distraction-free.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 md:w-1/4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-950/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-950/10">
                <span className="font-mono font-bold text-sm">02</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Understands</h4>
              <p className="text-[11px] text-zinc-500 max-w-[150px] leading-relaxed">
                Companion reads your active note text to gain context.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 md:w-1/4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/10 animate-pulse">
                <span className="font-mono font-bold text-sm">03</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Reflects</h4>
              <p className="text-[11px] text-zinc-500 max-w-[150px] leading-relaxed">
                Refine draft style or text conversationally like a friend.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 md:w-1/4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-950/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-950/10">
                <span className="font-mono font-bold text-sm">04</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Auto-Saves</h4>
              <p className="text-[11px] text-zinc-500 max-w-[150px] leading-relaxed">
                All notes and chat history persist locally inside your browser.
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 4 — EXPERIENCE PHILOSOPHY */}
        <section className="w-full max-w-2xl mx-auto text-center space-y-6 py-6 animate-chat-bubble select-none">
          <h2 className="text-xs font-bold tracking-widest text-teal-400 font-mono uppercase">Sanctuary Philosophy</h2>
          <blockquote className="text-base md:text-lg leading-relaxed text-zinc-300 font-medium italic">
            "AetherNote.ai is not just a notes app. It is a reflective thinking space designed to help you slow down, process thoughts, and interact naturally with AI."
          </blockquote>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            By avoiding corporate layouts, flat borders, and distracting widgets, AetherNote offers a quiet harbor to clear your head, refine messy plans, and engage in reflective, private self-conversations.
          </p>
        </section>

        {/* SECTION 5 — FINAL CTA */}
        <section className="w-full flex flex-col items-center text-center space-y-6 pt-4 animate-chat-bubble select-none">
          <div className="h-0.5 w-24 bg-gradient-to-r from-teal-500/20 to-amber-500/20"></div>
          <h3 className="text-xl md:text-2xl font-bold tracking-wide font-serif text-white tracking-tight">Ready to clear your mind?</h3>
          <button
            onClick={onStartWriting}
            className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-teal-500/10 hover:shadow-teal-500/25 border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group btn-premium-sweep"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"></div>
            <span className="relative z-10">Begin Your First Reflection</span>
          </button>
        </section>

      </div>
    </main>
  );
};

export default Onboarding;
