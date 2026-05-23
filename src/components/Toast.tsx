import React, { useEffect } from "react";
import { XIcon, SparklesIcon } from "./Icons";

interface ToastProps {
  message: string;
  description?: string;
  type?: "info" | "warning" | "error";
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  description,
  type = "info",
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    info: {
      border: "border-violet-500/20",
      bg: "bg-violet-950/20",
      iconColor: "text-violet-400",
      shadow: "shadow-violet-500/5",
    },
    warning: {
      border: "border-amber-500/20",
      bg: "bg-amber-950/20",
      iconColor: "text-amber-400",
      shadow: "shadow-amber-500/5",
    },
    error: {
      border: "border-red-500/20",
      bg: "bg-red-950/20",
      iconColor: "text-red-400",
      shadow: "shadow-red-500/5",
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] max-w-md items-start gap-3 rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${style.border} ${style.bg} ${style.shadow}`}>
      {/* Sparkle Notification Icon */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.02] border border-white/[0.04] ${style.iconColor}`}>
        <SparklesIcon size={16} className="animate-pulse" />
      </div>

      {/* Message and Description */}
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-semibold text-white tracking-wide">{message}</h4>
        {description && (
          <p className="text-[10px] leading-relaxed text-zinc-400 font-sans">{description}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] text-zinc-500 hover:text-white cursor-pointer active:scale-95 transition-all"
        title="Dismiss Notification"
      >
        <XIcon size={12} />
      </button>
    </div>
  );
};

export default Toast;
