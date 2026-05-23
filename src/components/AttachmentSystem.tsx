import React, { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, DownloadIcon, TrashIcon, FileTextIcon, XIcon, EyeIcon } from "./Icons";

export interface Attachment {
  id: string;
  type: "image" | "audio" | "pdf" | "document" | "generic";
  name: string;
  url: string; // Stored as Reference, loaded from IndexedDB
  size: string;
  createdAt: string;
}

interface AttachmentCardProps {
  attachment: Attachment;
  dataUrl?: string;
  onDelete: () => void;
  onExpandImage: (url: string, name: string) => void;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  dataUrl,
  onDelete,
  onExpandImage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAudioPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dataUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(dataUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const triggerDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. IMAGE PREVIEW CARD
  if (attachment.type === "image") {
    return (
      <div className="group relative aspect-square rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden hover:border-teal-500/25 transition-all duration-300 shadow-md hover:shadow-teal-950/10 cursor-pointer">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={attachment.name}
            onClick={() => onExpandImage(dataUrl, attachment.name)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-black/20 animate-pulse">
            <span className="text-[10px] text-zinc-600 font-mono uppercase">Loading Block...</span>
          </div>
        )}
        {/* Soft Glass Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={() => dataUrl && onExpandImage(dataUrl, attachment.name)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            title="Expand Image"
          >
            <EyeIcon size={14} />
          </button>
          <button
            onClick={triggerDownload}
            disabled={!dataUrl}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            title="Download"
          >
            <DownloadIcon size={13} />
          </button>
          <button
            onClick={onDelete}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:scale-95 transition-all cursor-pointer"
            title="Remove Attachment"
          >
            <TrashIcon size={13} />
          </button>
        </div>
        {/* Title Tag */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg py-1 px-1.5 border border-white/[0.04] text-[9.5px] font-sans truncate text-zinc-300 pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
          {attachment.name}
        </div>
      </div>
    );
  }

  // 2. AUDIO PLAYBACK CARD
  if (attachment.type === "audio") {
    return (
      <div className="group flex flex-col p-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-amber-500/20 hover:bg-white/[0.02] transition-all duration-300 space-y-3 relative shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAudioPlayPause}
            disabled={!dataUrl}
            className={`h-9 w-9 flex items-center justify-center rounded-xl cursor-pointer active:scale-95 transition-all ${
              isPlaying
                ? "bg-amber-500/20 text-amber-350 border border-amber-500/30 animate-pulse"
                : "bg-white/[0.04] text-zinc-300 border border-white/[0.06] hover:bg-amber-500/10 hover:text-amber-300"
            } disabled:opacity-50`}
            title={isPlaying ? "Pause voice note" : "Play voice note"}
          >
            {isPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
          </button>
          <div className="flex-1 min-w-0">
            <h5 className="text-[11px] font-semibold text-zinc-200 truncate" title={attachment.name}>
              {attachment.name}
            </h5>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">{attachment.size}</span>
          </div>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Remove attachment"
          >
            <TrashIcon size={12} />
          </button>
        </div>

        {/* Waves Animation */}
        <div className="flex items-end justify-between h-5 px-1 bg-black/10 rounded-lg py-1 border border-white/[0.02]">
          {[...Array(16)].map((_, i) => {
            const h = isPlaying
              ? `${Math.floor(Math.random() * 12) + 4}px`
              : "4px";
            return (
              <span
                key={i}
                style={{ height: h }}
                className={`w-0.5 rounded-full ${
                  isPlaying ? "bg-amber-400/80" : "bg-zinc-700"
                } transition-all duration-200`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // 3. DOCUMENT & GENERIC CARD
  return (
    <div className="group flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] hover:border-teal-500/20 transition-all duration-300 relative shadow-md select-none">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10">
        <FileTextIcon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-[11px] font-semibold text-zinc-200 truncate" title={attachment.name}>
          {attachment.name}
        </h5>
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 mt-0.5">
          <span className="uppercase">{attachment.type}</span>
          <span>•</span>
          <span>{attachment.size}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={triggerDownload}
          disabled={!dataUrl}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"
          title="Download File"
        >
          <DownloadIcon size={12} />
        </button>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-opacity duration-200"
          title="Remove attachment"
        >
          <TrashIcon size={12} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// INTERACTIVE CONVERSATION STRIP CARD
// ==========================================
interface AttachmentStripCardProps {
  attachment: Attachment;
  dataUrl?: string;
  onDelete: () => void;
  onExpandImage: (url: string, name: string) => void;
}

export const AttachmentStripCard: React.FC<AttachmentStripCardProps> = ({
  attachment,
  dataUrl,
  onDelete,
  onExpandImage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAudioPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dataUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(dataUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const triggerDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (attachment.type === "image") {
    return (
      <div className="group relative h-14 w-20 shrink-0 rounded-xl border border-white/[0.04] bg-white/[0.01] overflow-hidden hover:border-amber-500/25 transition-all duration-300 shadow cursor-pointer">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={attachment.name}
            onClick={() => onExpandImage(dataUrl, attachment.name)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-black/10 animate-pulse" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
          <button
            onClick={() => dataUrl && onExpandImage(dataUrl, attachment.name)}
            className="h-5 w-5 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-95"
            title="Expand"
          >
            <EyeIcon size={9} />
          </button>
          <button
            onClick={onDelete}
            className="h-5 w-5 flex items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer active:scale-95"
            title="Delete"
          >
            <TrashIcon size={9} />
          </button>
        </div>
      </div>
    );
  }

  if (attachment.type === "audio") {
    return (
      <div className="group flex items-center gap-2.5 h-14 px-3 shrink-0 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-amber-500/25 hover:bg-white/[0.02] transition-all duration-300 min-w-[140px] shadow relative">
        <button
          onClick={handleAudioPlayPause}
          disabled={!dataUrl}
          className={`h-7 w-7 flex items-center justify-center rounded-lg cursor-pointer active:scale-95 transition-all ${
            isPlaying
              ? "bg-amber-500/20 text-amber-350 border border-amber-500/30"
              : "bg-white/[0.04] text-zinc-300 border border-white/[0.06] hover:bg-amber-500/10 hover:text-amber-300"
          } disabled:opacity-50`}
        >
          {isPlaying ? <PauseIcon size={9} /> : <PlayIcon size={9} />}
        </button>
        <div className="flex-1 min-w-0 pr-2">
          <h5 className="text-[10px] font-semibold text-zinc-300 truncate" title={attachment.name}>
            {attachment.name}
          </h5>
          <span className="text-[8px] font-mono text-zinc-500 uppercase">{attachment.size}</span>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-full flex items-center justify-center border border-red-500/30 transition-all cursor-pointer z-10"
          title="Remove"
        >
          <XIcon size={8} />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2.5 h-14 px-3 shrink-0 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-teal-500/20 hover:bg-white/[0.02] transition-all duration-300 min-w-[150px] shadow relative">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/10">
        <FileTextIcon size={12} />
      </div>
      <div className="flex-1 min-w-0 pr-3">
        <h5 className="text-[10px] font-semibold text-zinc-300 truncate font-sans" title={attachment.name}>
          {attachment.name}
        </h5>
        <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500 mt-0.5">
          <span className="uppercase">{attachment.type}</span>
          <span>•</span>
          <span>{attachment.size}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={triggerDownload}
          disabled={!dataUrl}
          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer active:scale-95"
          title="Download"
        >
          <DownloadIcon size={10} />
        </button>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-full flex items-center justify-center border border-red-500/30 transition-all cursor-pointer z-10"
          title="Remove"
        >
          <XIcon size={8} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// PREMIUM FULLSCREEN IMAGE LIGHTBOX
// ==========================================
interface FullscreenImageModalProps {
  url: string;
  name: string;
  onClose: () => void;
}

export const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({
  url,
  name,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const triggerDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-fadeIn"
    >
      {/* Absolute Close Controls */}
      <div className="absolute top-5 right-5 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerDownload();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
          title="Download image"
        >
          <DownloadIcon size={16} />
        </button>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
          title="Close Lightroom"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Floating Lightroom Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80%] max-w-[90%] md:max-w-[80%] flex flex-col items-center gap-4 animate-scaleUp"
      >
        <img
          src={url}
          alt={name}
          className="max-h-[72vh] object-contain rounded-2xl border border-white/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        />
        <div className="text-center">
          <h4 className="text-sm font-semibold text-zinc-200 tracking-wide font-sans">{name}</h4>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">AetherNote Memory Lightbox</p>
        </div>
      </div>
    </div>
  );
};
