import { useState } from 'react';
import { Plus, Tag, Clock, Trash2, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TAG_COLORS = [
  { label: 'Dev',       bg: '#EEF2FF', color: '#3B5BFC' },
  { label: 'Design',    bg: '#F5F3FF', color: '#7C3AED' },
  { label: 'Personal',  bg: '#ECFDF5', color: '#12C479' },
  { label: 'React',     bg: '#FFF0F0', color: '#EF4444' },
  { label: 'Health',    bg: '#FFF7ED', color: '#F97316' },
  { label: 'Finance',   bg: '#F0FDF4', color: '#059669' },
  { label: 'Travel',    bg: '#E7F5FD', color: '#1DA1F2' },
  { label: 'Cooking',   bg: '#FEF9C3', color: '#CA8A04' },
];

const RANDOM_COLORS = [
  { color: '#3B5BFC', bg: '#EEF2FF' }, { color: '#7C3AED', bg: '#F5F3FF' },
  { color: '#12C479', bg: '#ECFDF5' }, { color: '#EF4444', bg: '#FFF0F0' },
  { color: '#F97316', bg: '#FFF7ED' }, { color: '#059669', bg: '#F0FDF4' },
  { color: '#1DA1F2', bg: '#E7F5FD' }, { color: '#CA8A04', bg: '#FEF9C3' },
  { color: '#EC4899', bg: '#FDF2F8' }, { color: '#06B6D4', bg: '#ECFEFF' },
  { color: '#8B5CF6', bg: '#F5F3FF' }, { color: '#D97706', bg: '#FFFBEB' },
];

function randomTagColor() {
  return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
}

export default function NotesPage({ deletedBy = null }) {
  const { addToTrash } = useApp();
  
  const [notes, setNotes]           = useState([]);
  const [selected, setSelected]     = useState(null);
  const [editing, setEditing]       = useState(false);
  const [draft, setDraft]           = useState(null);
  const [newTag, setNewTag]         = useState('');
  const visible = notes.filter(n => !n.archived);

  function selectNote(note) {
    if (editing) return;
    setSelected(note);
  }

  function newNote() {
    const n = { id: Date.now(), title: 'Untitled Note', tags: [], date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), body: '', archived: false };
    setNotes(prev => [n, ...prev]);
    setSelected(n);
    setDraft({ ...n });
    setEditing(true);
  }

  function startEdit() {
    setDraft({ ...selected });
    setEditing(true);
  }

  function saveNote() {
    setNotes(prev => prev.map(n => n.id === draft.id ? draft : n));
    setSelected(draft);
    setEditing(false);
    setDraft(null);
  }

  function cancelEdit() {
    if (!selected.title && selected.body === '') {
      setNotes(prev => prev.filter(n => n.id !== selected.id));
      setSelected(notes.find(n => n.id !== selected.id) || null);
    }
    setEditing(false);
    setDraft(null);
  }

  function archiveNote(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, archived: !n.archived } : n));
    if (selected?.id === id) setSelected(null);
  }

  function deleteNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) addToTrash({ ...note, _trashType: 'note', _deletedBy: deletedBy, _deletedAt: new Date() });
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function toggleDraftTag(tag) {
    setDraft(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }

  function addCustomTag() {
    const label = newTag.trim();
    if (!label) return;
    if (draft.tags.includes(label)) { setNewTag(''); return; }
    const { color, bg } = randomTagColor();
    setDraft(prev => ({
      ...prev,
      tags: [...prev.tags, label],
      tagColors: { ...(prev.tagColors || {}), [label]: { color, bg } },
    }));
    setNewTag('');
  }

  const tagStyle = (label, note) => {
    const custom = note?.tagColors?.[label] || draft?.tagColors?.[label];
    if (custom) return { background: custom.bg, color: custom.color };
    const t = TAG_COLORS.find(t => t.label === label) || { bg: '#F3F4F6', color: 'var(--text-secondary)' };
    return { background: t.bg, color: t.color };
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: 'var(--bg-main)', padding: '20px 24px', gap: 16 }}>

      {/* ── Left panel: note list ── */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* New note button */}
        <button onClick={newNote} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,91,252,0.3)' }}>
          <Plus size={15} strokeWidth={2.5} /> Create New Note
        </button>


        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No notes</div>
          )}
          {visible.map(note => (
            <div key={note.id} onClick={() => selectNote(note)} style={{
              padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
              background: selected?.id === note.id ? '#EEF2FF' : 'var(--bg-surface)',
              border: `1.5px solid ${selected?.id === note.id ? '#C7D4FF' : 'var(--border)'}`,
              transition: 'all 0.12s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5 }}>
                {note.tags.map(t => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, ...tagStyle(t, note) }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> {note.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: note detail / editor ── */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32 }}>📝</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Select a note or create a new one</div>
          </div>
        ) : editing ? (
          /* ── Edit mode ── */
          <>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              <input
                value={draft.title}
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                placeholder="Note title…"
                style={{ width: '100%', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', border: 'none', outline: 'none', background: 'transparent', marginBottom: 10 }}
              />
              {/* Tag picker */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Suggest tags already used across notes */}
                {[...new Map(
                  notes.flatMap(n => n.tags.map(t => [t, (n.tagColors?.[t] || TAG_COLORS.find(tc => tc.label === t) || { color: '#6B7280', bg: '#F3F4F6' })])),
                ).entries()].map(([label, s]) => (
                  <button key={label} onClick={() => toggleDraftTag(label)} style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                    border: `1.5px solid ${draft.tags.includes(label) ? s.color : 'transparent'}`,
                    background: draft.tags.includes(label) ? s.bg : 'var(--bg-subtle)',
                    color: draft.tags.includes(label) ? s.color : 'var(--text-muted)',
                  }}>{label}</button>
                ))}
                {/* New tag input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                    placeholder="New tag…"
                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: 80 }}
                  />
                  <button onClick={addCustomTag} style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#3B5BFC', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            </div>
            <textarea
              value={draft.body}
              onChange={e => setDraft(p => ({ ...p, body: e.target.value }))}
              placeholder="Write your note here…"
              style={{ flex: 1, padding: '20px 24px', fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={saveNote} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,91,252,0.3)' }}>
                Save
              </button>
              <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <X size={13} /> Cancel
              </button>
            </div>
          </>
        ) : (
          /* ── View mode ── */
          <>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{selected.title}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {selected.tags.map(t => (
                      <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, ...tagStyle(t, selected) }}>
                        <Tag size={9} style={{ display: 'inline', marginRight: 3 }} />{t}
                      </span>
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                      <Clock size={11} /> Last edited &nbsp;{selected.date}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={startEdit} style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteNote(selected.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #FED7D7', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              <pre style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selected.body || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No content yet.</span>}
              </pre>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
