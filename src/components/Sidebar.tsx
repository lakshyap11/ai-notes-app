import React, { useState } from "react";
import { PlusIcon, TrashIcon, SearchIcon, FileTextIcon, XIcon, MessageSquareIcon, SparklesIcon } from "./Icons";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  type?: "note" | "conversation";
  messages?: any[];
}

interface SidebarProps {
  notes: Note[];
  activeNoteId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onCreateConversation: () => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isOnboarding: boolean;
  onToggleOnboarding: (show: boolean) => void;
  memories?: any[];
  onDeleteMemory?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  searchQuery,
  setSearchQuery,
  onSelectNote,
  onCreateNote,
  onCreateConversation,
  onDeleteNote,
  isOpen,
  setIsOpen,
  isOnboarding,
  onToggleOnboarding,
  memories = [],
  onDeleteMemory,
}) => {
  const [isMemoryExpanded, setIsMemoryExpanded] = useState<boolean>(false);
  // Filter notes based on the search query
  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-[#BABABA]/15 bg-[#161316]/90 backdrop-blur-3xl shadow-[4px_0_32px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* App Title & Close Trigger */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 shadow-md shadow-teal-500/20">
              <span className="text-sm font-bold text-white tracking-wide">A</span>
            </div>
            <h1 className="text-lg font-bold tracking-wider font-serif text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              AetherNote<span className="text-teal-400 font-bold">.ai</span>
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] hover:bg-white/[0.04] transition-colors lg:hidden text-zinc-400 hover:text-white"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Sidebar Actions & Search Bar */}
        <div className="flex flex-col gap-4 p-5 border-b border-white/[0.03]">
          {/* Create Buttons (New Note & New Chat) */}
          <div className="flex gap-2 shrink-0">
            {/* Create Note Button */}
            <button
              onClick={onCreateNote}
              className="relative flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600/90 to-emerald-600/90 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-600/10 cursor-pointer border border-teal-400/20 hover:border-teal-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden"
              title="Create a standard markdown note"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              <PlusIcon size={12} className="relative z-10" />
              <span className="relative z-10">New Note</span>
            </button>

            {/* Create Conversation Button */}
            <button
              onClick={onCreateConversation}
              className="relative flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-orange-600/90 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-600/10 cursor-pointer border border-amber-400/20 hover:border-amber-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden"
              title="Create a persistent AI reflection conversation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              <MessageSquareIcon size={12} className="relative z-10" />
              <span className="relative z-10">New Chat</span>
            </button>
          </div>

          {/* Minimal Search Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
              <SearchIcon size={15} />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-teal-500/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-teal-500/30"
            />
          </div>
        </div>

        {/* Notes list container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Welcome Guide Trigger */}
          <div
            onClick={() => {
              onToggleOnboarding(true);
              setIsOpen(false);
            }}
            className={`group relative flex items-center gap-2.5 rounded-xl p-3 cursor-pointer border transition-all duration-300 select-none mb-2 ${
              isOnboarding
                ? "bg-teal-950/20 border-teal-500/20 text-white"
                : "border-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200 hover:border-white/[0.03]"
            }`}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all duration-350 ${
              isOnboarding
                ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                : "bg-white/[0.02] border-white/[0.06] text-zinc-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 group-hover:border-teal-500/25"
            }`}>
              <SparklesIcon size={12} className={isOnboarding ? "animate-pulse" : ""} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-semibold truncate ${isOnboarding ? "text-teal-300" : "text-zinc-300 group-hover:text-white"}`}>
                Welcome Guide
              </h3>
            </div>
            {isOnboarding && (
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            )}
          </div>
          
          {/* Collapsible Memory Sanctuary Drawer */}
          <div className="group/memory relative rounded-xl border border-white/[0.03] bg-white/[0.01] overflow-hidden transition-all duration-300 mb-3 select-none">
            {/* Header Trigger */}
            <div 
              onClick={() => setIsMemoryExpanded(!isMemoryExpanded)}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all duration-350 bg-amber-500/10 border-amber-500/25 text-amber-400`}>
                  <SparklesIcon size={12} className={isMemoryExpanded ? "animate-spin" : "animate-pulse"} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-zinc-350 group-hover/memory:text-white flex items-center gap-1.5">
                    Memory Sanctuary
                    {memories && memories.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono scale-90">
                        {memories.length}
                      </span>
                    )}
                  </h3>
                </div>
              </div>
              <span className="text-zinc-500 text-[10px] group-hover/memory:text-zinc-300 font-sans tracking-wide">
                {isMemoryExpanded ? "Hide" : "Show"}
              </span>
            </div>

            {/* Expanded List Panel */}
            {isMemoryExpanded && (
              <div className="px-3.5 pb-3.5 space-y-2 border-t border-white/[0.02] bg-[#453027]/10 max-h-[220px] overflow-y-auto scrollbar-none">
                {(!memories || memories.length === 0) ? (
                  <p className="text-[10px] text-zinc-500 italic text-center py-4 px-2">
                    Your reflections and emotional goals will form memories here over time.
                  </p>
                ) : (
                  <div className="space-y-1.5 pt-2">
                    {memories.map((mem) => {
                      const colors: Record<string, string> = {
                        stressor: "bg-red-950/20 border-red-500/30 text-red-300",
                        goal: "bg-orange-950/20 border-orange-500/30 text-orange-300",
                        habit: "bg-teal-950/20 border-teal-500/30 text-teal-300",
                        emotion: "bg-violet-950/20 border-violet-500/30 text-violet-300",
                        reflection: "bg-amber-950/20 border-amber-500/30 text-amber-300",
                        relationship: "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      };
                      
                      const badgeClass = colors[mem.type] || "bg-stone-900/20 border-stone-700/30 text-stone-300";
                      
                      return (
                        <div 
                          key={mem.id}
                          className="group/memitem flex items-center justify-between gap-2.5 rounded-lg border border-white/[0.02] bg-white/[0.005] p-2 hover:border-white/[0.05] hover:bg-white/[0.015] transition-all"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 py-0.5 rounded border ${badgeClass} select-none`}>
                                {mem.type}
                              </span>
                              {mem.importance >= 8 && (
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" title="High significance memory" />
                              )}
                            </div>
                            <p className="text-[10px] leading-relaxed text-zinc-350 group-hover/memitem:text-zinc-200">
                              {mem.summary}
                            </p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMemory && onDeleteMemory(mem.id);
                            }}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#453027]/40 border border-transparent hover:border-red-500/25 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 opacity-0 group-hover/memitem:opacity-100 transition-all active:scale-95 cursor-pointer"
                            title="Let the AI forget this"
                          >
                            <TrashIcon size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="h-px bg-white/[0.03] mx-2 my-2" />

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.04] bg-white/[0.01] text-zinc-600 mb-3">
                <FileTextIcon size={20} />
              </div>
              <p className="text-xs font-medium text-zinc-400">No notes found</p>
              <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
                Create a new note or adjust your search filter.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = !isOnboarding && note.id === activeNoteId;
              const isConv = note.type === "conversation";
              const plainSnippet = note.content
                .replace(/[#*`_-]/g, "") // remove simple markdown chars
                .trim()
                .substring(0, 60);

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group relative flex flex-col items-start gap-1 rounded-xl p-3.5 cursor-pointer border transition-all duration-500 ease-out select-none hover:translate-y-[-1px] ${
                    isActive
                      ? isConv
                        ? "bg-amber-950/25 border-amber-500/30 text-white shadow-[inset_0_1px_12px_rgba(245,158,11,0.08),0_4px_16px_rgba(0,0,0,0.35)]"
                        : "bg-teal-950/25 border-teal-500/30 text-white shadow-[inset_0_1px_12px_rgba(20,184,166,0.08),0_4px_16px_rgba(0,0,0,0.35)]"
                      : "border-transparent text-zinc-400 hover:bg-white/[0.03] hover:border-white/[0.06] hover:text-zinc-250 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isConv ? (
                        <MessageSquareIcon size={12} className={isActive ? "text-amber-400 shrink-0 animate-pulse" : "text-zinc-500 shrink-0 group-hover:text-amber-400 transition-colors"} />
                      ) : (
                        <FileTextIcon size={12} className={isActive ? "text-teal-400 shrink-0" : "text-zinc-500 shrink-0 group-hover:text-teal-400 transition-colors"} />
                      )}
                      <h3
                        className={`text-xs font-semibold truncate ${
                          isActive ? "text-white" : "text-zinc-350 group-hover:text-zinc-200"
                        }`}
                      >
                        {note.title.trim() === "" ? "Untitled Note" : note.title}
                      </h3>
                    </div>
                    
                    {/* Delete Action (Shows on hover on desktop, always visible subtly) */}
                    <button
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                      }`}
                      title={isConv ? "Delete Chat" : "Delete Note"}
                      aria-label="Delete note"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
 
                  <p className="text-[11px] leading-relaxed text-zinc-500 truncate w-full pr-4">
                    {isConv 
                      ? note.messages && note.messages.length > 0 
                        ? note.messages[note.messages.length - 1].text.replace(/[#*`_-]/g, "").trim().substring(0, 60)
                        : "No reflection messages yet"
                      : plainSnippet || "No content yet"}
                  </p>
 
                  <div className="flex w-full items-center justify-between text-[9px] text-zinc-600 mt-2 font-mono">
                    <span>{note.updatedAt}</span>
                    {isActive && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full animate-pulse`}
                        style={{
                          backgroundColor: isConv ? "#fbbf24" : "#2dd4bf",
                          boxShadow: isConv ? "0 0 10px #fbbf24" : "0 0 10px #2dd4bf",
                        }}
                      ></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-white/[0.03] text-center bg-black/[0.1]">
          <p className="text-[9px] font-mono text-zinc-600">
            AETHERNOTE ENGINE v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
