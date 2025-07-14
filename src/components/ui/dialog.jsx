'use client';

import * as React from 'react';

// Simple Dialog context for open/close state
const DialogContext = React.createContext();

export function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = (val) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  return (
    <DialogContext.Provider value={{ open: actualOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }) {
  const { setOpen } = React.useContext(DialogContext);
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e);
      setOpen(true);
    },
  });
}

export function DialogContent({ children, className = '' }) {
  const { open, setOpen } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setOpen(false)}
      />
      {/* Modal content */}
      <div
        className={`relative z-10 bg-white/80 backdrop-blur-2xl border border-blue-100 shadow-2xl max-w-2xl w-full mx-4 p-8 rounded-3xl animate-fade-in-up ${className}`}
        role="dialog"
        aria-modal="true"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 60%, rgba(219,234,254,0.85) 100%)',
          boxShadow: '0 8px 40px 0 rgba(30,64,175,0.10)',
        }}
      >
        {children}
        <button
          className="absolute top-5 right-5 text-gray-400 hover:text-blue-700 text-2xl font-bold focus:outline-none"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="text-2xl font-bold mb-2 text-blue-900 tracking-tight">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <div className="text-gray-700 mb-4 text-base leading-relaxed">{children}</div>;
}

export function DialogClose({ children }) {
  const { setOpen } = React.useContext(DialogContext);
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e);
      setOpen(false);
    },
  });
} 