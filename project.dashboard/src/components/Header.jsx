import { Search, X, PanelRight, Plus, ImagePlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const STAGE_COLOR = {
  New: '#9CA3AF', Start: '#3B5BFC', Accept: '#7C3AED',
  Review: '#F97316', Update: '#EF4444', Complete: '#12C479',
};

export default function Header({ title, subtitle }) {
  const { tasks, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dashTitle, setDashTitle] = useState('');
  const [dashboards, setDashboards] = useState([
    {
      id: 'default',
      label: 'Default',
      active: true,
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&q=60',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&q=60',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=80&q=60',
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=80&q=60',
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&q=60',
      ],
    },
  ]);
  const [selectedImages, setSelectedImages] = useState([]);
  const imageInputRef = useRef(null);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const results = query.trim().length > 0
    ? (tasks || []).filter(t =>
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

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setPanelOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function handleAddDashboard() {
    const label = dashTitle.trim();
    if (!label) return;
    const id = 'dash-' + Date.now();
    setDashboards(prev => [...prev.map(d => ({ ...d, active: false })), { id, label, images: selectedImages, active: true }]);
    setDashTitle('');
    setSelectedImages([]);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImages(prev => [...prev, url]);
    e.target.value = '';
  }

  function handleDeleteDashboard(e, id) {
    e.stopPropagation();
    setDashboards(prev => {
      const filtered = prev.filter(d => d.id !== id);
      const hasActive = filtered.some(d => d.active);
      if (!hasActive && filtered.length > 0) filtered[0].active = true;
      return filtered;
    });
  }

  function handleSetActive(id) {
    setDashboards(prev => prev.map(d => ({ ...d, active: d.id === id })));
  }

  return (
    <>
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
          {greeting}, {currentUser?.name || 'Admin'}! 👋
        </h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</p>
      </div>

      {/* Right: search + edit button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Task search */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: focused ? 'var(--bg-surface)' : 'var(--input-bg)',
            border: `1.5px solid ${focused ? '#3B5BFC' : 'var(--border)'}`,
            borderRadius: 11, padding: '0 12px', height: 38,
            width: focused ? 280 : 220,
            boxShadow: focused ? '0 0 0 3px rgba(59,91,252,0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}>
            <Search size={14} color={focused ? '#3B5BFC' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
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
              width: 340, background: 'var(--bg-surface)',
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
                      transition: 'background 0.12s', cursor: 'pointer',
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

        {/* Panel Button */}
        <button
          onClick={() => setPanelOpen(true)}
          style={{
            width: 38, height: 38, borderRadius: 11,
            border: `1.5px solid ${panelOpen ? '#3B5BFC' : 'var(--border)'}`,
            background: panelOpen ? '#EEF2FF' : 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#EEF2FF';
            e.currentTarget.style.borderColor = '#3B5BFC';
          }}
          onMouseLeave={e => {
            if (!panelOpen) {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }
          }}
          title="Dashboard options"
        >
          <PanelRight size={16} color="#3B5BFC" strokeWidth={2} />
        </button>

      </div>

    </div>

    {/* ── Centered Dashboard Options Modal ── */}
    {panelOpen && (
      <div
        onClick={() => setPanelOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.18s ease',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: 360, background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)', borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '85vh',
            animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Modal header */}
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1.5px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: '20px 20px 0 0',
            background: 'var(--bg-surface)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Carousel Options</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Manage dashboard for organizations</div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: 8,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
            >
              <X size={14} color="#374151" strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Update input */}
          <div style={{ padding: '12px 16px', borderBottom: '1.5px solid var(--border-light)' }}>

            {/* Title + image + add button */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={dashTitle}
                onChange={e => setDashTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDashboard()}
                placeholder="Title…"
                autoFocus
                style={{
                  flex: 1, padding: '9px 13px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--input-bg)',
                  fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#3B5BFC'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {/* Image picker button */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                title="Select image"
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  border: `1.5px solid ${selectedImages.length ? '#3B5BFC' : 'var(--border)'}`,
                  background: selectedImages.length ? '#EEF2FF' : 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B5BFC'; e.currentTarget.style.background = '#EEF2FF'; }}
                onMouseLeave={e => { if (!selectedImages.length) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; } }}
              >
                <ImagePlus size={15} color={selectedImages.length ? '#3B5BFC' : '#6B7280'} strokeWidth={2} />
              </button>
              <button
                onClick={handleAddDashboard}
                disabled={!dashTitle.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: 'none',
                  background: dashTitle.trim() ? '#3B5BFC' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: dashTitle.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => { if (dashTitle.trim()) e.currentTarget.style.background = '#2D4AE8'; }}
                onMouseLeave={e => { if (dashTitle.trim()) e.currentTarget.style.background = '#3B5BFC'; }}
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
              </button>
            </div>

            {/* Image previews — horizontal row */}
            {selectedImages.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {selectedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={img} alt={`img-${idx}`} style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', border: '1.5px solid var(--border)', display: 'block' }} />
                    <button
                      onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                      style={{
                        position: 'absolute', top: -5, right: -5,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#EF4444', border: '1.5px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0,
                      }}
                    >
                      <X size={9} color="#fff" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dashboard list */}
          <div style={{ padding: '12px 16px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {dashboards.map(d => (
              <button
                key={d.id}
                onClick={() => handleSetActive(d.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8,
                  padding: '11px 14px', borderRadius: 12,
                  border: `1.5px solid ${d.active ? '#3B5BFC' : 'var(--border-light)'}`,
                  background: d.active ? '#EEF2FF' : 'var(--bg-subtle)',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!d.active) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={e => { if (!d.active) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              >
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: d.active ? '#3B5BFC' : 'var(--text-muted)',
                    boxShadow: d.active ? '0 0 0 3px rgba(59,91,252,0.18)' : 'none',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: d.active ? 700 : 500, color: d.active ? '#3B5BFC' : 'var(--text-primary)', flex: 1 }}>
                    {d.label}
                  </span>
                  {d.active && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#3B5BFC', background: '#D6DFFE', padding: '2px 8px', borderRadius: 20, marginRight: 4 }}>Active</span>
                  )}
                  {d.id !== 'default' && (
                    <button
                      onClick={e => handleDeleteDashboard(e, d.id)}
                      style={{
                        width: 20, height: 20, borderRadius: 6, border: 'none',
                        background: 'transparent', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      title="Delete"
                    >
                      <X size={11} color="#EF4444" strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                {/* Image previews */}
                {d.images && d.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {d.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`img-${idx}`}
                        style={{
                          width: 34, height: 34, borderRadius: 6,
                          objectFit: 'cover',
                          border: `1.5px solid ${d.active ? 'rgba(59,91,252,0.25)' : 'var(--border)'}`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          </div>{/* end scrollable body */}

        </div>
      </div>
    )}
    </>
  );
}
