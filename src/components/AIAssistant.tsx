import React, { useState, useRef, useEffect } from "react";
import { XIcon, SparklesIcon, SendIcon } from "./Icons";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

const PREMADE_SUGGESTIONS = [
  "✨ Summarize my active note",
  "💡 Brainstorm 3 startup ideas",
  "📝 Draft a modern task checklist",
  "🧠 Help me outline a new project",
];

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  setIsOpen,
  messages,
  onSendMessage,
  isTyping,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the messages list when messages update or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleSuggestionClick = (suggestionText: string) => {
    // Strip emojis if needed, or send as is
    onSendMessage(suggestionText.replace(/^[^\w]*/, ""));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Slide-out AI Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-white/[0.06] bg-[#09090b]/85 backdrop-blur-xl transition-all duration-300 ease-out sm:w-[400px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.04] bg-[#09090b]/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SparklesIcon size={16} className="text-violet-400 animate-pulse" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              AI Creative Partner
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-all"
            title="Close Assistant"
          >
            <XIcon size={16} />
          </button>
        </header>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex w-full flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all duration-300 border ${
                    isUser
                      ? "bg-violet-600/10 border-violet-500/20 text-white rounded-tr-sm"
                      : "bg-white/[0.02] border-white/[0.04] text-zinc-300 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex w-full flex-col items-start">
              <div className="rounded-2xl rounded-tl-sm p-3.5 bg-white/[0.02] border border-white/[0.04] text-zinc-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Auto Scroll Marker */}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions Tray (Only display if not currently thinking) */}
        {!isTyping && (
          <div className="px-6 py-2 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold tracking-wider text-zinc-500 font-mono uppercase">
              SUGGESTED PROMPTS
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PREMADE_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-left text-[10px] text-zinc-400 bg-white/[0.01] hover:bg-violet-500/10 hover:text-violet-300 border border-white/[0.04] hover:border-violet-500/20 rounded-xl p-2.5 transition-all duration-300 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 border-t border-white/[0.04] bg-black/[0.15]"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask AI anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-4 pr-12 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-violet-500/10"
              title="Send Message"
            >
              <SendIcon size={12} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AIAssistant;
