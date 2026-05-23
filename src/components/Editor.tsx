import React from "react";
import { MenuIcon, SparklesIcon, AlignLeftIcon, ZapIcon, EyeIcon } from "./Icons";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface EditorProps {
  activeNote: Note | undefined;
  onUpdateNote: (updatedFields: Partial<Note>) => void;
  onAIAction: (action: string) => void;
  isProcessing: string | null;
  onToggleSidebar: () => void;
}

const Editor: React.FC<EditorProps> = ({
  activeNote,
  onUpdateNote,
  onAIAction,
  isProcessing,
  onToggleSidebar,
}) => {
  // Compute word and character counts
  const charCount = activeNote?.content.length || 0;
  const wordCount = activeNote?.content.trim() === "" 
    ? 0 
    : activeNote?.content.trim().split(/\s+/).length || 0;

  if (!activeNote) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#07070a]/40 text-center">
        {/* Mobile Header Toggle */}
        <div className="absolute top-0 left-0 w-full h-16 flex items-center px-6 lg:hidden border-b border-white/[0.04] bg-[#09090b]/50 backdrop-blur-md">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
          >
            <MenuIcon size={18} />
          </button>
        </div>

        <div className="max-w-md p-8 rounded-3xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-500/20 text-violet-400 border border-violet-500/10">
            <SparklesIcon size={26} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-medium text-zinc-200">No active note selected</h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            Select an existing note from the sidebar or click the "New Note" button to start crafting your next masterpiece.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#07070a]/40 overflow-hidden relative">
      {/* Editor Header Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.04] bg-[#09090b]/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white lg:hidden cursor-pointer active:scale-95"
            title="Toggle Sidebar"
          >
            <MenuIcon size={18} />
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="font-mono text-zinc-600">EDITOR</span>
            <span>/</span>
            <span className="truncate max-w-[200px] text-zinc-400">{activeNote.title || "Untitled"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>AUTO-SAVED</span>
          </div>
        </div>
      </header>

      {/* AI actions Power Strip */}
      <section className="px-6 py-3 border-b border-white/[0.04] bg-white/[0.01] backdrop-blur-sm z-10 flex flex-col md:flex-row md:items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <SparklesIcon size={14} className="text-violet-400" />
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">
            AI Assistant Actions:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => onAIAction("refine")}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              isProcessing === "refine"
                ? "bg-violet-600/25 border border-violet-500/40 text-violet-300 shimmer-effect relative overflow-hidden"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 cursor-pointer disabled:opacity-50"
            }`}
          >
            <SparklesIcon size={11} className={isProcessing === "refine" ? "animate-spin" : ""} />
            <span>{isProcessing === "refine" ? "Refining Text..." : "Refine Draft"}</span>
          </button>

          <button
            onClick={() => onAIAction("summarize")}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              isProcessing === "summarize"
                ? "bg-violet-600/25 border border-violet-500/40 text-violet-300 shimmer-effect relative overflow-hidden"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 cursor-pointer disabled:opacity-50"
            }`}
          >
            <AlignLeftIcon size={11} className={isProcessing === "summarize" ? "animate-pulse" : ""} />
            <span>{isProcessing === "summarize" ? "Summarizing..." : "Summarize"}</span>
          </button>

          <button
            onClick={() => onAIAction("professional")}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              isProcessing === "professional"
                ? "bg-violet-600/25 border border-violet-500/40 text-violet-300 shimmer-effect relative overflow-hidden"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 cursor-pointer disabled:opacity-50"
            }`}
          >
            <EyeIcon size={11} className={isProcessing === "professional" ? "animate-bounce" : ""} />
            <span>{isProcessing === "professional" ? "Make Professional" : "Formal Polish"}</span>
          </button>

          <button
            onClick={() => onAIAction("autocomplete")}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              isProcessing === "autocomplete"
                ? "bg-violet-600/25 border border-violet-500/40 text-violet-300 shimmer-effect relative overflow-hidden"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 cursor-pointer disabled:opacity-50"
            }`}
          >
            <ZapIcon size={11} className={isProcessing === "autocomplete" ? "animate-ping" : ""} />
            <span>{isProcessing === "autocomplete" ? "Completing..." : "Autocomplete"}</span>
          </button>
        </div>
      </section>

      {/* Editor Main Content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-12 overflow-y-auto z-0 max-w-4xl w-full mx-auto space-y-6">
        {/* Title Input */}
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-tight text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-white/[0.03] pb-4 transition-all duration-200"
        />

        {/* Editor Body Text */}
        <textarea
          value={activeNote.content}
          onChange={(e) => onUpdateNote({ content: e.target.value })}
          placeholder="Start writing or typing '/' for commands..."
          className="flex-1 w-full bg-transparent text-sm md:text-base leading-relaxed text-zinc-300 placeholder-zinc-600 outline-none resize-none focus:placeholder-zinc-500 font-sans min-h-[300px]"
        />
      </div>

      {/* Status Bar */}
      <footer className="flex h-10 shrink-0 items-center justify-between px-6 border-t border-white/[0.04] bg-[#09090b]/30 text-[10px] text-zinc-500 font-mono z-10">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="hidden sm:block">
          <span>Modified: {activeNote.updatedAt}</span>
        </div>
      </footer>
    </main>
  );
};

export default Editor;
