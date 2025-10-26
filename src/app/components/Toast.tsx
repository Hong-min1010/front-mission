'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'fail';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

type ToastItem = Required<Omit<ToastOptions, 'duration'>> & { duration: number };

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idSeq = useRef(0);

  const showToast = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? `toast_${Date.now()}_${idSeq.current++}`;
    const t: ToastItem = {
      id,
      type: opts.type ?? 'success',
      message: opts.message,
      duration: opts.duration ?? 4000,
    };
    setToasts(prev => [...prev, t]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // 클라이언트에서만 true
  }, []);

  if (!mounted) return null;

  const portalTarget = document.body;
  if (!portalTarget) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="
        pointer-events-none
        fixed bottom-6 left-1/2 -translate-x-1/2
        z-[9999]
        flex flex-col items-center gap-2
      "
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />
      ))}
    </div>,
    portalTarget
  );
};

const ToastCard: React.FC<{
  item: ToastItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const open = window.setTimeout(() => setShow(true), 10);
    timerRef.current = window.setTimeout(() => setShow(false), item.duration);

    return () => {
      window.clearTimeout(open);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [item.duration]);

  const handleTransitionEnd = () => {
    if (!show) onClose();
  };

  const bg =
    item.type === 'success' ? 'bg-[#6CD383] text-black' : 'bg-[#D36C6C] text-white';
  const icon =
    item.type === 'success' ? 'check_circle' : 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      onTransitionEnd={handleTransitionEnd}
      className={`
        pointer-events-auto
        w-full max-w-[480px]
        ${bg}
        rounded-lg shadow-lg border border-black/10
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        w-[min(92vw,480px)] mx-auto
        grid grid-cols-[auto,1fr,auto] items-center
        px-4 py-2
      `}
    >
      <div className='flex flex-row items-center justify-between w-full gap-5'>
        <span className="material-symbols-outlined leading-none select-none text-[22px]">{icon}</span>
        <div className="text-sm font-semibold leading-5 text-center">
          {item.message}
        </div>
        <button
          aria-label="닫기"
          onClick={() => setShow(false)}
          className="rounded hover:bg-black/10 active:scale-95 transition pt-1"
        >
          <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
        </button>
      </div>
    </div>
  );
};
