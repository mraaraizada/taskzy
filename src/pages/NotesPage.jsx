import { useState, useRef, useEffect } from 'react';
import { notify } from '../lib/notify';
import { Plus, Tag, Clock, Trash2, X, StickyNote, Sheet, ChevronDown, UserPlus, User, Search, Check } from 'lucide-react';
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

// ── Inline sheet viewer ──────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function loadStyle(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

function SheetViewer({ sheetItem }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadStyle('/xspreadsheet.css');
    loadScript('/xspreadsheet.js').then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    instanceRef.current = null;
    const xs = window.x_spreadsheet;
    if (!xs) return;
    instanceRef.current = xs(containerRef.current, {
      mode: 'edit', showToolbar: true, showGrid: true, showContextmenu: true,
      view: {
        height: () => containerRef.current?.clientHeight || 500,
        width: () => containerRef.current?.clientWidth || 700,
      },
      row: { len: 100, height: 25 },
      col: { len: 26, width: 100, indexWidth: 60, minWidth: 60 },
      style: { bgcolor: '#ffffff', align: 'left', valign: 'middle', textwrap: false, strike: false, underline: false, color: '#0a0a0a', font: { name: 'Inter', size: 10, bold: false, italic: false } },
    });
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
      instanceRef.current = null;
    };
  }, [ready, sheetItem.id]);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid #EEF2FF', borderTopColor: '#3B5BFC', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}
    </div>
  );
}

const INITIAL_NOTES = [
  {
    id: 1, title: 'React Performance Optimization', archived: false,
    tags: ['Dev', 'React'],
    date: '29 Oct 2024',
    body: `Key performance optimization techniques:\n\n1. Code Splitting\n - Use React.lazy() for route-based splitting\n - Implement dynamic imports for heavy components\n\n2. Memoization\n - useMemo for expensive calculations\n - useCallback for function props\n - React.memo for component optimization\n\n3. Virtual List Implementation\n - Use react-window for long lists\n - Implement infinite scrolling\n\nTODO: Benchmark current application and identify bottlenecks`,
  },
  {
    id: 2, title: 'Japan Travel Planning', archived: false,
    tags: ['Travel', 'Personal'],
    date: '28 Oct 2024',
    body: `Trip highlights to research:\n\n- Tokyo: Shibuya crossing, Senso-ji, TeamLab\n- Kyoto: Fushimi Inari, Arashiyama bamboo grove\n- Osaka: Dotonbori, Namba food street\n\nBudget estimate: ~₹ 3,000 for 2 weeks\nBest time: March (cherry blossom) or Nov (autumn leaves)`,
  },
  {
    id: 3, title: 'Favorite Pasta Recipes', archived: false,
    tags: ['Cooking'],
    date: '27 Oct 2024',
    body: `Cacio e Pepe\n - Spaghetti, pecorino romano, black pepper\n - Key: emulsify cheese with pasta water\n\nCarbonara\n - Guanciale, egg yolks, pecorino, black pepper\n - Never add cream!\n\nAmatriciana\n - Guanciale, San Marzano tomatoes, pecorino\n - Add a pinch of chili flakes`,
  },
  {
    id: 4, title: 'Weekly Workout Plan', archived: false,
    tags: ['Dev', 'React'],
    date: '26 Oct 2024',
    body: `Monday: Push (chest, shoulders, triceps)\nTuesday: Pull (back, biceps)\nWednesday: Legs + core\nThursday: Rest or light cardio\nFriday: Push\nSaturday: Pull\nSunday: Active recovery\n\nGoal: 4 strength sessions/week minimum`,
  },
  {
    id: 5, title: 'Meal Prep Ideas', archived: false,
    tags: ['Cooking', 'Health'],
    date: '25 Oct 2024',
    body: `Sunday prep list:\n- Overnight oats (5 jars)\n- Grilled chicken thighs (1kg)\n- Roasted veggies: sweet potato, broccoli, peppers\n- Brown rice (large batch)\n- Hard-boiled eggs\n\nKeep sauces separate to avoid sogginess`,
  },
  {
    id: 6, title: 'Reading List', archived: false,
    tags: ['Personal', 'Dev'],
    date: '24 Oct 2024',
    body: `Currently reading:\n- "Atomic Habits" - James Clear\n\nUp next:\n- "The Pragmatic Programmer"\n- "Deep Work" - Cal Newport\n- "Clean Architecture" - Robert Martin\n- "Designing Data-Intensive Applications"\n\nFinished:\n- "You Don't Know JS" series ✓`,
  },
  {
    id: 7, title: 'Fitness Goals 2025', archived: false,
    tags: ['Health', 'Personal'],
    date: '22 Sep 2024',
    body: `Q1 Goals:\n- Deadlift 2x bodyweight\n- Run 5km under 25 minutes\n- Do 15 pull-ups in a row\n\nQ2 Goals:\n- Complete a sprint triathlon\n- Hit 10% body fat\n\nTracking: log every workout in the app`,
  },
];

export default function NotesPage({ deletedBy = null, currentUser = null, onNavigateToTask = null }) {
  const { addToTrash, team, notes: globalNotes, updateNote: updateGlobalNote, deleteNote: deleteGlobalNote, currentUser: contextUser } = useApp();
  const activeUser = currentUser || contextUser;
  const isAdmin = activeUser?.userRole === 'admin' || activeUser?.role === 'Administrator' || !activeUser;
  const isManagement = activeUser?.userRole === 'management' || activeUser?.role?.includes('Management') || activeUser?.role?.includes('Manager');

  const [localNotes, setLocalNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(null);
  const [newTag, setNewTag]     = useState('');
  const [sheetEditingTitle, setSheetEditingTitle] = useState(false);
  const [sheetDraftTitle, setSheetDraftTitle] = useState('');
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [joinCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const createMenuRef = useRef(null);

  // Filter global (task-linked) scribes by access:
  // admin/management see all; members only see scribes assigned to them
  const visibleGlobalNotes = (globalNotes || []).filter(n => {
    if (isAdmin || isManagement) return true;
    if (!activeUser?.id) return false;
    if (n.assignMode === 'all') return true;
    return n.assignees?.includes(String(activeUser.id));
  });

  // Merge: task scribes first, then local notes
  const notes = [...visibleGlobalNotes, ...localNotes];
  const visible = notes.filter(n => !n.archived);

  // For task-linked scribes: only admin/management can edit title, tags, delete
  const canEditScribe = (note) => {
    if (!note?.taskId) return true; // not task-linked — anyone can edit
    return isAdmin || isManagement;
  };

  // Helper: is this note a global (task-linked) scribe?
  const isGlobal = (note) => (globalNotes || []).some(n => n.id === note.id);

  const setNotes = (updater) => {
    setLocalNotes(updater);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectNote(note) {
    if (editing) return;
    setSelected(note);
  }

  function newNote() {
    const n = { id: Date.now(), type: 'note', title: 'Untitled Note', tags: [], date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), body: '', archived: false, joinCode: Math.random().toString(36).slice(2, 8).toUpperCase() };
    setNotes(prev => [n, ...prev]);
    setSelected(n);
    setDraft({ ...n });
    setEditing(true);
    setShowCreateMenu(false);
  }

  function newSheet() {
    const n = { id: Date.now(), type: 'sheet', title: 'Untitled Sheet', tags: [], date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), archived: false, joinCode: Math.random().toString(36).slice(2, 8).toUpperCase() };
    setNotes(prev => [n, ...prev]);
    setSelected(n);
    setEditing(false);
    setShowCreateMenu(false);
  }

  function startEdit() {
    setDraft({ ...selected });
    setEditing(true);
  }

  function saveNote() {
    if (isGlobal(draft)) {
      updateGlobalNote(draft.id, draft);
    } else {
      setLocalNotes(prev => prev.map(n => n.id === draft.id ? draft : n));
    }
    setSelected(draft);
    setEditing(false);
    setDraft(null);
    notify.noteSaved(draft.title || 'Untitled Note');
  }

  function cancelEdit() {
    if (!selected.title && selected.body === '') {
      if (isGlobal(selected)) {
        deleteGlobalNote(selected.id);
      } else {
        setLocalNotes(prev => prev.filter(n => n.id !== selected.id));
      }
      setSelected(notes.find(n => n.id !== selected.id) || null);
    }
    setEditing(false);
    setDraft(null);
  }

  function archiveNote(id) {
    const note = notes.find(n => n.id === id);
    if (isGlobal(note)) {
      updateGlobalNote(id, { archived: !note.archived });
    } else {
      setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, archived: !n.archived } : n));
    }
    if (selected?.id === id) setSelected(null);
  }

  function deleteNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      addToTrash({ ...note, _trashType: 'note', _deletedBy: deletedBy, _deletedAt: new Date() });
      notify.noteDeleted(note.title);
    }
    if (isGlobal(note)) {
      deleteGlobalNote(id);
    } else {
      setLocalNotes(prev => prev.filter(n => n.id !== id));
    }
    if (selected?.id === id) setSelected(null);
  }

  function toggleMember(memberId) {
    const current = selected?.members || [];
    const updated = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId];
    const updatedNote = { ...selected, members: updated };
    if (isGlobal(selected)) {
      updateGlobalNote(selected.id, { members: updated });
    } else {
      setLocalNotes(prev => prev.map(n => n.id === selected.id ? updatedNote : n));
    }
    setSelected(updatedNote);
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

        {/* Join button */}
        {!showJoin ? (
          <button
            onClick={() => { setShowJoin(true); setJoinInput(''); setJoinError(''); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, border: '1.5px solid #C7D4FF', background: '#EEF2FF', color: '#3B5BFC', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E0E7FF'; e.currentTarget.style.borderColor = '#3B5BFC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#C7D4FF'; }}
          >
            <Plus size={13} color="#3B5BFC" strokeWidth={2.5} />
            Join with Code
          </button>
        ) : (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1.5px solid #C7D4FF', padding: '14px', boxShadow: '0 4px 16px rgba(59,91,252,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={13} color="#3B5BFC" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Join with Code</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Enter the invite code</div>
              </div>
              <button onClick={() => { setShowJoin(false); setJoinInput(''); setJoinError(''); }} style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={12} color="#9CA3AF" />
              </button>
            </div>
            <input
              autoFocus
              value={joinInput}
              onChange={e => { setJoinInput(e.target.value.toUpperCase()); setJoinError(''); }}
              placeholder="e.g. AB12CD"
              maxLength={8}
              style={{ width: '100%', height: 40, borderRadius: 10, border: `1.5px solid ${joinError ? '#FCA5A5' : '#C7D4FF'}`, padding: '0 14px', fontSize: 16, fontWeight: 800, letterSpacing: '4px', color: '#3B5BFC', outline: 'none', background: '#F5F8FF', fontFamily: 'monospace', boxSizing: 'border-box', textAlign: 'center', marginBottom: 8 }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'}
              onBlur={e => e.target.style.borderColor = joinError ? '#FCA5A5' : '#C7D4FF'}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const match = notes.find(n => n.joinCode === joinInput.trim());
                  if (match) { setSelected(match); setShowJoin(false); setJoinInput(''); }
                  else setJoinError('Invalid code');
                }
                if (e.key === 'Escape') { setShowJoin(false); setJoinInput(''); }
              }}
            />
            {joinError && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 8, fontWeight: 600, textAlign: 'center' }}>⚠ {joinError}</div>}
            <button
              onClick={() => {
                const match = notes.find(n => n.joinCode === joinInput.trim());
                if (match) { setSelected(match); setShowJoin(false); setJoinInput(''); }
                else setJoinError('Invalid code');
              }}
              disabled={!joinInput.trim()}
              style={{ width: '100%', height: 36, borderRadius: 10, border: 'none', background: joinInput.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : '#E5E7EB', color: joinInput.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 700, cursor: joinInput.trim() ? 'pointer' : 'not-allowed', boxShadow: joinInput.trim() ? '0 4px 12px rgba(59,91,252,0.3)' : 'none', transition: 'all 0.15s' }}
            >Join</button>
          </div>
        )}

        {/* Create button with dropdown */}
        <div style={{ position: 'relative' }} ref={createMenuRef}>
          <button
            onClick={() => setShowCreateMenu(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,91,252,0.3)', width: '100%', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={15} strokeWidth={2.5} /> Create New</span>
            <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: showCreateMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {showCreateMenu && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', borderRadius: 12, border: '1.5px solid #E8EAEF', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
              <button
                onClick={newNote}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1A1D2E', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StickyNote size={14} color="#7C3AED" />
                </div>
                Note
              </button>
              <div style={{ height: 1, background: '#F0F2F8', margin: '0 10px' }} />
              <button
                onClick={newSheet}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1A1D2E', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sheet size={14} color="#12C479" />
                </div>
                Sheet
              </button>
            </div>
          )}
        </div>


        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visible.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 16px', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StickyNote size={22} color="#7C3AED" strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Your Scribe is empty</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Great ideas start here — write a note or build a sheet!</div>
            </div>
          )}
          {visible.map(note => {
            const hasMembers = (note.members || []).length > 0;
            const isTaskScribe = !!note.taskId;
            return (
            <div key={note.id} onClick={() => selectNote(note)} style={{
              padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
              background: selected?.id === note.id ? '#EEF2FF' : 'var(--bg-surface)',
              border: `1.5px solid ${selected?.id === note.id ? '#C7D4FF' : isTaskScribe ? '#7C3AED40' : hasMembers ? '#3B5BFC' : 'var(--border)'}`,
              boxShadow: hasMembers && selected?.id !== note.id ? '0 0 0 1px #3B5BFC22' : 'none',
              transition: 'all 0.12s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                {note.type === 'sheet'
                  ? <Sheet size={12} color="#12C479" strokeWidth={2} />
                  : <StickyNote size={12} color="#7C3AED" strokeWidth={2} />
                }
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{note.title}</div>
              </div>
              {isTaskScribe && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    📎 {note.taskTitle || note.taskId}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5 }}>
                {(note.tags || []).map(t => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, ...tagStyle(t, note) }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {note.date}
                </span>
                {(note.members || []).length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: selected?.id === note.id ? '#fff' : 'var(--bg-subtle)', borderRadius: 20, padding: '2px 7px', border: '1px solid var(--border)' }}>
                    <User size={9} color="#6B7280" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{(note.members || []).length}</span>
                  </span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: note detail / editor ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, transition: 'margin-right 0.3s cubic-bezier(0.22,1,0.36,1)', marginRight: showMemberPanel ? 300 : 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }}>
              <StickyNote size={34} color="#7C3AED" strokeWidth={1.6} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Ready when you are</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 260 }}>Select something from the list or hit Create New to spark something great</div>
            </div>
            <button onClick={newNote} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,91,252,0.3)' }}>
              <Plus size={15} /> Create New Note
            </button>
          </div>
        ) : selected.type === 'sheet' ? (
          /* ── Sheet mode ── */
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Single line: icon + title + tags + date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Sheet size={13} color="#12C479" />
                    </div>
                    {selected.taskId && (
                      <button
                        type="button"
                        onClick={() => onNavigateToTask && onNavigateToTask(selected.taskId)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 6px', background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 20, cursor: onNavigateToTask ? 'pointer' : 'default', fontSize: 11, fontWeight: 700, color: '#7C3AED', flexShrink: 0 }}
                        onMouseEnter={e => { if (onNavigateToTask) e.currentTarget.style.background = '#EDE9FE'; }}
                        onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}
                      >
                        <span style={{ fontFamily: 'monospace', background: '#7C3AED', color: '#fff', borderRadius: 5, padding: '1px 5px', fontSize: 10 }}>{selected.taskId}</span>
                        {selected.taskTitle}
                      </button>
                    )}
                    {sheetEditingTitle ? (
                      <input
                        autoFocus
                        value={sheetDraftTitle}
                        onChange={e => setSheetDraftTitle(e.target.value)}
                        onBlur={() => {
                          const updated = { ...selected, title: sheetDraftTitle || selected.title };
                          setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));
                          setSelected(updated);
                          setSheetEditingTitle(false);
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setSheetEditingTitle(false); }}
                        style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', border: 'none', borderBottom: '2px solid #3B5BFC', outline: 'none', background: 'transparent', minWidth: 60 }}
                      />
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginRight: 4 }}>{selected.title}</span>
                    )}
                    {/* Tags inline */}
                    {[...new Map(
                      notes.flatMap(n => n.tags.map(t => [t, (n.tagColors?.[t] || TAG_COLORS.find(tc => tc.label === t) || { color: '#6B7280', bg: '#F3F4F6' })])),
                    ).entries()].map(([label, s]) => (
                      <button key={label} type="button" onClick={() => {
                        const has = (selected.tags || []).includes(label);
                        const updated = { ...selected, tags: has ? selected.tags.filter(t => t !== label) : [...(selected.tags || []), label] };
                        setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));
                        setSelected(updated);
                      }} style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                        border: `1.5px solid ${(selected.tags || []).includes(label) ? s.color : 'transparent'}`,
                        background: (selected.tags || []).includes(label) ? s.bg : 'var(--bg-subtle)',
                        color: (selected.tags || []).includes(label) ? s.color : 'var(--text-muted)',
                      }}>{label}</button>
                    ))}
                    <input
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const label = newTag.trim();
                          if (!label) return;
                          const { color, bg } = randomTagColor();
                          const updated = { ...selected, tags: [...(selected.tags || []), label], tagColors: { ...(selected.tagColors || {}), [label]: { color, bg } } };
                          setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));
                          setSelected(updated);
                          setNewTag('');
                        }
                      }}
                      placeholder="New tag…"
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: 72 }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {selected.date}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {/* Add member — always for own notes; admin/management only for task-linked scribes */}
                  {(isAdmin || isManagement || !selected.taskId) && (
                  <button
                    title="Add member"
                    onClick={() => setShowMemberPanel(true)}
                    style={{ display: 'flex', alignItems: 'center', padding: '7px 8px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3B5BFC'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <User size={14} color="#6B7280" />
                    <Plus size={10} color="#3B5BFC" strokeWidth={3} style={{ marginLeft: -2, marginTop: -6 }} />
                  </button>
                  )}
                  <button
                    onClick={() => { setSheetDraftTitle(selected.title); setSheetEditingTitle(true); }}
                    style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >Edit</button>
                  {(!selected.taskId || isAdmin) && (
                  <button onClick={() => setConfirmDeleteId(selected.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #FED7D7', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                  )}
                </div>
              </div>
            </div>
            <SheetViewer sheetItem={selected} />
          </>
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
                  {selected.taskId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTask && onNavigateToTask(selected.taskId)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 8, padding: '3px 10px 3px 6px', background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 20, cursor: onNavigateToTask ? 'pointer' : 'default', fontSize: 11, fontWeight: 700, color: '#7C3AED' }}
                      onMouseEnter={e => { if (onNavigateToTask) e.currentTarget.style.background = '#EDE9FE'; }}
                      onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}
                    >
                      <span style={{ fontFamily: 'monospace', background: '#7C3AED', color: '#fff', borderRadius: 5, padding: '1px 5px', fontSize: 10 }}>{selected.taskId}</span>
                      {selected.taskTitle}
                    </button>
                  )}
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
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {/* Add member — always for own notes; admin/management only for task-linked scribes */}
                  {(isAdmin || isManagement || !selected.taskId) && (
                  <button
                    title="Add member"
                    onClick={() => setShowMemberPanel(true)}
                    style={{ display: 'flex', alignItems: 'center', padding: '7px 8px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3B5BFC'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <User size={14} color="#6B7280" />
                    <Plus size={10} color="#3B5BFC" strokeWidth={3} style={{ marginLeft: -2, marginTop: -6 }} />
                  </button>
                  )}
                  <button onClick={startEdit} style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  {(!selected.taskId || isAdmin) && (
                  <button onClick={() => setConfirmDeleteId(selected.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #FED7D7', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                  )}
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

        {/* ── Member panel — slides in from right ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: showMemberPanel ? 300 : 0,
          background: 'var(--bg-surface)',
          borderLeft: showMemberPanel ? '1.5px solid var(--border)' : 'none',
          borderRadius: '0 18px 18px 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)',
          zIndex: 10,
          boxShadow: showMemberPanel ? '-4px 0 20px rgba(0,0,0,0.06)' : 'none',
          height: '100%',
        }}>
          {showMemberPanel && (
            <>
              {/* Header */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Members</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{(selected?.members || []).length} joined</div>
                </div>
                <button onClick={() => { setShowMemberPanel(false); setMemberSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                  <X size={15} color="#9CA3AF" />
                </button>
              </div>

              {/* Join code */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Invite Code</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F5F7FF', borderRadius: 10, border: '1.5px solid #E0E7FF' }}>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#3B5BFC', letterSpacing: '3px', fontFamily: 'monospace' }}>{joinCode}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(joinCode)}
                    style={{ fontSize: 10, fontWeight: 700, color: '#3B5BFC', background: '#EEF2FF', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                  >Copy</button>
                </div>
              </div>

              {/* Search */}
              <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Search members…"
                    style={{ width: '100%', height: 36, borderRadius: 9, border: '1.5px solid var(--border)', padding: '0 12px 0 32px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Joined members */}
              {(selected?.members || []).length > 0 && (
                <div style={{ padding: '10px 18px 6px', flexShrink: 0, maxHeight: 180, overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Joined ({(selected?.members || []).length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {team.filter(m => (selected?.members || []).includes(m.id)).map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{m.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: '#12C479', fontWeight: 600 }}>{m.role}</div>
                        </div>
                        <button onClick={() => toggleMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                          <X size={13} color="#9CA3AF" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All members to select */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Select to Add</div>
                {(!memberSearch.trim() && !isAdmin && !isManagement) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 8 }}>
                    <Search size={20} color="#D1D5DB" strokeWidth={1.8} />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>Type a name to search</div>
                  </div>
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {team
                    .filter(m => !(selected?.members || []).includes(m.id))
                    .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.role.toLowerCase().includes(memberSearch.toLowerCase()))
                    .map(m => (
                      <div
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B5BFC'; e.currentTarget.style.background = '#F5F7FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{m.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{m.role}</div>
                        </div>
                        <Plus size={14} color="#3B5BFC" strokeWidth={2.5} />
                      </div>
                    ))}
                  {team
                    .filter(m => !(selected?.members || []).includes(m.id))
                    .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.role.toLowerCase().includes(memberSearch.toLowerCase()))
                    .length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No members found</div>
                  )}
                </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Confirm delete modal ── */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setConfirmDeleteId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'wsSetupIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Trash2 size={20} color="#EF4444" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1D2E', marginBottom: 6 }}>Delete this item?</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24, lineHeight: 1.5 }}>
              This will move it to trash. You can restore it from the Archive.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={() => { deleteNote(confirmDeleteId); setConfirmDeleteId(null); }}
                style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
