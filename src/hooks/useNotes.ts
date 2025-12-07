import { useState, useEffect, useCallback } from 'react';
import { Note, NoteEntry, NoteAttachment } from '@/types/tools';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'smart-schedule-notes';

const getStoredNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNotes(getStoredNotes());
    setIsLoading(false);
  }, []);

  const addNote = useCallback((data: {
    title: string;
    content?: string;
    tags?: string[];
    folder?: string;
    color?: string;
  }): Note => {
    const newNote: Note = {
      id: uuidv4(),
      title: data.title,
      content: data.content || '',
      entries: [],
      tags: data.tags || [],
      folder: data.folder,
      color: data.color || 'hsl(262 83% 58%)',
      isPinned: false,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => {
      const updated = [newNote, ...prev];
      saveNotes(updated);
      return updated;
    });

    return newNote;
  }, []);

  const updateNote = useCallback((noteId: string, data: Partial<Note>) => {
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? { ...n, ...data, updatedAt: new Date().toISOString() }
          : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== noteId);
      saveNotes(updated);
      return updated;
    });
  }, []);

  const togglePin = useCallback((noteId: string) => {
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
          : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  const addEntry = useCallback((noteId: string, content: string): NoteEntry => {
    const newEntry: NoteEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content,
    };

    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? { 
              ...n, 
              entries: [...n.entries, newEntry],
              updatedAt: new Date().toISOString() 
            }
          : n
      );
      saveNotes(updated);
      return updated;
    });

    return newEntry;
  }, []);

  const deleteEntry = useCallback((noteId: string, entryId: string) => {
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? { 
              ...n, 
              entries: n.entries.filter(e => e.id !== entryId),
              updatedAt: new Date().toISOString() 
            }
          : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  const addAttachment = useCallback((noteId: string, attachment: Omit<NoteAttachment, 'id'>): NoteAttachment => {
    const newAttachment: NoteAttachment = {
      ...attachment,
      id: uuidv4(),
    };

    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? { 
              ...n, 
              attachments: [...n.attachments, newAttachment],
              updatedAt: new Date().toISOString() 
            }
          : n
      );
      saveNotes(updated);
      return updated;
    });

    return newAttachment;
  }, []);

  const searchNotes = useCallback((query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const lowerQuery = query.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery) ||
      n.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      n.entries.some(e => e.content.toLowerCase().includes(lowerQuery))
    );
  }, [notes]);

  const getNotesByFolder = useCallback((folder?: string): Note[] => {
    if (!folder) return notes.filter(n => !n.folder);
    return notes.filter(n => n.folder === folder);
  }, [notes]);

  const getNotesByTag = useCallback((tag: string): Note[] => {
    return notes.filter(n => n.tags.includes(tag));
  }, [notes]);

  const getAllTags = useCallback((): string[] => {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes]);

  const getAllFolders = useCallback((): string[] => {
    const folderSet = new Set<string>();
    notes.forEach(n => {
      if (n.folder) folderSet.add(n.folder);
    });
    return Array.from(folderSet);
  }, [notes]);

  // Sort: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return {
    notes: sortedNotes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    addEntry,
    deleteEntry,
    addAttachment,
    searchNotes,
    getNotesByFolder,
    getNotesByTag,
    getAllTags,
    getAllFolders,
  };
};
