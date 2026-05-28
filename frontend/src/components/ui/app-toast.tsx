'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type ToastTone = 'success' | 'error' | 'info';

type ToastPayload = {
  id?: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ActiveToast = Required<ToastPayload>;
type ToastAppearance = {
  card: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
  titleColor: string;
  descriptionColor: string;
};

const toastEventName = 'gradassess:toast';
const queuedToastKey = 'gradassess-pending-toast';

function getToastAppearance(tone: ToastTone, isDark: boolean): ToastAppearance {
  if (tone === 'success') {
    return {
      card: {
        backgroundColor: isDark ? 'rgba(19, 78, 54, 0.92)' : '#ecfdf3',
        borderColor: isDark ? 'rgba(110, 231, 183, 0.24)' : '#6ee7b7',
        color: isDark ? '#ecfdf5' : '#14532d',
      },
      titleColor: isDark ? '#f0fdf4' : '#14532d',
      descriptionColor: isDark ? 'rgba(220, 252, 231, 0.9)' : '#166534',
    };
  }

  if (tone === 'error') {
    return {
      card: {
        backgroundColor: isDark ? 'rgba(127, 29, 29, 0.9)' : '#fff1f2',
        borderColor: isDark ? 'rgba(253, 164, 175, 0.26)' : '#fda4af',
        color: isDark ? '#fff1f2' : '#881337',
      },
      titleColor: isDark ? '#fff1f2' : '#881337',
      descriptionColor: isDark ? 'rgba(255, 228, 230, 0.88)' : '#9f1239',
    };
  }

  return {
    card: {
      backgroundColor: isDark ? 'var(--dashboard-panel-bg)' : 'rgba(255, 255, 255, 0.98)',
      borderColor: 'var(--dashboard-panel-border)',
      color: 'var(--dashboard-text)',
    },
    titleColor: 'var(--dashboard-text)',
    descriptionColor: 'var(--dashboard-muted)',
  };
}

function normalizeToast(payload: ToastPayload): ActiveToast {
  return {
    id:
      payload.id ??
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`),
    title: payload.title,
    description: payload.description ?? '',
    tone: payload.tone ?? 'info',
  };
}

export function emitAppToast(payload: ToastPayload) {
  const toast = normalizeToast(payload);
  window.dispatchEvent(new CustomEvent<ActiveToast>(toastEventName, { detail: toast }));
}

export function queueAppToast(payload: ToastPayload) {
  const toast = normalizeToast(payload);
  window.sessionStorage.setItem(queuedToastKey, JSON.stringify(toast));
}

export function AppToastViewport() {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const addToast = (toast: ActiveToast) => {
    setToasts((current) => [...current, toast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 3200);
  };

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ActiveToast>;
      addToast(customEvent.detail);
    };

    window.addEventListener(toastEventName, handleToast as EventListener);

    return () => {
      window.removeEventListener(toastEventName, handleToast as EventListener);
    };
  }, []);

  useEffect(() => {
    const queuedToast = window.sessionStorage.getItem(queuedToastKey);
    if (!queuedToast) return;

    window.sessionStorage.removeItem(queuedToastKey);
    addToast(JSON.parse(queuedToast) as ActiveToast);
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isDark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
            const appearance = getToastAppearance(toast.tone, isDark);

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                style={appearance.card}
                className="pointer-events-auto rounded-[1.3rem] border px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur"
              >
                <p className="text-sm font-semibold" style={{ color: appearance.titleColor }}>
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6" style={{ color: appearance.descriptionColor }}>
                    {toast.description}
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
