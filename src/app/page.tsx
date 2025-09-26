'use client';

import { useCallback, useEffect, useState } from 'react';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { ThemeToggle } from '../components/ThemeToggle';
import { FullscreenToggle } from '../components/FullscreenToggle';
import { SampleSelector } from '../components/SampleSelector';
import { useMarkdownParser } from '../hooks/useMarkdownParser';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useDebounce } from '../hooks/useDebounce';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [currentSample, setCurrentSample] = useState('');
  const [isCustomDocument, setIsCustomDocument] = useState(false);

  const { parseMarkdown, isLoading: parserLoading, error: parserError } = useMarkdownParser();
  const { saveDocument, getLastDocument, isLoading: dbLoading } = useIndexedDB();
  const debouncedMarkdown = useDebounce(markdown, 300);

  // Load last document or default sample on mount
  useEffect(() => {
    const loadInitialDocument = async () => {
      if (dbLoading) return;

      try {
        const lastDoc = await getLastDocument();
        if (lastDoc) {
          // User has custom data in DB - load it
          setMarkdown(lastDoc);
          setCurrentSample('Custom Document');
          setIsCustomDocument(true);
        } else {
          // No data in DB - load intro sample
          const res = await fetch('/samples/intro.md');
          const content = await res.text();
          setMarkdown(content);
          setCurrentSample('Welcome');
          setIsCustomDocument(false);
        }
      } catch (err) {
        console.error('Failed to load document:', err);
        setMarkdown('# Welcome\n\nStart typing your Markdown here...');
        setCurrentSample('Welcome');
        setIsCustomDocument(false);
      }
    };

    loadInitialDocument();
  }, [dbLoading, getLastDocument]);

  // Convert Markdown → HTML whenever markdown changes
  useEffect(() => {
    const renderMarkdown = async () => {
      if (!debouncedMarkdown || parserLoading) return;

      try {
        const parsedHtml = await parseMarkdown(debouncedMarkdown);
        setHtml(parsedHtml);
      } catch (err) {
        console.error('Markdown parsing error:', err);
        setHtml(`<p style="color:red">Error parsing Markdown: ${(err as Error).message}</p>`);
      }
    };

    renderMarkdown();
  }, [debouncedMarkdown, parseMarkdown, parserLoading]);

  // Auto-save markdown only if it's a custom document
  useEffect(() => {
    const autoSave = async () => {
      if (!markdown || dbLoading || !isCustomDocument) return;
      try {
        await saveDocument(markdown);
      } catch (err) {
        console.error('Failed to save document:', err);
      }
    };

    autoSave();
  }, [markdown, saveDocument, dbLoading, isCustomDocument]);

  // Handle sample selection
  const handleSampleSelect = useCallback(async (content: string, sampleName: string) => {
    if (!content) {
      setCurrentSample('');
      setIsCustomDocument(false);
      return;
    }
    // When user selects a sample, load it but don't save to DB yet
    setMarkdown(content);
    setCurrentSample(sampleName);
    setIsCustomDocument(false); // Reset to sample mode
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await saveDocument(markdown);
      if (!isCustomDocument) {
        setIsCustomDocument(true);
        setCurrentSample('Custom Document');
      }
      console.log('Document saved successfully');
    } catch (err) {
      console.error('Failed to save document:', err);
    }
  }, [markdown, saveDocument, isCustomDocument]);

  // Handle markdown changes - switch to custom document when user edits
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
    
    // If user is editing a sample (not already a custom document), switch to custom mode
    if (!isCustomDocument && currentSample && currentSample !== 'Custom Document') {
      setIsCustomDocument(true);
      setCurrentSample('Custom Document');
    }
  }, [isCustomDocument, currentSample]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            fetch('/samples/intro.md')
              .then(res => res.text())
              .then(content => handleSampleSelect(content, 'Welcome'))
              .catch(console.error);
            break;
          case '2':
            e.preventDefault();
            fetch('/samples/features.md')
              .then(res => res.text())
              .then(content => handleSampleSelect(content, 'Features'))
              .catch(console.error);
            break;
          case '3':
            e.preventDefault();
            fetch('/samples/usage.md')
              .then(res => res.text())
              .then(content => handleSampleSelect(content, 'Usage'))
              .catch(console.error);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSampleSelect]);

  if (parserError) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-bg">
        <div className="text-center text-red-600 dark:text-red-400">
          <h1 className="mb-2 text-2xl font-bold">Error Loading Parser</h1>
          <p>{parserError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen theme-bg">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b shadow-sm theme-bg theme-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold theme-text">Markdown Playground</h1>
          <SampleSelector onSampleSelect={handleSampleSelect} currentSample={currentSample} />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-sm theme-text-secondary sm:block">
            ⌘/Ctrl + 1/2/3 for samples • F11 for fullscreen
          </div>
          <FullscreenToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
        <div className="flex-1 border-r theme-border h-1/2 md:h-full">
          <Editor value={markdown} onChange={handleMarkdownChange} onSave={handleSave} />
        </div>
        <div className="flex-1 h-1/2 md:h-full theme-bg theme-text">
          <Preview html={html} isLoading={parserLoading} />
        </div>
      </div>
    </div>
  );
}
