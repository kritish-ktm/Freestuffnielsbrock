// src/components/Toast.js
import React, { useEffect, useState } from "react";

/**
 * Animated Toast Notification Component
 * Replaces alert("✅ ...") and alert("❌ ...") calls
 *
 * Usage:
 *   import Toast from "../components/Toast";
 *   import { useToast } from "../components/Toast";
 *
 *   const { toasts, showToast } = useToast();
 *
 *   // Show success:  showToast("Request approved!", "success")
 *   // Show error:    showToast("Failed to update.", "error")
 *   // Show warning:  showToast("Please wait...", "warning")
 *   // Show info:     showToast("Item saved.", "info")
 *
 *   // Render at bottom of your return:
 *   <Toast toasts={toasts} />
 */

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

// ─── Single Toast Item ───────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount → slide in
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(toast.id), 400);
    }, toast.duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  const config = {
    success: {
      bg: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.2)" />
          <path
            d="M7 12.5l3.5 3.5 6.5-7"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 20,
              strokeDashoffset: visible ? 0 : 20,
              transition: "stroke-dashoffset 0.5s ease 0.1s",
            }}
          />
        </svg>
      ),
    },
    error: {
      bg: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.2)" />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 12,
              strokeDashoffset: visible ? 0 : 12,
              transition: "stroke-dashoffset 0.4s ease 0.1s",
            }}
          />
        </svg>
      ),
    },
    warning: {
      bg: "linear-gradient(135deg, #e67e22 0%, #f39c12 100%)",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.2)" />
          <path d="M12 8v5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.2" fill="#fff" />
        </svg>
      ),
    },
    info: {
      bg: "linear-gradient(135deg, #00A9E0 0%, #667eea 100%)",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.2)" />
          <circle cx="12" cy="8.5" r="1.2" fill="#fff" />
          <path d="M12 11.5v5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
  };

  const { bg, icon } = config[toast.type] || config.success;

  return (
    <div
      onClick={handleClose}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "14px",
        background: bg,
        color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
        cursor: "pointer",
        minWidth: "280px",
        maxWidth: "420px",
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(120%) scale(0.92)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: visible ? "shimmer 1.8s ease 0.3s 1" : "none",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div style={{ flexShrink: 0 }}>{icon}</div>

      {/* Message */}
      <span style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>

      {/* Close ×  */}
      <span style={{ opacity: 0.7, fontSize: "1.1rem", marginLeft: "4px" }}>×</span>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: "rgba(255,255,255,0.5)",
          width: visible ? "0%" : "100%",
          transition: `width ${toast.duration}ms linear`,
          borderRadius: "0 0 14px 14px",
        }}
      />
    </div>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={t} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>
  );
}