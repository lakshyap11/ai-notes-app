import React, { useState, useRef, useEffect } from "react";
import { MenuIcon, SparklesIcon, AlignLeftIcon, ZapIcon, EyeIcon, MessageSquareIcon, SendIcon, PaperclipIcon, CheckIcon } from "./Icons";
import { AttachmentCard, AttachmentStripCard, FullscreenImageModal } from "./AttachmentSystem";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  type?: "note" | "conversation";
  messages?: any[];
  createdAt?: string;
  talkModeEnabled?: boolean;
  attachments?: any[];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);

  // Load attachments asynchronously from IndexedDB
  useEffect(() => {
    if (!activeNote || !activeNote.attachments || activeNote.attachments.length === 0) {
      return;
    }

    const loadAttachments = async () => {
      try {
        const { getAttachmentData } = await import("@/utils/attachmentDb");
        const newUrls: Record<string, string> = { ...attachmentUrls };
        let updated = false;

        const attachments = activeNote.attachments || [];
        for (const att of attachments) {
          if (!newUrls[att.id]) {
            const cachedData = await getAttachmentData(att.id);
            if (cachedData) {
              newUrls[att.id] = cachedData;
              updated = true;
            }
          }
        }

        if (updated) {
          setAttachmentUrls(newUrls);
        }
      } catch (e) {
        console.warn("Failed to load attachments from IndexedDB", e);
      }
    };

    loadAttachments();
  }, [activeNote?.id, activeNote?.attachments]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeNote) return;
    const file = files[0];

    // Format size
    const sizeKb = file.size / 1024;
    const sizeStr = sizeKb > 1024 
      ? `${(sizeKb / 1024).toFixed(1)} MB` 
      : `${sizeKb.toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      const attachmentId = `attach_${Date.now()}`;
      
      let fileType: "image" | "audio" | "pdf" | "document" | "generic" = "generic";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("audio/")) fileType = "audio";
      else if (file.type === "application/pdf") fileType = "pdf";
      else if (
        file.type.startsWith("text/") || 
        file.type.includes("word") || 
        file.type.includes("excel") || 
        file.type.includes("powerpoint")
      ) {
        fileType = "document";
      }

      const newAttachment = {
        id: attachmentId,
        type: fileType,
        name: file.name,
        size: sizeStr,
        createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      };

      // 1. Store in IndexedDB
      try {
        const { storeAttachment } = await import("@/utils/attachmentDb");
        await storeAttachment(attachmentId, base64Url);
      } catch (err) {
        console.error("IndexedDB store failed", err);
      }

      // 2. Cache in component state
      setAttachmentUrls((prev) => ({ ...prev, [attachmentId]: base64Url }));

      // 3. Update note attachments metadata
      const updatedAttachments = [...(activeNote.attachments || []), newAttachment];
      onUpdateNote({ attachments: updatedAttachments });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!activeNote || !activeNote.attachments) return;

    try {
      const { deleteAttachmentData } = await import("@/utils/attachmentDb");
      await deleteAttachmentData(attachmentId);
    } catch (err) {
      console.error("IndexedDB delete failed", err);
    }

    setAttachmentUrls((prev) => {
      const copy = { ...prev };
      delete copy[attachmentId];
      return copy;
    });

    const updatedAttachments = activeNote.attachments.filter((att: any) => att.id !== attachmentId);
    onUpdateNote({ attachments: updatedAttachments });
  };

  useEffect(() => {
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
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#453027]/40 backdrop-blur-2xl border-l border-white/[0.02] shadow-[-8px_0_32px_rgba(0,0,0,0.3)] text-center overflow-hidden relative">
        {/* Subtle Animated Aurora-Style Background Glow */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] h-[350px] w-[500px] rounded-full bg-teal-500/8 blur-[100px] animate-aurora-teal" />
          <div className="absolute -bottom-[20%] right-[10%] h-[400px] w-[450px] rounded-full bg-amber-500/5 blur-[110px] animate-aurora-amber" />
        </div>
        {/* Mobile Header Toggle */}
        <div className="absolute top-0 left-0 w-full h-16 flex items-center px-6 lg:hidden border-b border-white/[0.04] bg-[#161316]/50 backdrop-blur-md">
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
          <h2 className="text-xl font-bold tracking-wide font-serif text-zinc-200">No active note selected</h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            Select an existing note from the sidebar or click the "New Note" button to start crafting your next masterpiece.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#453027]/40 backdrop-blur-2xl border-l border-white/[0.02] shadow-[-8px_0_32px_rgba(0,0,0,0.3)] overflow-hidden relative">
      {/* Subtle Animated Aurora-Style Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[350px] w-[500px] rounded-full bg-teal-500/10 blur-[100px] animate-aurora-teal" />
        <div className="absolute -bottom-[20%] right-[10%] h-[400px] w-[450px] rounded-full bg-amber-500/6 blur-[110px] animate-aurora-amber" />
        <div className="absolute top-[30%] -right-[10%] h-[350px] w-[400px] rounded-full bg-emerald-500/6 blur-[90px] animate-aurora-emerald" />
        <div className="absolute bottom-[20%] -left-[10%] h-[300px] w-[450px] rounded-full bg-indigo-500/4 blur-[100px] animate-aurora-indigo" />
      </div>

      {/* Editor Header Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.03] bg-white/[0.01] relative z-20">
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
      <section className="px-6 py-3 border-b border-white/[0.03] bg-white/[0.005] z-10 flex flex-col md:flex-row md:items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <SparklesIcon size={14} className="text-teal-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">
            AI Assistant Actions:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {activeNote.type !== "conversation" && (
            <>
              <button
                onClick={() => onAIAction("refine")}
                disabled={!!isProcessing}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
                  isProcessing === "refine"
                    ? "bg-teal-950/30 border border-teal-500/40 text-teal-300 shimmer-effect relative overflow-hidden"
                    : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300"
                }`}
              >
                <SparklesIcon size={11} className={isProcessing === "refine" ? "animate-spin" : ""} />
                <span>{isProcessing === "refine" ? "Refining..." : "Refine Draft"}</span>
              </button>

              <button
                onClick={() => onAIAction("grammar_fix")}
                disabled={!!isProcessing}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
                  isProcessing === "grammar_fix"
                    ? "bg-teal-950/30 border border-teal-500/40 text-teal-300 shimmer-effect relative overflow-hidden"
                    : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300"
                }`}
              >
                <CheckIcon size={11} className={isProcessing === "grammar_fix" ? "animate-pulse" : ""} />
                <span>{isProcessing === "grammar_fix" ? "Fixing..." : "Fix Grammar"}</span>
              </button>

              <button
                onClick={() => onAIAction("summarize")}
                disabled={!!isProcessing}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
                  isProcessing === "summarize"
                    ? "bg-teal-950/30 border border-teal-500/40 text-teal-300 shimmer-effect relative overflow-hidden"
                    : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300"
                }`}
              >
                <AlignLeftIcon size={11} className={isProcessing === "summarize" ? "animate-pulse" : ""} />
                <span>{isProcessing === "summarize" ? "Summarizing..." : "Summarize"}</span>
              </button>

              <button
                onClick={() => onAIAction("professional")}
                disabled={!!isProcessing}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
                  isProcessing === "professional"
                    ? "bg-teal-950/30 border border-teal-500/40 text-teal-300 shimmer-effect relative overflow-hidden"
                    : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300"
                }`}
              >
                <EyeIcon size={11} className={isProcessing === "professional" ? "animate-bounce" : ""} />
                <span>{isProcessing === "professional" ? "Polishing..." : "Formal Polish"}</span>
              </button>

              <button
                onClick={() => onAIAction("autocomplete")}
                disabled={!!isProcessing}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
                  isProcessing === "autocomplete"
                    ? "bg-teal-950/30 border border-teal-500/40 text-teal-300 shimmer-effect relative overflow-hidden"
                    : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300"
                }`}
              >
                <ZapIcon size={11} className={isProcessing === "autocomplete" ? "animate-ping" : ""} />
                <span>{isProcessing === "autocomplete" ? "Completing..." : "Autocomplete"}</span>
              </button>
            </>
          )}

          <button
            onClick={onToggleTalkMode}
            disabled={!!isProcessing}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 shadow-md ${
              activeNote.type === "conversation" && activeNote.talkModeEnabled !== false
                ? "bg-amber-950/35 border border-amber-500/45 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                : activeNote.type === "conversation" && activeNote.talkModeEnabled === false
                ? "bg-stone-900/30 border border-stone-700/40 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300"
                : "bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300"
            }`}
            title={activeNote.type === "conversation" ? "Toggle conversational AI replies" : "Convert note to reflection conversation"}
          >
            <MessageSquareIcon size={11} className={activeNote.type === "conversation" && activeNote.talkModeEnabled !== false ? "text-amber-400 animate-pulse" : ""} />
            <span>
              {activeNote.type === "conversation"
                ? activeNote.talkModeEnabled !== false
                  ? "Talk Mode On"
                  : "Talk Mode Off"
                : "Talk"}
            </span>
          </button>

          {/* Hidden File Picker Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,audio/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />

          {/* Attachments Trigger Button */}
          <button
            onClick={triggerFileUpload}
            disabled={!!isProcessing}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all duration-300 btn-premium-sweep hover:scale-[1.03] active:scale-[0.97] cursor-pointer disabled:opacity-50 bg-white/[0.02] border border-white/[0.04] text-zinc-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300 shadow-md"
            title="Attach voice note, image, PDF or document"
          >
            <PaperclipIcon size={11} className="text-teal-400" />
            <span>Attach</span>
          </button>
        </div>
      </section>

      {/* Editor Main Content Area */}
      <div className={`flex-1 flex flex-col relative z-10 max-w-4xl w-full mx-auto overflow-hidden ${
        activeNote.type === "conversation" 
          ? "px-6 pb-4 pt-4" 
          : "p-6 md:p-8 lg:p-12 overflow-y-auto space-y-6"
      }`}>
        {activeNote.type === "conversation" ? (
          /* CONVERSATIONAL ARCHIVE VIEW */
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Conversational Editable Title */}
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => onUpdateNote({ title: e.target.value })}
              placeholder="Untitled Conversation"
              className="w-full bg-transparent text-xl md:text-2xl font-bold tracking-wide font-serif text-white placeholder-zinc-600 outline-none border-b border-transparent focus:border-white/[0.02] pb-2 transition-all duration-200 shrink-0 select-text"
            />

            {/* Elegant Minimalist Header Bar */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] shrink-0 mb-1">
              <div className="flex items-center gap-2 select-none">
                {activeNote.talkModeEnabled !== false ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                )}
                <span className="text-[11px] font-semibold tracking-wide text-zinc-400 font-sans">
                  {activeNote.talkModeEnabled !== false ? "journaling with friend (AI active)" : "silent reflection journal (AI paused)"}
                </span>
              </div>
              
              <button
                onClick={onSaveChatAsNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[10.5px] font-semibold text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/40 cursor-pointer active:scale-95 transition-all select-none shadow-[0_0_8px_rgba(245,158,11,0.05)]"
                title="Save this conversation as a note"
              >
                <span>Save Chat as Note</span>
              </button>
            </div>

            {/* Conversation Attached Memories Strip */}
            {activeNote.attachments && activeNote.attachments.length > 0 && (
              <div className="flex flex-col gap-1.5 py-2 border-b border-white/[0.03] shrink-0 select-none">
                <span className="text-[9px] font-bold tracking-wider text-zinc-500 font-mono uppercase px-1">Attached Memories:</span>
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
                  {activeNote.attachments.map((att: any) => (
                    <AttachmentStripCard
                      key={att.id}
                      attachment={att}
                      dataUrl={attachmentUrls[att.id]}
                      onDelete={() => handleDeleteAttachment(att.id)}
                      onExpandImage={(url, name) => setExpandedImage({ url, name })}
                    />
                  ))}
                </div>
              </div>
            )}

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
                            ? "bg-[#453027]/60 border-[#BABABA]/15 text-zinc-100 rounded-tr-none shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:border-white/[0.08] hover:bg-[#453027]/75 glass-panel-light"
                            : "bg-[#FF6D29]/10 border-[#FF6D29]/25 text-zinc-200 rounded-tl-none shadow-[0_0_20px_rgba(255,109,41,0.06)] hover:border-[#FF6D29]/40 hover:bg-[#FF6D29]/15 glass-panel-light"
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
                  <div className="rounded-2xl rounded-tl-none px-5 py-3.5 bg-[#FF6D29]/10 border border-[#FF6D29]/25 text-zinc-300 flex items-center gap-1.5 glass-panel-light shadow-[0_0_20px_rgba(255,109,41,0.06)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80 animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
              <div className="relative flex items-center w-full max-w-2xl mx-auto gap-2">
                {/* Paperclip Button for Conversations */}
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-all shadow-md group"
                  title="Attach voice note, image, PDF or document"
                >
                  <PaperclipIcon size={16} className="text-zinc-400 group-hover:text-teal-400 transition-colors" />
                </button>
                <div className="relative flex-1 flex items-center caret-amber">
                  <input
                    name="chatInput"
                    type="text"
                    placeholder="Reflect with a thoughtful friend..."
                    disabled={isAITyping}
                    autoComplete="off"
                    className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] py-3.5 pl-5 pr-14 text-xs md:text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-amber-500/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isAITyping}
                    className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-amber-500/20"
                    title="Send Message"
                  >
                    <SendIcon size={14} />
                  </button>
                </div>
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
              className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-wide font-serif text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-white/[0.03] pb-4 transition-all duration-200 shrink-0 select-text"
            />

            {/* Standard Note Memory Blocks Grid */}
            {activeNote.attachments && activeNote.attachments.length > 0 && (
              <div className="space-y-3 pb-4 select-none shrink-0 border-b border-white/[0.02] animate-chat-bubble">
                <span className="text-[10px] font-bold tracking-wider text-zinc-500 font-mono uppercase">Memory Blocks:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeNote.attachments.map((att: any) => (
                    <AttachmentCard
                      key={att.id}
                      attachment={att}
                      dataUrl={attachmentUrls[att.id]}
                      onDelete={() => handleDeleteAttachment(att.id)}
                      onExpandImage={(url, name) => setExpandedImage({ url, name })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Editor Body Text with Soft Illuminated Glow */}
            <div className="relative flex-1 w-full">
              <div className="editor-spotlight" />
              <textarea
                value={activeNote.content}
                onChange={(e) => onUpdateNote({ content: e.target.value })}
                placeholder="Start writing or typing '/' for commands..."
              className="note-editor relative z-10 w-full h-full bg-transparent text-[18px] leading-[2] tracking-[-0.03em] font-normal text-zinc-100 placeholder-zinc-600 outline-none resize-none focus:placeholder-zinc-500 min-h-[300px] max-w-3xl mx-auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer className="flex h-10 shrink-0 items-center justify-between px-6 border-t border-white/[0.04] bg-[#161316]/30 text-[10px] text-zinc-500 font-mono z-10">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="hidden sm:block">
          <span>Modified: {activeNote.updatedAt}</span>
        </div>
      </footer>

      {/* Fullscreen Lightroom Modal overlay */}
      {expandedImage && (
        <FullscreenImageModal
          url={expandedImage.url}
          name={expandedImage.name}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </main>
  );
};

export default Editor;
