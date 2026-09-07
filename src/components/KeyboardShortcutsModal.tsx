import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('open-shortcuts', handleOpen);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-shortcuts', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + N', description: 'Create New Document' },
    { key: 'Ctrl + S', description: 'Save Current Document' },
    { key: 'Ctrl + F', description: 'Search' },
    { key: 'Ctrl + /', description: 'Toggle Keyboard Shortcuts' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-theme-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-theme-border flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center gap-2 text-theme-text">
            <Keyboard className="w-5 h-5" />
            <h2 id="shortcuts-title" className="font-semibold text-lg tracking-tight">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-theme-muted hover:text-theme-text hover:bg-theme-border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-theme-border last:border-0">
              <span className="text-theme-muted text-sm font-medium">{s.description}</span>
              <kbd className="px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs font-mono text-theme-text shadow-sm whitespace-nowrap">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="p-4 bg-theme-bg border-t border-theme-border text-xs text-theme-muted text-center flex justify-between items-center">
          <span>Note: Use <kbd className="font-mono">Cmd</kbd> instead of <kbd className="font-mono">Ctrl</kbd> on macOS.</span>
        </div>
      </div>
    </div>
  );
}
