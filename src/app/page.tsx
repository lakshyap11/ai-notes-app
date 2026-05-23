"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Toast from "@/components/Toast";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  type?: "note" | "conversation";
  messages?: ChatMessage[];
  createdAt?: string;
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
  
  // Local active conversation typing loader state
  const [isConversationTyping, setIsConversationTyping] = useState<boolean>(false);
  
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

  const handleSaveChatAsNote = () => {
    if (!activeNote || !activeNote.messages) return;
    
    // Check if there are user messages to save
    const userMessages = activeNote.messages.filter((msg) => msg.sender === "user");
    if (userMessages.length === 0) {
      triggerToast(
        "No Conversational History",
        "Type some thoughts in the reflection input first before saving.",
        "warning"
      );
      return;
    }

    const date = new Date();
    const dateString = date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Auto-generate conversational title based on the first user query
    const firstUserMsg = userMessages[0];
    let cleanText = firstUserMsg.text.replace(/^[^\w]*/, "").trim();
    const words = cleanText.split(/\s+/);
    const titleSnippet = words.slice(0, 5).join(" ");
    const autoTitle = `📓 Journal: ${titleSnippet}${words.length > 5 ? "..." : ""}`;

    // 2. Formulate beautiful structured markdown text
    let markdownContent = `# 📓 Conversational Journal\n*Archived on ${dateString} at ${timeString}*\n\nThis note preserves the complete thread of your dialogue session with the AI Assistant.\n\n---\n\n`;

    activeNote.messages.forEach((msg) => {
      // Skip welcome tags for cleaner static documents
      if (msg.id === "welcome") return;

      const speakerName = msg.sender === "user" ? "👤 User" : "🧠 AI Assistant";
      markdownContent += `### **${speakerName}** *(${msg.timestamp})*\n\n${msg.text.trim()}\n\n---\n\n`;
    });

    markdownContent += `\n*AetherNote Auto-Archive Engine. All changes saved locally.*`;

    // 3. Create a static separate copy of the conversation note and add to state
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: autoTitle,
      content: markdownContent,
      updatedAt: `Today, ${timeString}`,
      type: "conversation",
      messages: JSON.parse(JSON.stringify(activeNote.messages)),
      createdAt: `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeString}`,
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newId);
    setSearchQuery("");

    triggerToast(
      "Journal Note Saved",
      "A static separate copy of this session has been saved in the sidebar.",
      "info"
    );
  };

  // Toggle reflective conversational mode directly inside the note editor!
  const handleToggleTalkMode = () => {
    if (!activeNote) return;

    const isCurrentlyConversation = activeNote.type === "conversation";
    const nextType = isCurrentlyConversation ? "note" : "conversation";
    
    // Initialize custom, context-aware welcome greeting if entering Talk mode for the first time
    let updatedMessages = activeNote.messages || [];
    if (nextType === "conversation" && updatedMessages.length === 0) {
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedMessages = [
        {
          id: "welcome",
          sender: "assistant",
          text: `Hey! I'm here to listen and help you process your thoughts on "${activeNote.title || "this topic"}". What's on your mind right now?`,
          timestamp: timeString
        }
      ];
    }

    handleUpdateNote({
      type: nextType,
      messages: updatedMessages,
      createdAt: activeNote.createdAt || `${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });

    triggerToast(
      nextType === "conversation" ? "Conversational Mode Enabled" : "Editor Mode Restored",
      nextType === "conversation" 
        ? "The note has transformed into a reflective conversation canvas." 
        : "Standard document writing editor has been restored.",
      "info"
    );
  };

  // Send a message directly inside the note canvas conversational timeline
  const handleSendMessageToNote = async (messageText: string) => {
    if (!activeNote || !messageText.trim() || isConversationTyping) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now().toString(),
      sender: "user" as const,
      text: messageText,
      timestamp: timeString,
    };

    // 1. Immediately append user message to local note state
    const currentMessages = activeNote.messages || [];
    const updatedMessagesWithUser = [...currentMessages, userMsg];
    
    handleUpdateNote({ messages: updatedMessagesWithUser });
    setIsConversationTyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          content: messageText,
          noteContext: activeNote.content || "", // Pass standard text content as context!
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error (status: ${res.status})`);
      }

      const data = await res.json();
      
      const aiMsg = {
        id: Date.now().toString(),
        sender: "assistant" as const,
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // 2. Append AI response to note state
      handleUpdateNote({ messages: [...updatedMessagesWithUser, aiMsg] });
      setIsConversationTyping(false);

    } catch (err: any) {
      console.warn("[AetherNote Inline Chat Hook]: Failed to connect to Gemini API. Falling back to local reflection.", err);
      
      triggerToast(
        "Demo Mode Active",
        "The server Gemini API Key is not configured. Falling back to simulated chat response.",
        "warning"
      );

      // Simulated local fallback
      setTimeout(() => {
        let aiText = "";
        const lower = messageText.toLowerCase();

        if (lower.includes("hello") || lower.includes("hi")) {
          aiText = `Hey! I'm so glad we're chatting. I'd love to hear what's going on with "${activeNote.title}". What's currently on your mind?`;
        } else if (lower.includes("summarize") || lower.includes("summary")) {
          aiText = `Looking back at what we've talked about for "${activeNote.title}", here are the main things that stood out:\n\n- We're focusing on what drives you.\n- We're organizing the core thoughts.\n- We're looking for clear steps forward.\n\nHow does that feel to you?`;
        } else {
          aiText = `I completely understand what you mean. That makes a lot of sense. Tell me a bit more about what's behind that thought?`;
        }

        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: "assistant" as const,
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        handleUpdateNote({ messages: [...updatedMessagesWithUser, aiMsg] });
        setIsConversationTyping(false);
      }, 1500);
    }
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
          onToggleTalkMode={handleToggleTalkMode}
          onSendMessage={handleSendMessageToNote}
          isAITyping={isConversationTyping}
          onSaveChatAsNote={handleSaveChatAsNote}
        />
      </div>

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
