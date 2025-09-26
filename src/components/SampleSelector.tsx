'use client';

import { useEffect, useState } from 'react';

interface SampleSelectorProps {
  onSampleSelect: (content: string, sampleName: string) => void;
  currentSample: string;
}

const SAMPLES = [
  { name: 'Welcome', file: 'intro.md' },
  { name: 'Features', file: 'features.md' },
  { name: 'Usage', file: 'usage.md' }
];

export const SampleSelector = ({ onSampleSelect, currentSample }: SampleSelectorProps) => {
  const [samples, setSamples] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        const samplePromises = SAMPLES.map(async (sample) => {
          const response = await fetch(`/samples/${sample.file}`);
          const content = await response.text();
          return { name: sample.name, content };
        });

        const loadedSamples = await Promise.all(samplePromises);
        const sampleMap = loadedSamples.reduce((acc, { name, content }) => {
          acc[name] = content;
          return acc;
        }, {} as { [key: string]: string });

        setSamples(sampleMap);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load samples:', error);
        setLoading(false);
      }
    };

    loadSamples();
  }, []);

  const handleSampleChange = (sampleName: string) => {
    if (!sampleName) {
      onSampleSelect('', '');
      return;
    }
    
    const content = samples[sampleName];
    if (content) {
      onSampleSelect(content, sampleName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 theme-text-secondary">
        <div className="w-4 h-4 border-2 theme-border border-t-blue-500 rounded-full animate-spin"></div>
        Loading samples...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sample-select" className="text-sm font-medium theme-text">
        Sample:
      </label>
      <select
        id="sample-select"
        value={currentSample}
        onChange={(e) => handleSampleChange(e.target.value)}
        className="px-3 py-2 theme-bg theme-text border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Custom Document</option>
        {SAMPLES.map((sample) => (
          <option key={sample.name} value={sample.name}>
            {sample.name}
          </option>
        ))}
      </select>
    </div>
  );
};
