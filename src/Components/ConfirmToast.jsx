import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

/**
 * ConfirmDialog - presentational + accessible dialog
 * props:
 * - message: string
 * - onConfirm: () => void
 * - onCancel: () => void
 * - confirmText, cancelText (optional)
 */
function ConfirmDialog({ message,useCancelButton = true, onConfirm, onCancel, confirmText = "Ya", cancelText = "Batal" }) {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    // fokus ke tombol konfirmasi saat muncul
    confirmBtnRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };

    document.addEventListener("keydown", handleKey);
    // disable scroll di belakang
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onConfirm, onCancel]);

  // klik overlay -> batal
  const onOverlayClick = (e) => {
    if (e.target === modalRef.current) onCancel();
  };

  return (
    <div
      ref={modalRef}
      className="confirm-portal-overlay"
      onMouseDown={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm dialog"
    >
      <div className="confirm-portal-card" role="document">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            ref={confirmBtnRef}
            className="btn-confirm"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
          {useCancelButton && 
          <button className="btn-cancel" onClick={onCancel} type="button">
            {cancelText}
          </button>
          }

        </div>
      </div>

    </div>
  );
}

/**
 * showConfirm - programmatic API that returns Promise<boolean>
 * usage:
 *  showConfirm("Apakah yakin?").then(ok => { if(ok) doSomething() })
 */
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = () => {
      // unmount and remove dom
      root.unmount();
      if (container.parentNode) container.parentNode.removeChild(container);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    root.render(
      <ConfirmDialog
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        useCancelButton={options.useCancelButton}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
      />
    );
  });
}

export default ConfirmDialog;
