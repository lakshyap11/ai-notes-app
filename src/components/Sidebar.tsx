import React from "react";
import { PlusIcon, TrashIcon, SearchIcon, FileTextIcon, XIcon } from "./Icons";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface SidebarProps {
  notes: Note[];
  activeNoteId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  searchQuery,
  setSearchQuery,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isOpen,
  setIsOpen,
}) => {
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
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-white/[0.06] bg-[#09090b]/85 backdrop-blur-xl transition-all duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* App Title & Close Trigger */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-violet-500/20">
              <span className="text-sm font-bold text-white tracking-wide">A</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              AetherNote<span className="text-violet-400 font-bold">.ai</span>
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
          {/* Create Note Button */}
          <button
            onClick={onCreateNote}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600/90 to-indigo-600/90 px-4 py-3 text-sm font-medium text-white shadow-md shadow-violet-600/10 cursor-pointer border border-violet-400/20 hover:border-violet-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-600/20 active:scale-[0.98] group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <PlusIcon size={16} className="relative z-10" />
            <span className="relative z-10">New Note</span>
          </button>

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
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
        </div>

        {/* Notes list container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              const isActive = note.id === activeNoteId;
              // Extract a clean 1-line snippet of content
              const plainSnippet = note.content
                .replace(/[#*`_-]/g, "") // remove simple markdown chars
                .trim()
                .substring(0, 60);

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group relative flex flex-col items-start gap-1 rounded-xl p-3.5 cursor-pointer border transition-all duration-300 select-none ${
                    isActive
                      ? "bg-violet-600/10 border-violet-500/20 text-white"
                      : "border-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200 hover:border-white/[0.03]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isActive ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {note.title.trim() === "" ? "Untitled Note" : note.title}
                    </h3>
                    
                    {/* Delete Action (Shows on hover on desktop, always visible subtly) */}
                    <button
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                      }`}
                      title="Delete Note"
                      aria-label="Delete note"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-zinc-500 truncate w-full pr-4">
                    {plainSnippet || "No content yet"}
                  </p>

                  <div className="flex w-full items-center justify-between text-[9px] text-zinc-600 mt-2 font-mono">
                    <span>{note.updatedAt}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"></span>
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
