"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

export default function Modal({ open, onClose, onConfirm, title, message, confirmText = "Ya", cancelText = "Batal", variant = "default" }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-[var(--muted)] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[var(--card-border)] hover:bg-white/5 rounded-xl text-sm font-medium transition"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                variant === "danger"
                  ? "bg-[var(--danger)] hover:bg-red-600 text-white"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
