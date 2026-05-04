import { Search, X, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function MemberHeader({ member, searchAllTasks = false }) {
  const { tasks, isPlanActive } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const searchPool = searchAllTasks ? tasks : tasks.filter(t => t.members.some(m => m.id === member.id));
  const results = query.trim().length > 0
    ? searchPool.filter(t =>
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const showDrop = focused && query.trim().length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setFocused(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const STAGE_COLOR = {
    New: '#9CA3AF', 
    Start: '#3B5BFC', 
    Issue: '#EF4444', 
    'Review A': '#F97316', 
    'Review B': '#7C3AED', 
    Update: '#D97706', 
    Complete: '#12C479',
  };

  return (
    <div style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1.5px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0, position: 'relative', zIndex: 200,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>

      {/* Left: greeting + date */}
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          {greeting}, {member.name === 'Team A' ? 'Team A' : member.name.split(' ')[0]}! 👋
        </h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</p>
      </div>

      {/* Centre: glassmorphism brand capsule */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 18px 7px 10px',
        borderRadius: 999,
        background: 'rgba(59,91,252,0.07)',
        border: '1.5px solid rgba(59,91,252,0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 16px rgba(59,91,252,0.10), inset 0 1px 0 rgba(255,255,255,0.18)',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #3B5BFC 0%, #7C3AED 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59,91,252,0.35)',
          flexShrink: 0,
        }}>
          <Zap size={13} color="#fff" strokeWidth={2.5} fill="#fff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: 16, fontWeight: 800, letterSpacing: '-0.2px',
            background: 'linear-gradient(90deg, #3B5BFC, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Taskzy</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 1 }}>Workspace</span>
        </div>
      </div>

      {/* Right: search + dark toggle + username */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Task search */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: focused ? 'var(--bg-surface)' : 'var(--input-bg)',
            border: `1.5px solid ${focused ? '#3B5BFC' : 'var(--border)'}`,
            borderRadius: 11, padding: '0 12px', height: 38,
            width: focused ? 260 : 210,
            boxShadow: focused ? '0 0 0 3px rgba(59,91,252,0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}>
            <Search size={14} color={focused ? '#3B5BFC' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { if (!isPlanActive) return; setQuery(e.target.value); }}
              onFocus={() => { if (!isPlanActive) { inputRef.current?.blur(); return; } setFocused(true); }}
              placeholder="Search by ID or title…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: '100%' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={13} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {showDrop && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 320, background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)', borderRadius: 14,
              boxShadow: 'var(--shadow-md)', overflow: 'hidden',
              animation: 'fadeSlideIn 0.18s ease forwards', zIndex: 300,
            }}>
              {results.length === 0 ? (
                <div style={{ padding: '18px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No tasks found for "<strong>{query}</strong>"
                </div>
              ) : (
                <>
                  <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                  {results.map(task => (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderTop: '1px solid var(--border-light)',
                      transition: 'background 0.12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#3B5BFC', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>{task.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: STAGE_COLOR[task.stage],
                        background: STAGE_COLOR[task.stage] + '18',
                        border: `1px solid ${STAGE_COLOR[task.stage]}33`,
                        padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                      }}>{task.stage}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>




      </div>
    </div>
  );
}
