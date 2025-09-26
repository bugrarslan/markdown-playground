import { useCallback, useEffect, useState } from 'react';
import Dexie, { Table } from 'dexie';

interface Setting {
  key: string;
  value: unknown;
}

interface Document {
  id?: number;
  content: string;
}

class MarkdownPlaygroundDB extends Dexie {
  settings!: Table<Setting, string>;
  documents!: Table<Document, number>;

  constructor() {
    super('MarkdownPlayground');
    this.version(1).stores({
      settings: '&key, value',
      documents: '++id, content'
    });
  }
}

const db = new MarkdownPlaygroundDB();

export const useIndexedDB = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        console.log('🗄️ Initializing IndexedDB...');
        await db.open();
        console.log('IndexedDB opened successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('IndexedDB initialization error:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    try {
      await db.settings.put({ key, value });
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const getSetting = useCallback(async (key: string, defaultValue?: unknown) => {
    try {
      const result = await db.settings.get(key);
      return result ? result.value : defaultValue;
    } catch (err) {
      setError(err as Error);
      return defaultValue;
    }
  }, []);

  const saveDocument = useCallback(async (content: string) => {
    try {
      // Clear existing documents and save new one
      await db.documents.clear();
      await db.documents.add({ content });
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const getLastDocument = useCallback(async (): Promise<string | null> => {
    try {
      const documents = await db.documents.orderBy('id').reverse().limit(1).toArray();
      return documents.length > 0 ? documents[0].content : null;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    saveSetting,
    getSetting,
    saveDocument,
    getLastDocument
  };
};
