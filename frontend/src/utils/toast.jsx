import React from 'react';
import toast from 'react-hot-toast';

const DURATION = 4000;

const VARIANTS = {
  success: { title: 'Success', bg: '#3f9d6b', icon: <path d="M7 12.5l3.2 3.2L17 9" /> },
  error: { title: 'Error', bg: '#d9534a', icon: <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" /> },
  info: { title: 'Info', bg: '#3aa0c4', icon: <path d="M12 11v5M12 8v.01" /> },
  warning: { title: 'Warning', bg: '#e0a526', icon: <path d="M12 7.5v5.5M12 16.5v.01" /> }
};

const ToastCard = ({ t, variant, message, title }) => {
  const v = VARIANTS[variant];
  return (
    <div
      role="status"
      className="relative w-[340px] max-w-[92vw] overflow-hidden rounded-xl text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
      style={{
        background: v.bg,
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateX(0)' : 'translateX(24px)',
        transition: 'opacity 200ms ease, transform 200ms ease'
      }}
    >
      <div className="flex items-start gap-3 px-4 pb-4 pt-3.5">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-9 w-9 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          {v.icon}
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight">{title || v.title}</p>
          <p className="mt-0.5 text-sm leading-snug text-white/95">{message}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(t.id)}
          className="-mr-1 -mt-1 rounded p-1 text-white/90 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/45 toast-progress" style={{ animationDuration: `${DURATION}ms` }} />
    </div>
  );
};

const show = (variant) => (message, title) =>
  toast.custom((t) => <ToastCard t={t} variant={variant} message={message} title={title} />, {
    duration: DURATION
  });

export const notify = {
  success: show('success'),
  error: show('error'),
  info: show('info'),
  warning: show('warning')
};

export default notify;
