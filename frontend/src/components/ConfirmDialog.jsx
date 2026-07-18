import React, { useEffect } from 'react';

/**
 * Lightweight confirm modal — returns nothing until open.
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="km-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="km-confirm-title">
      <button
        type="button"
        className="km-confirm-backdrop"
        aria-label="Dismiss"
        disabled={busy}
        onClick={() => !busy && onCancel?.()}
      />
      <div className="km-confirm-panel">
        <h2 id="km-confirm-title" className="font-display text-xl font-semibold text-[#1a3d42]">
          {title}
        </h2>
        {message && <p className="mt-2 text-sm leading-relaxed text-[#1a3d42]/65">{message}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-md px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0d7377] hover:bg-[#0a5f63]'
            }`}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
