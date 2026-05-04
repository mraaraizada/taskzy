import { useState } from 'react';
import { ChevronDown, RefreshCw, AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Member-controllable stages from the admin workflow
const MEMBER_STAGES = ['Start', 'Issue', 'Review A', 'Review B', 'Update'];
const FILTERS = ['Active', 'Completed', 'All'];

const STAGE_DESCRIPTIONS = {
  Issue: 'Report a problem or blocker',
  'Review A': 'Submit your work for first review',
  'Review B': 'Submit for final review',
};

export default function MemberTasks({ member, onNavigateToNotes = null }) {
  const { tasks, updateTaskStage, STAGE_COLORS, STAGE_BG, STAGES, notes: globalNotes } = useApp();
  const [filter, setFilter] = useState('Active');
  const [updating, setUpdating] = useState(null);
  const [stageSelect, setStageSelect] = useState({});
  const [issueText, setIssueText] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  const myTasks = tasks.filter(t => t.members.some(m => m.id === member.id));

  const filtered = myTasks.filter(t => {
    const matchesFilter =
      filter === 'Active' ? t.stage !== 'Complete' :
      filter === 'Completed' ? t.stage === 'Complete' :
      true;
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (a.stage === 'Complete' && b.stage !== 'Complete') return 1;
    if (b.stage === 'Complete' && a.stage !== 'Complete') return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // Check if member is on hold for a task
  const isMemberOnHold = (task) => {
    const mem = task.members.find(m => m.id === member.id);
    return mem?.isOnHold || false;
  };

  function handleStageUpdate(task) {
    const newStage = stageSelect[task.id];
    if (!newStage) return;
    
    // If selecting Issue stage, require issue text
    if (newStage === 'Issue' && !issueText[task.id]?.trim()) {
      alert('Please describe the issue before submitting.');
      return;
    }
    
    setUpdating(task.id);
    setTimeout(() => {
      // Pass issue text if stage is Issue
      const issueNote = newStage === 'Issue' ? issueText[task.id] : null;
      updateTaskStage(task.id, newStage, member.id, issueNote);
      setUpdating(null);
      setStageSelect(prev => { const n = { ...prev }; delete n[task.id]; return n; });
      setIssueText(prev => { const n = { ...prev }; delete n[task.id]; return n; });
    }, 700);
  }

  const isOverdue = (t) => new Date(t.extendedDeadline || t.deadline) < new Date() && t.stage !== 'Complete';
  const daysUntil = (d, ext) => Math.ceil((new Date(ext || d) - new Date()) / (1000 * 60 * 60 * 24));

  // counts
  const counts = {
    Active: myTasks.filter(t => t.stage !== 'Complete').length,
    Completed: myTasks.filter(t => t.stage === 'Complete').length,
    All: myTasks.length,
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top bar: filter + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F0F2F8', borderRadius: 12, padding: '4px' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#1A1D2E' : '#6B7280',
              boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {f}
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: filter === f ? '#EEF2FF' : 'transparent', fontSize: 10, fontWeight: 800,
                color: filter === f ? '#3B5BFC' : '#9CA3AF', padding: '0 4px',
              }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ width: '100%', height: 36, borderRadius: 10, border: '1.5px solid #E8EAEF', paddingLeft: 32, paddingRight: 12, fontSize: 12, color: '#374151', outline: 'none', background: '#fff' }}
            onFocus={e => e.target.style.borderColor = '#3B5BFC'}
            onBlur={e => e.target.style.borderColor = '#E8EAEF'}
          />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
          {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: search ? '#FFF7ED' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {search
              ? <Search size={26} color="#F97316" strokeWidth={1.6} />
              : <CheckCircle size={26} color="#3B5BFC" strokeWidth={1.6} />}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E', marginBottom: 6 }}>
              {search ? 'No matching tasks' : filter === 'Completed' ? 'No completed tasks' : 'No tasks assigned'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, maxWidth: 260 }}>
              {search
                ? 'Try a different search term or clear the filter'
                : filter === 'Completed'
                ? 'Tasks will appear here once marked as complete'
                : 'Your admin will assign tasks to you soon'}
            </div>
          </div>
        </div>
      )}

      {/* Task cards */}
      {filtered.map(task => {
        const mem = task.members.find(m => m.id === member.id);
        const overdueFlag = isOverdue(task);
        const isExpanded  = expanded === task.id;
        const isComplete  = task.stage === 'Complete' || mem?.stage === 'Complete';
        const onHold = mem?.isOnHold || false;
        const days = daysUntil(task.deadline, task.extendedDeadline);
        const currentStage = mem?.stage || task.stage;

        // Members can only select: Issue, Review A, or Review B
        const allowedNext = ['Issue', 'Review A', 'Review B'].filter(s => {
          // Don't show current stage as an option
          if (s === currentStage) return false;
          return true;
        });

        return (
          <div key={task.id} style={{
            background: '#fff', borderRadius: 18,
            border: `1.5px solid ${onHold ? '#FFF7ED' : overdueFlag ? '#FED7D7' : isComplete ? '#BBF7D0' : '#E8EAEF'}`,
            overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s',
            boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.08)' : 'none',
            opacity: onHold ? 0.85 : 1,
          }}
            onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => setExpanded(isExpanded ? null : task.id)}>

              {/* Stage indicator */}
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: onHold ? '#FFF7ED' : isComplete ? '#ECFDF5' : overdueFlag ? '#FEF2F2' : STAGE_BG[currentStage],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {onHold
                  ? <Clock size={18} color="#F97316" strokeWidth={2.5} style={{ opacity: 0.6 }} />
                  : isComplete
                    ? <CheckCircle size={18} color="#12C479" strokeWidth={2.5} />
                    : overdueFlag
                      ? <AlertCircle size={18} color="#EF4444" strokeWidth={2.5} />
                      : <Clock size={18} color={STAGE_COLORS[currentStage]} strokeWidth={2.5} />
                }
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: isComplete ? '#12C479' : '#3B5BFC', padding: '2px 7px', borderRadius: 5 }}>{task.id}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {onHold && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#FFF7ED', color: '#F97316', border: '1px solid #F97316' }}>
                      🔒 On Hold
                    </span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: STAGE_BG[currentStage], color: STAGE_COLORS[currentStage] }}>
                    {currentStage}
                  </span>
                  <span style={{ fontSize: 11, color: overdueFlag ? '#EF4444' : days <= 2 ? '#F97316' : '#9CA3AF', fontWeight: overdueFlag || days <= 2 ? 600 : 400 }}>
                    {isComplete
                      ? 'Completed'
                      : overdueFlag
                        ? `${Math.abs(days)}d overdue`
                        : days === 0 ? 'Due today'
                        : days === 1 ? 'Due tomorrow'
                        : `${task.extendedDeadline ? 'Extended: ' : 'Due '}${new Date(task.extendedDeadline || task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    }
                  </span>
                  {task.tags && task.tags.map(tag => (
                    <span key={tag.label} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 600 }}>{tag.emoji} {tag.label}</span>
                  ))}
                </div>
              </div>

              {/* Budget + expand */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: isComplete ? '#12C479' : '#374151' }}>₹ {mem?.budget?.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>your share</div>
              </div>

              <ChevronDown size={16} color="#C4C9D9" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div style={{ borderTop: '1.5px solid #F0F2F8', background: '#FAFBFF' }}>
                <div style={{ padding: '20px 20px' }}>
                  {/* General description */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>Task Overview</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{task.description}</p>
                  </div>

                  {/* Private instructions */}
                  {mem?.memberDesc && (
                    <div style={{ background: 'linear-gradient(135deg, #F0F4FF, #F5F3FF)', border: '1.5px solid #C7D4FF', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#3B5BFC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Instructions</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{mem.memberDesc}</p>
                    </div>
                  )}

                  {/* Team row */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 9 }}>Team on this task</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {task.members.map(m => (
                        <div key={m.id} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: m.id === member.id ? '#EEF2FF' : '#fff',
                          border: `1.5px solid ${m.id === member.id ? '#C7D4FF' : '#E8EAEF'}`,
                          borderRadius: 10, padding: '7px 12px',
                        }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>{m.avatar}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D2E' }}>{m.name}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{m.role}</div>
                          </div>
                          {m.id === member.id && <span style={{ fontSize: 9, color: '#3B5BFC', fontWeight: 800, background: '#EEF2FF', padding: '1px 5px', borderRadius: 5 }}>You</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issue Note - Read Only */}
                  {task.issueNote && (
                    <div style={{ marginBottom: 16, padding: '14px 16px', background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FED7D7' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AlertCircle size={16} color="#EF4444" strokeWidth={2.5} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported Issue</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #FED7D7' }}>
                        {task.issueNote}
                      </div>
                    </div>
                  )}

                  {/* Scribes */}
                  {(() => {
                    const taskScribes = (globalNotes || []).filter(n =>
                      n.taskId === task.id && (
                        n.assignMode === 'all' ||
                        (n.assignees || []).includes(String(member.id))
                      )
                    );
                    if (!taskScribes.length) return null;
                    return (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Scribes</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {taskScribes.map((s, i) => (
                            <button key={i} type="button"
                              onClick={() => { if (onNavigateToNotes) onNavigateToNotes(); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F5F3FF', borderRadius: 10, border: '1.5px solid #DDD6FE', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
                              onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}
                            >
                              <div style={{ width: 26, height: 26, borderRadius: 7, background: s.type === 'sheet' ? '#ECFDF5' : '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #DDD6FE' }}>
                                {s.type === 'sheet'
                                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12C479" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{s.type === 'sheet' ? 'Sheet' : 'Note'} � Tap to open</div>
                              </div>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Stage workflow visualization */}
                  {!isComplete && (
                    <div style={{ marginBottom: 16, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1.5px solid #F0F2F8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Stage Workflow</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500 }}>You control: Start, Issue, Review A, Review B, Update</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                        {STAGES.map((s, i, arr) => {
                          const curIdx = STAGES.indexOf(currentStage);
                          const sIdx   = STAGES.indexOf(s);
                          const isPast = sIdx < curIdx;
                          const isCurrent = s === currentStage;
                          const canControl = MEMBER_STAGES.includes(s);
                          return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none', minWidth: 'fit-content' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                <div style={{
                                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isPast ? '#12C479' : isCurrent ? '#3B5BFC' : '#F0F2F8',
                                  border: `2px solid ${isPast ? '#12C479' : isCurrent ? '#3B5BFC' : '#E8EAEF'}`,
                                  fontSize: 10, fontWeight: 800, color: isPast || isCurrent ? '#fff' : '#9CA3AF',
                                  flexShrink: 0,
                                }}>
                                  {isPast ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: 8, fontWeight: isCurrent ? 800 : 500, color: isCurrent ? '#3B5BFC' : '#9CA3AF', marginTop: 4, whiteSpace: 'nowrap' }}>{s}</span>
                                {canControl && (
                                  <div style={{ position: 'absolute', top: -6, right: -6, width: 10, height: 10, borderRadius: '50%', background: '#3B5BFC', border: '1.5px solid #fff' }} />
                                )}
                              </div>
                              {i < arr.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: isPast ? '#12C479' : '#F0F2F8', marginBottom: 14, minWidth: 8 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Update stage */}
                  {!isComplete && !onHold && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1.5px solid #E8EAEF' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 2 }}>Update your stage</div>
                          {stageSelect[task.id] && (
                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{STAGE_DESCRIPTIONS[stageSelect[task.id]]}</div>
                          )}
                        </div>
                        <select
                          value={stageSelect[task.id] || ''}
                          onChange={e => setStageSelect(prev => ({ ...prev, [task.id]: e.target.value }))}
                          style={{ height: 38, borderRadius: 10, border: `1.5px solid ${stageSelect[task.id] ? '#3B5BFC' : '#E8EAEF'}`, padding: '0 12px', fontSize: 12, fontWeight: 600, color: '#1A1D2E', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: 160 }}>
                          <option value="">Select new stage…</option>
                          {allowedNext.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          disabled={!stageSelect[task.id] || updating === task.id}
                          onClick={() => handleStageUpdate(task)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '10px 20px', borderRadius: 10, border: 'none',
                            background: stageSelect[task.id] ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : '#F0F2F8',
                            color: stageSelect[task.id] ? '#fff' : '#9CA3AF',
                            fontSize: 12, fontWeight: 700,
                            cursor: stageSelect[task.id] ? 'pointer' : 'default',
                            boxShadow: stageSelect[task.id] ? '0 4px 12px rgba(59,91,252,0.3)' : 'none',
                            transition: 'all 0.15s',
                          }}>
                          {updating === task.id
                            ? <><RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                            : <>Update Stage</>
                          }
                        </button>
                      </div>
                      
                      {/* Issue text box - only show when Issue stage is selected */}
                      {stageSelect[task.id] === 'Issue' && (
                        <div style={{ padding: '14px 16px', background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FED7D7' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Describe the Issue *
                          </label>
                          <textarea
                            value={issueText[task.id] || ''}
                            onChange={e => setIssueText(prev => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Explain what problem or blocker you're facing..."
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1.5px solid #FED7D7',
                              borderRadius: 10,
                              fontSize: 13,
                              color: '#374151',
                              outline: 'none',
                              background: '#fff',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                            onFocus={e => e.target.style.borderColor = '#EF4444'}
                            onBlur={e => e.target.style.borderColor = '#FED7D7'}
                          />
                          <div style={{ fontSize: 10, color: '#EF4444', marginTop: 6, fontWeight: 500 }}>
                            This will be visible to admin and management
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* On Hold Notice */}
                  {onHold && !isComplete && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#FFF7ED', borderRadius: 12, border: '1.5px solid #F97316' }}>
                      <Clock size={18} color="#F97316" strokeWidth={2.5} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>Task is on hold</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Admin has paused this task. You cannot update your stage until it's reactivated.</div>
                      </div>
                    </div>
                  )}

                  {isComplete && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#F0FDF4', borderRadius: 12, border: '1.5px solid #BBF7D0' }}>
                      <CheckCircle size={18} color="#12C479" strokeWidth={2.5} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#12C479' }}>Task completed — great work!</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Your payment of ${mem?.budget?.toLocaleString()} is being processed</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
