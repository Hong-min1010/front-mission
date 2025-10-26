// app/components/ConfirmModal.tsx
'use client';

import React, { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  confirmText,
  cancelText,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[min(92vw,360px)] rounded-xl bg-white shadow-xl border border-black/10 p-5">
        <button
          aria-label="닫기"
          className="absolute right-3 top-3 text-black/70 hover:text-black transition"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mt-2 mb-5 text-center text-black font-semibold">
          {message}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-bold transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
