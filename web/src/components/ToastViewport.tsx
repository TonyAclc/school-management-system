import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore, ToastMessage } from '../store/toast-store';

const Toast = ({ message }: { message: ToastMessage }) => {
  const remove = useToastStore(s => s.remove);

  useEffect(() => {
    const duration = message.duration ?? 5000;
    const timer = setTimeout(() => remove(message.id), duration);
    return () => clearTimeout(timer);
  }, [message, remove]);

  const variants: Record<string, { bg: string, color: string }> = {
    success: { bg: 'var(--color-success)', color: '#fff' },
    error: { bg: 'var(--color-danger)', color: '#fff' },
    warning: { bg: 'var(--color-warning)', color: '#fff' },
    info: { bg: 'var(--color-info)', color: '#fff' },
  };

  const style = variants[message.variant] || variants.info;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: 'var(--space-2)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '300px',
        animation: 'slideIn var(--duration-base) var(--easing-standard)',
      }}
    >
      {message.message}
      <button 
        onClick={() => remove(message.id)}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '0 0 0 var(--space-4)',
          opacity: 0.8,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const ToastViewport = () => {
  const toasts = useToastStore(s => s.toasts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {toasts.map(t => <Toast key={t.id} message={t} />)}
    </div>,
    document.body
  );
};
