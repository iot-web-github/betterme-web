import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNotes, Note, NoteEntry } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Tag,
  Clock,
  X,
} from 'lucide-react';

const NOTE_COLORS = [
  'hsl(262 83% 58%)',
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(340 82% 52%)',
  'hsl(0 84% 60%)',
];

export const NotesTool = () => {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    addEntry,
    deleteEntry,
    searchNotes,
    getAllTags,
  } = useNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [newTag, setNewTag] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const filteredNotes = filterTag 
    ? notes.filter(n => n.tags.includes(filterTag))
    : searchQuery 
      ? searchNotes(searchQuery) 
      : notes;

  const allTags = getAllTags();

  const handleCreateNote = async () => {
    if (newNoteTitle.trim()) {
      const note = await addNote({
        title: newNoteTitle.trim(),
        content: newNoteContent,
        color: selectedColor,
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNote(false);
      if (note) {
        setSelectedNote(note);
      }
    }
  };

  const handleAddTag = async () => {
    if (selectedNote && newTag.trim()) {
      const updatedTags = [...selectedNote.tags, newTag.trim()];
      await updateNote(selectedNote.id, { tags: updatedTags });
      setSelectedNote({ ...selectedNote, tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (selectedNote) {
      const updatedTags = selectedNote.tags.filter(t => t !== tag);
      await updateNote(selectedNote.id, { tags: updatedTags });
      setSelectedNote({ ...selectedNote, tags: updatedTags });
    }
  };

  const handleAddEntry = async () => {
    if (selectedNote && newEntryContent.trim()) {
      const entry = await addEntry(selectedNote.id, newEntryContent.trim());
      if (entry) {
        setSelectedNote({
          ...selectedNote,
          entries: [...selectedNote.entries, entry],
        });
      }
      setNewEntryContent('');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (selectedNote) {
      await deleteEntry(selectedNote.id, entryId);
      setSelectedNote({
        ...selectedNote,
        entries: selectedNote.entries.filter(e => e.id !== entryId),
      });
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Notes</h2>
        </div>
        <Button onClick={() => setShowNewNote(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {allTags.slice(0, 5).map(tag => (
              <Badge
                key={tag}
                variant={filterTag === tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleSelectNote(note)}
              className="glass rounded-xl p-4 cursor-pointer hover:bg-secondary/50 transition-all group"
              style={{ borderLeftColor: note.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground line-clamp-1">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {note.isPinned ? (
                    <PinOff className="w-4 h-4 text-primary" />
                  ) : (
                    <Pin className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              
              {note.content && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {note.content}
                </p>
              )}

              {note.entries.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  {note.entries.length} entr{note.entries.length === 1 ? 'y' : 'ies'}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {note.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.updatedAt), 'MMM d')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No notes found' : 'No notes yet. Create your first one!'}
            </p>
          </div>
        )}
      </div>

      {/* New Note Dialog */}
      <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Note title..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note... (optional)"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={4}
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Color</p>
              <div className="flex gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      selectedColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleCreateNote} className="w-full" disabled={!newNoteTitle.trim()}>
              Create Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {selectedNote && (
            <>
              <DialogHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedNote.color }}
                    />
                    {selectedNote.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(selectedNote.id)}
                    >
                      {selectedNote.isPinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteNote(selectedNote.id);
                        setSelectedNote(null);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 mt-4">
                <div className="space-y-6 pr-4">
                  {/* Content */}
                  <div>
                    <Textarea
                      placeholder="Add note content..."
                      value={selectedNote.content}
                      onChange={(e) => {
                        updateNote(selectedNote.id, { content: e.target.value });
                        setSelectedNote({ ...selectedNote, content: e.target.value });
                      }}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedNote.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1"
                      />
                      <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Time-stamped Entries */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Entries
                    </p>
                    <div className="space-y-2 mb-3">
                      {selectedNote.entries.map(entry => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 group"
                        >
                          <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                            {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                          </span>
                          <p className="text-sm text-foreground flex-1">{entry.content}</p>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add entry..."
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddEntry()}
                        className="flex-1"
                      />
                      <Button onClick={handleAddEntry} size="sm" disabled={!newEntryContent.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex-shrink-0 pt-4 mt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Created {format(new Date(selectedNote.createdAt), 'PPP')} · 
                  Updated {format(new Date(selectedNote.updatedAt), 'PPP')}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
