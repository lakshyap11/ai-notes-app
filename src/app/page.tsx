"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import AIAssistant from "@/components/AIAssistant";
import Toast from "@/components/Toast";
import { SparklesIcon } from "@/components/Icons";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: "1",
    title: "🚀 Introducing Project Antigravity",
    content: `This is a modern minimal AI notes application built to demonstrate premium glassmorphism design and responsive layouts.

### Key Features:
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile displays.
- **Glassmorphism Design**: Sleek dark translucent borders, blur filters, and neon glow backdrops.
- **AI-Powered Core**: Floating assistant drawer and inline text generators (Refine, Summarize, autocomplete).
- **Interactive States**: Real-time title & content updating, search filtering, and state persistence.

Try clicking the **"AI Actions"** above or open the floating AI assistant in the bottom right!`,
    updatedAt: "Today, 7:45 PM",
  },
  {
    id: "2",
    title: "💡 Startup Agent Ideas",
    content: `Brainstorming list for agentic products & automation:

1. **Self-Refactoring Codebases**: An agent that acts as a continuous linter, fixing complex architectural patterns based on user feedback.
2. **Ambient Tone-Matching Email Assistant**: Learns your writing patterns to compose drafts indistinguishable from your own emails.
3. **Hyper-Personalized Travel Concierge**: A visual planner that generates daily travel itineraries, matching dining preferences, budget, and local events.

Let's refine this outline using the AI action bar!`,
    updatedAt: "Yesterday, 3:12 PM",
  },
  {
    id: "3",
    title: "🛒 Personal To-Do & Grocery List",
    content: `- Buy organic oat milk (unsweetened)
- Fresh blueberries & sweet bananas
- Ground dark roast coffee beans
- Clean and organize home office desk
- Refactor tailwind CSS design tokens for project homepage`,
    updatedAt: "May 21, 10:20 AM",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "assistant",
    text: "Hello! I am your AI writing companion. I can help you summarize notes, brainstorm ideas, draft checklists, or outline schedules. What are we creating today?",
    timestamp: "7:45 PM",
  },
];

interface ToastState {
  show: boolean;
  message: string;
  description?: string;
  type: "info" | "warning" | "error";
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Sidebar open state (specifically for responsive mobile drawer)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // AI assistant drawer state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  
  // Inline editor AI action loading state
  const [editorProcessingAction, setEditorProcessingAction] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    description: "",
    type: "info",
  });

  const triggerToast = (
    message: string,
    description?: string,
    type: "info" | "warning" | "error" = "info"
  ) => {
    setToast({ show: true, message, description, type });
  };

  // Sync state helper to make sure search filters don't hide the note if we select it
  const activeNote = notes.find((note) => note.id === activeNoteId);

  // Handle initial hydration & loading from localStorage
  useEffect(() => {
    setHasMounted(true);
    const savedNotes = localStorage.getItem("aethernote_notes");
    const savedActiveId = localStorage.getItem("aethernote_active_id");
    
    let loadedNotes = INITIAL_NOTES;
    if (savedNotes) {
      try {
        loadedNotes = JSON.parse(savedNotes);
      } catch (e) {
        loadedNotes = INITIAL_NOTES;
      }
    } else {
      localStorage.setItem("aethernote_notes", JSON.stringify(INITIAL_NOTES));
    }
    
    setNotes(loadedNotes);

    if (loadedNotes.length > 0) {
      const defaultActiveId = loadedNotes.some((n) => n.id === savedActiveId)
        ? (savedActiveId || loadedNotes[0].id)
        : loadedNotes[0].id;
      setActiveNoteId(defaultActiveId);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("aethernote_notes", JSON.stringify(notes));
    }
  }, [notes, hasMounted]);

  // Save activeNoteId to localStorage whenever it changes
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("aethernote_active_id", activeNoteId);
    }
  }, [activeNoteId, hasMounted]);

  // Trigger side-effects or close sidebar on selection for mobile devices
  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    setIsSidebarOpen(false);
  };

  const handleUpdateNote = (updatedFields: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === activeNoteId) {
          const now = new Date();
          const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...note,
            ...updatedFields,
            updatedAt: `Today, ${timeString}`,
          };
        }
        return note;
      })
    );
  };

  const handleCreateNote = () => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: "Untitled Note",
      content: "",
      updatedAt: "Just now",
    };
    
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newId);
    setSearchQuery("");
    setIsSidebarOpen(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the note we are deleting
    
    setNotes((prevNotes) => {
      const remainingNotes = prevNotes.filter((note) => note.id !== id);
      
      // If we are deleting the active note, set a new active note
      if (activeNoteId === id) {
        if (remainingNotes.length > 0) {
          setActiveNoteId(remainingNotes[0].id);
        } else {
          setActiveNoteId("");
        }
      }
      return remainingNotes;
    });
  };

  const streamTextToEditor = (startingText: string, targetText: string) => {
    let currentLength = startingText.length;
    const targetLength = targetText.length;
    
    if (targetLength <= currentLength) {
      handleUpdateNote({ content: targetText });
      setEditorProcessingAction(null);
      return;
    }
    
    let currentText = startingText;
    const charactersToAdd = targetText.substring(currentLength);
    let charIndex = 0;
    
    const interval = setInterval(() => {
      if (charIndex < charactersToAdd.length) {
        currentText += charactersToAdd[charIndex];
        handleUpdateNote({ content: currentText });
        charIndex++;
      } else {
        clearInterval(interval);
        setEditorProcessingAction(null);
      }
    }, 8);
  };

  // Connected AI responses inside the Editor (with demo-mode fallback)
  const handleEditorAIAction = async (action: string) => {
    if (!activeNote || editorProcessingAction) return;

    setEditorProcessingAction(action);
    
    // Map visual action to backend action names
    const actionMap: Record<string, "summarize" | "grammar" | "improve" | "chat"> = {
      summarize: "summarize",
      refine: "improve",
      autocomplete: "chat",
      professional: "grammar",
    };
    
    const apiAction = actionMap[action] || "improve";
    let apiContent = activeNote.content;
    let apiNoteContext = undefined;
    
    if (action === "autocomplete") {
      apiContent = "Please autocomplete the next sentence for this note. Start writing immediately from where the text left off without any greetings, commentary, or introduction.";
      apiNoteContext = activeNote.content;
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: apiAction,
          content: apiContent,
          noteContext: apiNoteContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error (status: ${res.status})`);
      }

      const data = await res.json();
      const generatedText = data.response;
      
      let finalContent = "";
      if (action === "summarize") {
        finalContent = `${activeNote.content}\n\n---\n### 🧠 AI Summary:\n${generatedText}`;
      } else if (action === "refine" || action === "professional") {
        finalContent = generatedText;
      } else if (action === "autocomplete") {
        finalContent = `${activeNote.content}\n\n${generatedText}`;
      }

      streamTextToEditor(activeNote.content, finalContent);

    } catch (err: any) {
      console.warn("[AetherNote AI API Hook]: Failed to connect to Gemini API. Falling back to local simulation.", err);
      
      // Trigger a beautiful notification informing the user they are in Demo Mode
      triggerToast(
        "Demo Mode Active",
        "The server Gemini API Key is not configured. Displaying a premium simulated response.",
        "warning"
      );

      // Trigger local simulation fallback
      setTimeout(() => {
        let finalContent = "";
        if (action === "summarize") {
          finalContent = `${activeNote.content}\n\n---\n### 🧠 AI Summary:\nThis note discusses "${activeNote.title || "Untitled"}" in detail. It includes action points for implementation, structures core details, and outlines the key aesthetic elements of our cyber-dark notes framework. Ready for final review.`;
        } else if (action === "refine") {
          finalContent = `### ✨ Refined: ${activeNote.title}\n\n${activeNote.content.replace(/-\s/g, "✓ ").replace(/\b(ideas|draft)\b/gi, "Strategic Architecture")}\n\n*Optimized for clarity and professional presentation by AI.*`;
        } else if (action === "autocomplete") {
          finalContent = `${activeNote.content}\n\nIn addition to these core goals, the next step involves refining user flows and initiating dark mode accessibility styling parameters to deliver a truly world-class UI.`;
        } else if (action === "professional") {
          finalContent = `**EXECUTIVE BRIEF: ${activeNote.title.toUpperCase()}**\n\n${activeNote.content}\n\n*STATUS: Approved for standard development operations.*`;
        }
        
        streamTextToEditor(activeNote.content, finalContent);
      }, 1200);
    }
  };

  // Connected AI responses inside Chat Panel (with demo-mode fallback)
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isAITyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAITyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          content: messageText,
          noteContext: activeNote?.content || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error (status: ${res.status})`);
      }

      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "assistant",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setAiMessages((prev) => [...prev, aiMsg]);
      setIsAITyping(false);

    } catch (err: any) {
      console.warn("[AetherNote AI Chat API Hook]: Failed to connect to Gemini API. Falling back to local chat simulation.", err);
      
      // Trigger a beautiful notification informing the user they are in Demo Mode
      triggerToast(
        "Demo Mode Active",
        "The server Gemini API Key is not configured. Falling back to simulated chat response.",
        "warning"
      );

      // Simulate AI thinking and typing response fallback
      setTimeout(() => {
        let aiText = "";
        const lower = messageText.toLowerCase();

        if (lower.includes("hello") || lower.includes("hi")) {
          aiText = "Hello! I hope you're having an inspiring day. How can I help refine your ideas or draft your notes today?";
        } else if (lower.includes("summarize") || lower.includes("summary")) {
          if (activeNote && activeNote.content.trim()) {
            aiText = `Here's a quick executive summary of "${activeNote.title}":\n\n1. Focuses on organizing structured key ideas with a glassmorphism dark system.\n2. Lays down immediate actionable lists (like checklists and project features).\n3. Emphasizes clean minimal typography to maximize visual clarity and minimize distractions.`;
          } else {
            aiText = "It looks like the active note is empty. Paste some text or type inside the main canvas, and I'll summarize it instantly!";
          }
        } else if (lower.includes("ideas") || lower.includes("brainstorm")) {
          aiText = `Here are 3 unique brainstorming directions for your notes:
- **Visual Mapping Mode**: Transforming lists into an automatic mind-map canvas.
- **Collaborative Whisper**: Seamless voice-to-text notes with real-time semantic organization.
- **Dynamic Context Cards**: Automatically fetch relevant links, APIs, or files related to your note keywords.`;
        } else {
          aiText = `I've analyzed your prompt: "${messageText}". I can definitely assist with that! 
If you want to apply updates directly to your active note, try using the **AI Power Bar** at the top of the editor canvas for quick, targeted enhancements. Let me know if you need specific checklists or outlines generated.`;
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setAiMessages((prev) => [...prev, aiMsg]);
        setIsAITyping(false);
      }, 1500);
    }
  };

  if (!hasMounted) {
    return (
      <div className="relative flex h-screen w-full bg-[#050507] text-[#f4f4f5] font-sans items-center justify-center overflow-hidden">
        {/* Dynamic Ambient Neon Backgrounds */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full radial-glow-violet opacity-80 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full radial-glow-cyan opacity-40"></div>
          
          {/* Sleek Dotted Grid Mask */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
        </div>
        
        {/* Sleek loading indicator */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/25 border border-violet-400/30 text-white animate-pulse">
            <span className="text-xl font-bold tracking-wider">A</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-widest uppercase">
            <span>Booting Engine</span>
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full bg-[#050507] text-[#f4f4f5] font-sans overflow-hidden">
      {/* Dynamic Ambient Neon Backgrounds */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full radial-glow-violet opacity-80 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full radial-glow-cyan opacity-40"></div>
        
        {/* Sleek Dotted Grid Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {/* Left Notes Sidebar Component */}
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Note Editor Canvas */}
        <Editor
          activeNote={activeNote}
          onUpdateNote={handleUpdateNote}
          onAIAction={handleEditorAIAction}
          isProcessing={editorProcessingAction}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Glassmorphic Right AI Panel Drawer */}
        <AIAssistant
          isOpen={isAIPanelOpen}
          setIsOpen={setIsAIPanelOpen}
          messages={aiMessages}
          onSendMessage={handleSendMessage}
          isTyping={isAITyping}
        />
      </div>

      {/* Floating AI Button (Only if Assistant Drawer is closed) */}
      {!isAIPanelOpen && (
        <button
          onClick={() => setIsAIPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/25 border border-violet-400/30 text-white cursor-pointer transition-all duration-300 hover:scale-115 hover:shadow-violet-500/40 hover:rotate-6 active:scale-95 group"
          title="Open AI Writing Assistant"
          aria-label="Open AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 pointer-events-none"></div>
          <SparklesIcon className="relative z-10 w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Toast Alert Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          description={toast.description}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}
