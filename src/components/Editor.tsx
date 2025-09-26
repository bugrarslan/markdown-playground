'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
}

export const Editor = ({ value, onChange, onSave }: EditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          onSave?.();
          break;
        case '1':
        case '2':
        case '3':
          // These will be handled by the parent component
          break;
      }
    }
  }, [onSave]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 theme-bg flex flex-col'
    : 'flex flex-col h-full';

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between p-3 theme-bg-secondary border-b theme-border">
        <h2 className="text-lg font-semibold theme-text">
          Markdown Editor
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-sm theme-text-secondary">
            Ctrl/⌘ + S to save
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-sm theme-button theme-button-text rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="flex-1 w-full p-4 border-none outline-none resize-none theme-bg theme-text font-mono text-sm leading-relaxed focus:ring-0"
        placeholder="Start typing your Markdown here..."
        spellCheck={false}
        style={{
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
};
