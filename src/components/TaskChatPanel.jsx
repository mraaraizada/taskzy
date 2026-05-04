import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const MOCK_CHAT_MESSAGES = [
  { id: 1, text: 'Hey, just picked this up. Starting the initial design review now.', sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '09:14 AM', date: 'Apr 22' },
  { id: 2, text: 'Great! Let me know if you need the brand assets — I can share the Figma link.', sender: 'Admin', avatar: 'A', color: '#3B5BFC', time: '09:17 AM', date: 'Apr 22' },
  { id: 3, text: "Yes please, that would help a lot. Also, what's the deadline looking like?", sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '09:20 AM', date: 'Apr 22' },
  { id: 4, text: "Deadline is end of this week. We have some buffer but let's not push it.", sender: 'Sarah Johnson', avatar: 'SJ', color: '#7C3AED', time: '10:02 AM', date: 'Apr 22' },
  { id: 5, text: "Understood. I'll have a first draft ready by tomorrow EOD.", sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '10:05 AM', date: 'Apr 22' },
  { id: 6, text: 'Pushed the first draft to Review A. Feedback welcome!', sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '04:38 PM', date: 'Apr 23' },
  { id: 7, text: 'Looks solid overall. The hero section needs a bit more breathing room though.', sender: 'Admin', avatar: 'A', color: '#3B5BFC', time: '05:10 PM', date: 'Apr 23' },
  { id: 8, text: 'Agreed on the spacing. Also the CTA button color feels off against the background.', sender: 'Marcus Chen', avatar: 'MC', color: '#12C479', time: '05:22 PM', date: 'Apr 23' },
  { id: 9, text: 'On it — will fix both and push an update tonight.', sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '05:30 PM', date: 'Apr 23' },
  { id: 10, text: 'Updated version is up. Let me know if this looks better.', sender: 'Emily Davis', avatar: 'ED', color: '#8B5CF6', time: '09:55 AM', date: 'Apr 24' },
];

export default function TaskChatPanel({ task, onClose, currentUser, team = [] }) {
  const storageKey = `task_chat_${task.id}`;
  const [messages, setMessages] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored) return stored;
      localStorage.setItem(storageKey, JSON.stringify(MOCK_CHAT_MESSAGES));
      return MOCK_CHAT_MESSAGES;
    } catch { return MOCK_CHAT_MESSAGES; }
  });
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    if (messages.length > 0) {
      localStorage.setItem(`task_chat_read_${task.id}`, String(messages[messages.length - 1].id));
    }
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const msg = {
      id: Date.now(),
      text,
      sender: currentUser?.name || 'Admin',
      avatar: currentUser?.avatar || 'A',
      color: currentUser?.color || '#3B5BFC',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    localStorage.setItem(`task_chat_read_${task.id}`, String(msg.id));
    setInput('');
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
        background: 'var(--bg-surface)', borderLeft: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 1000,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={16} color="#3B5BFC" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{task.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        {task.members && task.members.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {task.members.slice(0, 6).map((m, i) => (
                <div
                  key={m.id}
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const teamMember = team.find(t => t.id === m.id);
                    setHoveredMember({ name: m.name, role: teamMember?.role || '', x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredMember(null)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: m.color || '#3B5BFC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    border: '2px solid var(--bg-surface)',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: task.members.length - i,
                    position: 'relative', cursor: 'default',
                  }}
                >
                  {m.avatar}
                </div>
              ))}
              {task.members.length > 6 && (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--bg-subtle)', border: '2px solid var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: 'var(--text-muted)',
                  marginLeft: -8, position: 'relative', zIndex: 0,
                }}>
                  +{task.members.length - 6}
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {task.members.length} member{task.members.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: 0.5 }}>
            <MessageSquare size={32} color="var(--text-muted)" strokeWidth={1.5} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No messages yet.<br />Start the conversation.</span>
          </div>
        ) : messages.map((msg, i) => {
          const showDate = i === 0 || messages[i - 1].date !== msg.date;
          const isMine = msg.sender === (currentUser?.name || 'Admin');
          const isLastMine = isMine && messages.slice(i + 1).every(m => m.sender !== (currentUser?.name || 'Admin'));
          const readBy = msg.readBy || (isMine && !isLastMine ? task.members.map(m => m.name) : []);
          const totalMembers = task.members?.length || 0;
          const readCount = readBy.length;
          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '2px 10px', borderRadius: 20 }}>{msg.date}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                  {msg.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{msg.sender}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{msg.time}</span>
                  </div>
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: '4px 12px 12px 12px', wordBreak: 'break-word', paddingRight: isMine ? 28 : 12, position: 'relative' }}>
                      {msg.text}
                      {isMine && (
                        <div
                          style={{ position: 'absolute', bottom: 6, right: 7, display: 'inline-block' }}
                          onMouseEnter={e => { const tip = e.currentTarget.querySelector('[data-tip]'); if (tip) tip.style.display = 'block'; }}
                          onMouseLeave={e => { const tip = e.currentTarget.querySelector('[data-tip]'); if (tip) tip.style.display = 'none'; }}
                        >
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: readCount > 0 ? '#3B5BFC' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', lineHeight: 1 }}>i</span>
                          </div>
                          <div data-tip style={{ display: 'none', position: 'absolute', bottom: '100%', right: 0, marginBottom: 6, zIndex: 9999, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 160, whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.4 }}>
                              {readCount > 0 ? `Read by ${readCount} of ${totalMembers}` : 'Not read yet'}
                            </div>
                            {readCount > 0 ? readBy.map((name, ri) => (
                              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#12C479', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
                              </div>
                            )) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waiting for reads…</span>
                              </div>
                            )}
                            <div style={{ position: 'absolute', bottom: -5, right: 8, transform: 'rotate(45deg)', width: 8, height: 8, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderTop: 'none', borderLeft: 'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 18px', borderTop: '1.5px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--bg-subtle)', borderRadius: 12, border: '1.5px solid var(--border)', padding: '8px 10px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message…"
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', flexShrink: 0, background: input.trim() ? '#3B5BFC' : 'var(--border)', color: input.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}
          >
            <Send size={14} />
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, textAlign: 'center' }}>Enter to send · Shift+Enter for new line</div>
      </div>

      {/* Member hover tooltip */}
      {hoveredMember && (
        <div style={{ position: 'fixed', left: hoveredMember.x, top: hoveredMember.y - 8, transform: 'translateX(-50%) translateY(-100%)', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{hoveredMember.name}</div>
          {hoveredMember.role && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{hoveredMember.role}</div>}
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderTop: 'none', borderLeft: 'none' }} />
        </div>
      )}
    </div>
  );
}
