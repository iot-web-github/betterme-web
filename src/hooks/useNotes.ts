import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface NoteEntry {
  id: string;
  timestamp: string;
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  entries: NoteEntry[];
  tags: string[];
  folder?: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setIsLoading(true);
      
      // Fetch notes with their entries
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setIsLoading(false);
        return;
      }

      // Fetch all note entries for the user's notes
      const noteIds = notesData?.map(n => n.id) || [];
      let entriesData: any[] = [];
      
      if (noteIds.length > 0) {
        const { data, error } = await supabase
          .from('note_entries')
          .select('*')
          .in('note_id', noteIds)
          .order('created_at', { ascending: true });
        
        if (!error) {
          entriesData = data || [];
        }
      }

      // Combine notes with their entries
      const notesWithEntries = notesData?.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content || '',
        entries: entriesData
          .filter(e => e.note_id === n.id)
          .map(e => ({
            id: e.id,
            timestamp: e.created_at,
            content: e.content,
          })),
        tags: n.tags || [],
        folder: n.folder || undefined,
        color: n.color || 'hsl(262 83% 58%)',
        isPinned: n.is_pinned || false,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })) || [];
      
      setNotes(notesWithEntries);
      setIsLoading(false);
    };

    fetchNotes();
  }, [user]);

  const addNote = useCallback(async (data: {
    title: string;
    content?: string;
    tags?: string[];
    folder?: string;
    color?: string;
  }): Promise<Note | null> => {
    if (!user) return null;

    const { data: newNote, error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      folder: data.folder || null,
      color: data.color || 'hsl(262 83% 58%)',
      is_pinned: false,
    }).select().single();

    if (error || !newNote) {
      console.error('Error adding note:', error);
      return null;
    }

    const note: Note = {
      id: newNote.id,
      title: newNote.title,
      content: newNote.content || '',
      entries: [],
      tags: newNote.tags || [],
      folder: newNote.folder || undefined,
      color: newNote.color || 'hsl(262 83% 58%)',
      isPinned: newNote.is_pinned || false,
      createdAt: newNote.created_at,
      updatedAt: newNote.updated_at,
    };

    setNotes(prev => [note, ...prev]);
    return note;
  }, [user]);

  const updateNote = useCallback(async (noteId: string, data: Partial<Note>) => {
    if (!user) return;

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.folder !== undefined) updateData.folder = data.folder;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isPinned !== undefined) updateData.is_pinned = data.isPinned;

    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note:', error);
      return;
    }

    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { ...n, ...data, updatedAt: new Date().toISOString() }
        : n
    ));
  }, [user]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) return;

    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    
    if (error) {
      console.error('Error deleting note:', error);
      return;
    }

    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, [user]);

  const togglePin = useCallback(async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    await updateNote(noteId, { isPinned: !note.isPinned });
  }, [notes, updateNote]);

  const addEntry = useCallback(async (noteId: string, content: string): Promise<NoteEntry | null> => {
    if (!user) return null;

    const { data: newEntry, error } = await supabase.from('note_entries').insert({
      note_id: noteId,
      content,
    }).select().single();

    if (error || !newEntry) {
      console.error('Error adding note entry:', error);
      return null;
    }

    const entry: NoteEntry = {
      id: newEntry.id,
      timestamp: newEntry.created_at,
      content: newEntry.content,
    };

    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { 
            ...n, 
            entries: [...n.entries, entry],
            updatedAt: new Date().toISOString() 
          }
        : n
    ));

    return entry;
  }, [user]);

  const deleteEntry = useCallback(async (noteId: string, entryId: string) => {
    if (!user) return;

    const { error } = await supabase.from('note_entries').delete().eq('id', entryId);
    
    if (error) {
      console.error('Error deleting note entry:', error);
      return;
    }

    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { 
            ...n, 
            entries: n.entries.filter(e => e.id !== entryId),
            updatedAt: new Date().toISOString() 
          }
        : n
    ));
  }, [user]);

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
    searchNotes,
    getNotesByFolder,
    getNotesByTag,
    getAllTags,
    getAllFolders,
  };
};
