import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options = [], className = '', placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value) || null;

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="w-full text-left rounded-lg px-3 py-2 flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="truncate text-sm">{selected ? selected.label : placeholder}</span>
        <svg className="w-4 h-4 text-gray-500 ml-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 max-h-48 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${opt.value === value ? 'font-semibold' : ''}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
