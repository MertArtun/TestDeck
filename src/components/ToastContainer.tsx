import React from 'react';
import { useToastStore } from '../store/toastStore';
import { useI18n } from '../i18n';

const typeStyles: Record<string, { bg: string; border: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.95)', border: 'rgba(255,255,255,0.3)' },
  error: { bg: 'rgba(239, 68, 68, 0.95)', border: 'rgba(255,255,255,0.3)' },
  info: { bg: 'rgba(59, 130, 246, 0.95)', border: 'rgba(255,255,255,0.3)' },
  warning: { bg: 'rgba(245, 158, 11, 0.95)', border: 'rgba(255,255,255,0.3)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const { t } = useI18n();

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 9999,
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const s = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            role="status"
            style={{
              background: s.bg,
              color: 'white',
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '12px 14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              minWidth: 260,
              maxWidth: 420,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{toast.title}</div>
                )}
                <div style={{ opacity: 0.95 }}>{toast.message}</div>
              </div>
              <button
                aria-label={t('common.close')}
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


