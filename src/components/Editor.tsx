import React from "react";
import { MenuIcon, SparklesIcon, AlignLeftIcon, ZapIcon, EyeIcon, MessageSquareIcon, SendIcon } from "./Icons";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  type?: "note" | "conversation";
  messages?: any[];
  createdAt?: string;
}

interface EditorProps {
  activeNote: Note | undefined;
  onUpdateNote: (updatedFields: Partial<Note>) => void;
  onAIAction: (action: string) => void;
  isProcessing: string | null;
  onToggleSidebar: () => void;
  onToggleTalkMode: () => void;
  onSendMessage: (text: string) => void;
  isAITyping: boolean;
  onSaveChatAsNote: () => void;
}

const renderBubbleText = (text: string) => {
  if (!text) return null;
  
  // Split by paragraphs
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((para, index) => {
    // Process markdown-like inline bold (**text**), italic (*text*), and lists
    const isList = para.trim().startsWith("- ") || para.trim().startsWith("• ") || /^\d+\.\s/.test(para.trim());
    
    // Simple inline parser for bold/italic/code
    const parseInline = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={idx} className="italic text-zinc-300">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={idx} className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-zinc-300 text-xs">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    if (isList) {
      const lines = para.split("\n");
      return (
        <ul key={index} className="space-y-1.5 my-1.5 pl-4 list-disc marker:text-violet-400">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "");
            return (
              <li key={lIdx} className="text-zinc-200">
                {parseInline(cleanLine)}
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <p key={index} className="mb-2 last:mb-0 leading-relaxed text-zinc-200">
        {parseInline(para)}
      </p>
    );
  });
};

const Editor: React.FC<EditorProps> = ({
  activeNote,
  onUpdateNote,
  onAIAction,
  isProcessing,
  onToggleSidebar,
  onToggleTalkMode,
  onSendMessage,
  isAITyping,
  onSaveChatAsNote,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (activeNote?.type === "conversation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeNote?.messages, isAITyping]);

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

          <button
            onClick={onToggleTalkMode}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 ${
              activeNote.type === "conversation"
                ? "bg-violet-600/25 border border-violet-500/40 text-violet-300"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300"
            }`}
            title="Toggle reflective conversation mode inside note editor"
          >
            <MessageSquareIcon size={11} className={activeNote.type === "conversation" ? "text-violet-400 animate-pulse" : ""} />
            <span>{activeNote.type === "conversation" ? "Talk Mode On" : "Talk"}</span>
          </button>
        </div>
      </section>

      {/* Editor Main Content Area */}
      <div className={`flex-1 flex flex-col z-0 max-w-4xl w-full mx-auto overflow-hidden ${
        activeNote.type === "conversation" 
          ? "px-6 pb-4 pt-2" 
          : "p-6 md:p-8 lg:p-12 overflow-y-auto space-y-6"
      }`}>
        {activeNote.type === "conversation" ? (
          /* CONVERSATIONAL ARCHIVE VIEW */
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Elegant Minimalist Header Bar */}
            <div className="flex items-center justify-between py-3 border-b border-white/[0.04] shrink-0 mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide text-zinc-400 font-sans">journaling with friend</span>
              </div>
              
              <button
                onClick={onSaveChatAsNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/20 bg-violet-600/5 text-[10.5px] font-semibold text-violet-300 hover:bg-violet-600/15 hover:border-violet-500/40 cursor-pointer active:scale-95 transition-all select-none"
                title="Save this conversation as a note"
              >
                <span>Save Chat as Note</span>
              </button>
            </div>

            {/* Conversation Messages Timeline */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 scrollbar-none">
              {activeNote.messages && activeNote.messages.length > 0 ? (
                activeNote.messages.map((msg: any) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full flex-col ${isUser ? "items-end" : "items-start"} animate-chat-bubble`}
                    >
                      {/* elegant modern conversational label */}
                      <span className="text-[10px] font-sans font-medium text-zinc-500 mb-1.5 px-2 tracking-wider uppercase opacity-60 select-none">
                        {isUser ? "You" : "Friend"}
                      </span>
                      
                      {/* elegant modern conversational bubble */}
                      <div
                        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed border transition-all duration-300 ${
                          isUser
                            ? "bg-violet-600/15 border-violet-500/25 text-white rounded-tr-none shadow-lg shadow-violet-950/20 glass-panel-light"
                            : "bg-white/[0.02] border-white/[0.04] text-zinc-300 rounded-tl-none glass-panel-light"
                        }`}
                      >
                        {renderBubbleText(msg.text)}
                      </div>
                      
                      {/* subtle timestamps */}
                      {msg.timestamp && (
                        <span className="text-[9px] text-zinc-600 mt-1.5 px-2 font-sans tracking-tight select-none">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 font-sans text-xs">
                  Ready to reflect. Type a message inside the reflection input below.
                </div>
              )}

              {/* Pulsing AI Typing indicator inside workspace */}
              {isAITyping && (
                <div className="flex w-full flex-col items-start animate-chat-bubble">
                  <span className="text-[10px] font-sans font-medium text-zinc-500 mb-1.5 px-2 tracking-wider uppercase opacity-60 select-none">
                    Friend
                  </span>
                  <div className="rounded-2xl rounded-tl-none px-5 py-3.5 bg-white/[0.02] border border-white/[0.04] text-zinc-300 flex items-center gap-1.5 glass-panel-light">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              {/* Bottom auto scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Anchored Message Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("chatInput") as HTMLInputElement;
                if (!input.value.trim()) return;
                onSendMessage(input.value.trim());
                input.value = "";
              }}
              className="py-3 border-t border-white/[0.04] shrink-0"
            >
              <div className="relative flex items-center w-full max-w-2xl mx-auto">
                <input
                  name="chatInput"
                  type="text"
                  placeholder="Reflect with a thoughtful friend..."
                  disabled={isAITyping}
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] py-3.5 pl-5 pr-14 text-xs md:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 font-sans"
                />
                <button
                  type="submit"
                  disabled={isAITyping}
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-violet-500/10"
                  title="Send Message"
                >
                  <SendIcon size={14} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD NOTES EDITOR VIEW */
          <div className="flex-1 flex flex-col space-y-6">
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
        )}
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
