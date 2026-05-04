import { useState, useEffect } from 'react';
import { notify } from '../../lib/notify';
import { CheckCircle, DollarSign, RotateCcw, Calendar, ChevronLeft, ChevronRight, AlertCircle, ChevronDown, RefreshCw, Clock, Plus, X, MessageSquare, Send } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useLottie } from 'lottie-react';
import donutWelcomeAnim from '../../lottie/Welcome (1).json';
import Avatar from '../../components/Avatar';
import TaskChatPanel from '../../components/TaskChatPanel';
import { MemberHomeSkeleton } from '../../components/Skeleton';

const TYPE_ICONS = {
  complete:  { icon: CheckCircle, bg: '#E8FBF1', color: '#12C479' },
  review:    { icon: RotateCcw,   bg: '#FFF7ED', color: '#F97316' },
  payment:   { icon: DollarSign,  bg: '#E8FBF1', color: '#12C479' },
  update:    { icon: AlertCircle, bg: '#FFF1F1', color: '#EF4444' },
  accept:    { icon: CheckCircle, bg: '#EEF2FF', color: '#3B5BFC' },
  broadcast: { icon: Send,        bg: '#F5F3FF', color: '#7C3AED' },
  start:     { icon: CheckCircle, bg: '#EEF2FF', color: '#3B5BFC' },
};

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MEMBER_STAGES = ['Start', 'Issue', 'Review A', 'Review B', 'Update'];
const TASK_FILTERS = ['Active', 'Completed', 'All'];
const STAGE_DESCRIPTIONS = {
  Issue: 'Report a problem or blocker',
  'Review A': 'Submit your work for first review',
  'Review B': 'Submit for final review',
};

function MiniCalendar({ tasks, member, onDateSelect }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventColor, setEventColor] = useState('#22C55E');
  const [events, setEvents] = useState([]); // Start with empty events

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const taskDates = new Set(tasks.map(t => {
    const d = new Date(t.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
    return null;
  }).filter(Boolean));

  const overdueDates = new Set(tasks.filter(t => new Date(t.deadline) < today && t.stage !== 'Complete').map(t => {
    const d = new Date(t.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
    return null;
  }).filter(Boolean));

  const handleSaveEvent = () => {
    if (eventName.trim() && selectedDate) {
      setEvents([...events, { date: selectedDate, name: eventName, color: eventColor, month, year }]);
      setShowModal(false);
      setEventName('');
      setEventColor('#22C55E');
      setSelectedDate(null);
    }
  };

  const getEventsForDate = (day) => {
    return events.filter(e => e.date === day && e.month === month && e.year === year);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E8EAEF', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color="#6B7280" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E', letterSpacing: '0.01em' }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E8EAEF', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={18} color="#6B7280" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#9CA3AF', paddingBottom: 6, letterSpacing: '0.02em' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selectedDay;
          const eventsForDate = getEventsForDate(day);
          const hasEvents = eventsForDate.length > 0;
          
          let bgColor = 'transparent';
          let textColor = '#374151';
          let fontWeight = 400;
          
          if (isToday) {
            bgColor = '#3B5BFC';
            textColor = '#fff';
            fontWeight = 700;
          } else if (isSelected) {
            bgColor = '#EEF2FF';
            textColor = '#3B5BFC';
            fontWeight = 700;
          }
          
          return (
            <button key={day} onClick={() => { 
              setSelectedDay(day);
              if (onDateSelect) {
                onDateSelect(day, month, year);
              }
            }} style={{
              width: '100%', height: 56, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: bgColor,
              color: textColor,
              fontSize: 16, fontWeight: fontWeight,
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              padding: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {day}
              {hasEvents && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: 5, 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  display: 'flex',
                  gap: 5
                }}>
                  {eventsForDate.slice(0, 3).map((event, idx) => (
                    <div key={idx} style={{ 
                      width: 7, 
                      height: 7, 
                      borderRadius: '50%', 
                      background: event.color 
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Show events for selected day - Always visible */}
      <div style={{ marginTop: 10, padding: '8px 10px', background: '#F0F2F8', borderRadius: 10 }}>
        {(() => {
          const selectedEvents = getEventsForDate(selectedDay);
          if (selectedEvents.length > 0) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                  {selectedEvents.map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', background: '#fff', borderRadius: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: event.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                        {event.name}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Plus Button */}
                <button
                  onClick={() => { setSelectedDate(selectedDay); setShowModal(true); }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={14} color="#3B5BFC" strokeWidth={2.5} />
                </button>
              </div>
            );
          } else {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic' }}>
                  No events
                </div>
                {/* Plus Button */}
                <button
                  onClick={() => { setSelectedDate(selectedDay); setShowModal(true); }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={14} color="#3B5BFC" strokeWidth={2.5} />
                </button>
              </div>
            );
          }
        })()}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, width: 320,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1D2E', margin: 0 }}>
                {selectedDate ? `Add Event - ${MONTHS[month]} ${selectedDate}` : 'Add Event'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEventName(''); setSelectedDate(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {!selectedDate && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Select Date
                </label>
                <input
                  type="number"
                  min="1"
                  max={daysInMonth}
                  placeholder="Enter day (1-31)"
                  value={selectedDate || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= daysInMonth) {
                      setSelectedDate(val);
                    } else if (e.target.value === '') {
                      setSelectedDate(null);
                    }
                  }}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
                    fontSize: 14, outline: 'none', transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Event Name
              </label>
              <input
                type="text"
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
                  fontSize: 14, outline: 'none', transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Choose Color
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map(color => (
                  <button
                    key={color}
                    onClick={() => setEventColor(color)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: color,
                      border: eventColor === color ? '3px solid #1A1D2E' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      transform: eventColor === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowModal(false); setEventName(''); setSelectedDate(null); }}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #E5E7EB',
                  background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={!eventName.trim() || !selectedDate}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: (!eventName.trim() || !selectedDate) ? '#D1D5DB' : '#4F46E5',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: (!eventName.trim() || !selectedDate) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (eventName.trim() && selectedDate) e.currentTarget.style.background = '#4338CA';
                }}
                onMouseLeave={(e) => {
                  if (eventName.trim() && selectedDate) e.currentTarget.style.background = '#4F46E5';
                }}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const WEEK_OPTIONS = ['This Week', 'Last Week', '2 Weeks Ago'];

function MemberTaskDonut({ tasks, member }) {
  const [hovered, setHovered] = useState(null);
  const { showDonutWelcome, setShowDonutWelcome } = useApp();
  const [donutFading, setDonutFading] = useState(false);

  const DonutLottie = () => {
    const { View } = useLottie({
      animationData: donutWelcomeAnim,
      loop: false,
      autoplay: true,
      onComplete: () => { setDonutFading(true); setTimeout(() => setShowDonutWelcome(false), 500); },
      style: { width: '100%', height: '100%', objectFit: 'cover' },
    });
    useEffect(() => {
      const t = setTimeout(() => { setDonutFading(true); setTimeout(() => setShowDonutWelcome(false), 500); }, 4000);
      return () => clearTimeout(t);
    }, []);
    return View;
  };

  const now = new Date();

  // All member tasks — not just this week (matches admin TaskDonut)
  const myTasks   = tasks.filter(t => t.members.some(m => m.id === member.id));
  const completed = myTasks.filter(t => t.stage === 'Complete').length;
  const overdue   = myTasks.filter(t => t.stage !== 'Complete' && new Date(t.extendedDeadline || t.deadline) < now).length;
  const pending   = myTasks.filter(t => t.stage !== 'Complete' && new Date(t.extendedDeadline || t.deadline) >= now).length;
  const total     = myTasks.length;

  const data = [
    { name: 'Complete', value: completed, color: '#12C479' },
    { name: 'Pending',  value: pending,   color: '#3B5BFC' },
    { name: 'Overdue',  value: overdue,   color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const displayData = data.length > 0 ? data : [{ name: 'Empty', value: 1, color: '#E5E7EB' }];

  const active = hovered ? data.find(d => d.name === hovered) : null;
  const centerValue = active ? active.value : total;
  const centerLabel = active ? active.name : 'Total';
  const centerColor = active ? active.color : '#1A1D2E';

  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '18px 22px', border: '1.5px solid #E8EAEF', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D2E' }}>Task Overview</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Completed · Pending · Overdue</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', background: '#F0F2F8', padding: '3px 9px', borderRadius: 6, border: '1px solid #E8EAEF' }}>My Tasks</span>
      </div>

      {/* Donut */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%" cy="50%" innerRadius={60} outerRadius={88}
                dataKey="value" strokeWidth={2} stroke="#fff"
                startAngle={90} endAngle={-270}
                onMouseEnter={(_, i) => setHovered(data.length > 0 ? displayData[i]?.name : null)}
                onMouseLeave={() => setHovered(null)}
              >
                {displayData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={hovered && hovered !== entry.name ? 0.3 : 1} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: centerColor, lineHeight: 1, transition: 'color 0.2s' }}>{centerValue}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginTop: 4 }}>{centerLabel}</span>
          </div>
        </div>
      </div>

      {/* Welcome lottie overlay — covers full card */}
      {showDonutWelcome && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: donutFading ? 0 : 1, transition: 'opacity 0.5s ease', borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DonutLottie />
        </div>
      )}

    </div>
  );
}

export default function MemberHome({ member, onNavigateToNotes = null }) {
  const { tasks, activity, financials, STAGE_COLORS, STAGE_BG, STAGES, updateTaskStage, fmt, addTaskRequest, refreshTrigger, notes: globalNotes, broadcasts } = useApp();

  // React to refresh trigger - this will cause component to re-render with fresh data
  useEffect(() => {
    // Component will automatically re-render when refreshTrigger changes
    // In a real app, you might fetch fresh data here
  }, [refreshTrigger]);

  // Upcoming
  const myTasks     = tasks.filter(t => t.members.some(m => m.id === member.id));
  const activeTasks = myTasks.filter(t => t.stage !== 'Complete');
  const upcoming    = [...activeTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);

  // Full task list state
  const [filter, setFilter]       = useState('Active');
  const [modalTask, setModalTask] = useState(null);
  const [stageSelect, setStageSelect] = useState({});
  const [issueText, setIssueText] = useState({});
  const [updating, setUpdating]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const tasksPerPage = 10;
  
  // Task request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [viewBroadcast, setViewBroadcast] = useState(null);
  const [chatTask, setChatTask] = useState(null);
  const [readUpdateIds, setReadUpdateIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('memberReadUpdateIds') || '[]')); } catch { return new Set(); }
  });
  const markUpdateRead = (id) => {
    setReadUpdateIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('memberReadUpdateIds', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const filtered = myTasks.filter(t => {
    return filter === 'Active' ? t.stage !== 'Complete' : filter === 'Completed' ? t.stage === 'Complete' : true;
  }).sort((a, b) => {
    if (a.stage === 'Complete' && b.stage !== 'Complete') return 1;
    if (b.stage === 'Complete' && a.stage !== 'Complete') return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // Filter by selected calendar date
  const filteredByDate = selectedCalendarDate 
    ? filtered.filter(t => {
        const taskDate = new Date(t.deadline);
        return taskDate.getDate() === selectedCalendarDate.day && 
               taskDate.getMonth() === selectedCalendarDate.month && 
               taskDate.getFullYear() === selectedCalendarDate.year;
      })
    : filtered;

  const totalPages = Math.ceil(filteredByDate.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredByDate.slice(startIndex, endIndex);
  
  const handleRequestTask = () => {
    if (!requestTitle.trim()) return;
    addTaskRequest({
      title: requestTitle.trim(),
      description: requestDescription.trim(),
      submittedBy: { id: member.id, name: member.name, role: member.role, avatar: member.avatar, color: member.color },
    });
    setShowRequestModal(false);
    setRequestTitle('');
    setRequestDescription('');
    notify.taskRequestSubmitted(requestTitle.trim());
  };

  const counts = {
    Active: myTasks.filter(t => t.stage !== 'Complete').length,
    Completed: myTasks.filter(t => t.stage === 'Complete').length,
    All: myTasks.length,
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
      updateTaskStage(task.id, newStage, member.id, null, issueNote);
      setUpdating(null);
      setStageSelect(prev => { const n = { ...prev }; delete n[task.id]; return n; });
      setIssueText(prev => { const n = { ...prev }; delete n[task.id]; return n; });
      setModalTask(null);
    }, 700);
  }

  const isOverdue = (t) => new Date(t.extendedDeadline || t.deadline) < new Date() && t.stage !== 'Complete';
  const daysLeft  = (d, ext) => Math.ceil((new Date(ext || d) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Single two-column layout filling full height ── */}
      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>

        {/* LEFT: Upcoming Tasks (fixed) + My Tasks (fills rest, scrollable) */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

          {/* Upcoming Tasks — wrapped in one card with heading */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E8EAEF', overflow: 'hidden', flexShrink: 0 }}>
            {/* Heading */}
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #F0F2F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={14} color="#3B5BFC" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D2E' }}>Upcoming Tasks</div>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  background: '#EEF2FF',
                  border: 'none',
                  borderRadius: 10,
                  color: '#3B5BFC',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {/* Task cards */}
            <div style={{ padding: '12px 14px', display: 'flex', gap: 12 }}>
              {upcoming.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} color="#3B5BFC" strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E' }}>No upcoming tasks</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>Your assigned tasks will appear here</div>
                </div>
              ) : upcoming.slice(0, 3).map(task => {
                const deadline = new Date(task.deadline);
                const overdue = deadline < new Date();
                const days = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                const dateLabel = overdue ? `${Math.abs(days)}d late` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={task.id} style={{
                    flex: 1, background: overdue ? '#FFF5F5' : '#FAFBFF',
                    borderRadius: 12, border: `1.5px solid ${overdue ? '#FED7D7' : '#F0F2F8'}`,
                    padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7,
                    position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: task.paid ? '#12C479' : '#F97316', background: task.paid ? '#E8FBF1' : '#FFF7ED', padding: '2px 7px', borderRadius: 20 }}>{task.paid ? 'Paid' : 'Pending'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#3B5BFC', padding: '2px 6px', borderRadius: 4 }}>{task.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? '#EF4444' : days <= 2 ? '#F97316' : '#9CA3AF', flexShrink: 0 }}>{dateLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Tasks — fills remaining height, scrollable inside */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 18, border: '1.5px solid #E8EAEF', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #F0F2F8', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={13} color="#3B5BFC" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D2E' }}>My Tasks</div>
                {selectedCalendarDate && (
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                    Showing tasks for {MONTHS[selectedCalendarDate.month]} {selectedCalendarDate.day}, {selectedCalendarDate.year}
                    <button 
                      onClick={() => setSelectedCalendarDate(null)}
                      style={{ marginLeft: 6, fontSize: 10, color: '#3B5BFC', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
              {filteredByDate.length > tasksPerPage && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      width: 26, height: 26, borderRadius: 7,
                      border: '1.5px solid #E8EAEF',
                      background: currentPage === 1 ? '#F0F2F8' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={12} color="#6B7280" />
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', minWidth: 40, textAlign: 'center' }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      width: 26, height: 26, borderRadius: 7,
                      border: '1.5px solid #E8EAEF',
                      background: currentPage === totalPages ? '#F0F2F8' : '#fff',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight size={12} color="#6B7280" />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 3, background: '#F0F2F8', borderRadius: 9, padding: '3px' }}>
                {TASK_FILTERS.map(f => (
                  <button key={f} onClick={() => { setFilter(f); setCurrentPage(1); setSelectedCalendarDate(null); }} style={{ padding: '4px 11px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#1A1D2E' : '#6B7280', boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {f} {f === 'Active' && <span style={{ fontSize: 10, fontWeight: 800, color: filter === f ? '#3B5BFC' : '#9CA3AF' }}>{counts[f]}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable rows */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredByDate.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} color="#3B5BFC" strokeWidth={1.6} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', marginBottom: 5 }}>
                  {filter === 'Completed' ? 'No completed tasks' : 'No tasks assigned'}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                  {filter === 'Completed' ? 'Tasks will appear here once marked complete' : 'Your admin will assign tasks to you'}
                </div>
              </div>
            </div>
          )}

          {paginatedTasks.map(task => {
            const mem = task.members.find(m => m.id === member.id);
            const overdueFlag = isOverdue(task);
            const isComplete  = task.stage === 'Complete' || mem?.stage === 'Complete';
            const days = daysLeft(task.deadline, task.extendedDeadline);
            const currentStage = mem?.stage || task.stage;
            return (
              <div key={task.id} onClick={() => setModalTask(task)} style={{
                background: '#fff', borderRadius: 14,
                border: `1.5px solid ${overdueFlag ? '#FED7D7' : isComplete ? '#BBF7D0' : '#E8EAEF'}`,
                display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: isComplete ? '#ECFDF5' : overdueFlag ? '#FEF2F2' : STAGE_BG[currentStage], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isComplete ? <CheckCircle size={16} color="#12C479" strokeWidth={2.5} /> : overdueFlag ? <AlertCircle size={16} color="#EF4444" strokeWidth={2.5} /> : <Clock size={16} color={STAGE_COLORS[currentStage]} strokeWidth={2.5} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: isComplete ? '#12C479' : '#3B5BFC', padding: '2px 7px', borderRadius: 5 }}>{task.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setChatTask(task); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3B5BFC', position: 'relative' }}
                    >
                      <MessageSquare size={17} />
                      {(() => {
                        try {
                          const msgs = JSON.parse(localStorage.getItem(`task_chat_${task.id}`) || '[]');
                          const readAt = parseInt(localStorage.getItem(`task_chat_read_${task.id}`) || '0');
                          const unread = msgs.filter(m => m.id > readAt).length;
                          return unread > 0 ? (
                            <span style={{ position: 'absolute', top: -3, right: -3, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 7, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff' }}>
                              {unread > 9 ? '9+' : unread}
                            </span>
                          ) : null;
                        } catch { return null; }
                      })()}
                    </button>
                    {task.category && (
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: task.category.bg, color: task.category.color, fontWeight: 700, border: `1px solid ${task.category.color}30`, flexShrink: 0, marginLeft: 4 }}>{task.category.emoji} {task.category.label}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STAGE_BG[currentStage], color: STAGE_COLORS[currentStage] }}>{currentStage}</span>
                    {task.tags && task.tags.map(tag => (
                      <span key={tag.label} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 600 }}>{tag.emoji} {tag.label}</span>
                    ))}
                  </div>
                </div>

                {/* Due date - right side center */}
                <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 110 }}>
                  <span style={{ fontSize: 11, color: overdueFlag ? '#EF4444' : days <= 2 ? '#F97316' : '#9CA3AF', fontWeight: overdueFlag || days <= 2 ? 700 : 500, display: 'block' }}>
                    {isComplete ? new Date(task.paidOn || task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : overdueFlag ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? '🔥 Due today' : days === 1 ? '⏰ Due tomorrow' : `${task.extendedDeadline ? 'Extended: ' : 'Due '}${new Date(task.extendedDeadline || task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </span>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isComplete ? '#12C479' : '#374151' }}>₹ {mem?.budget?.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
          </div>{/* end scrollable rows */}
          </div>{/* end My Tasks card */}
        </div>{/* end LEFT column */}

        {/* RIGHT: Calendar + Donut + Updates */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '4px', border: '1.5px solid #E8EAEF', flexShrink: 0 }}>
            <MiniCalendar tasks={myTasks} member={member} onDateSelect={(day, month, year) => {
              setSelectedCalendarDate({ day, month, year });
              setCurrentPage(1);
            }} />
          </div>

          {/* Task Overview + Updates side by side */}
          <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0, position: 'relative' }}>

            <MemberTaskDonut tasks={tasks} member={member} />

            {/* Updates card — always rendered */}
            <div
              onClick={() => setShowUpdates(true)}
              style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '18px 22px', border: `1.5px solid ${showUpdates ? '#3B5BFC' : '#E8EAEF'}`, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', cursor: showUpdates ? 'default' : 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { if (!showUpdates) { e.currentTarget.style.boxShadow = '0 4px 18px rgba(59,91,252,0.10)'; e.currentTarget.style.borderColor = '#3B5BFC'; }}}
              onMouseLeave={e => { if (!showUpdates) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8EAEF'; }}}
            >
              {/* Header */}
              {(() => {
                const now = new Date();
                const TASK_STAGE_TYPES = new Set(['payment','accept','review','update','complete','start','broadcast']);
                const allItems = activity.filter(act => { const d = new Date(act.time); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && TASK_STAGE_TYPES.has(act.type); });
                const unread = allItems.filter(act => !readUpdateIds.has(act.id)).length;
                return (
                  <div style={{ marginBottom: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ position: 'relative', width: 30, height: 30, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={14} color="#3B5BFC" strokeWidth={2.5} />
                        {unread > 0 && !showUpdates && (
                          <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 8, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff' }}>
                            {unread}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D2E' }}>Updates</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Your recent task activity</div>
                      </div>
                    </div>
                    {!showUpdates && <ChevronRight size={14} color="#3B5BFC" />}
                  </div>
                );
              })()}
              {/* List preview */}
              {(() => {
                const now = new Date();
                const TASK_STAGE_TYPES = new Set(['payment', 'accept', 'review', 'update', 'complete', 'start', 'broadcast']);
                const items = activity.filter(act => { const d = new Date(act.time); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && TASK_STAGE_TYPES.has(act.type); });
                if (items.length === 0) return (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 10 }}>
                    <RefreshCw size={18} color="#9CA3AF" strokeWidth={1.8} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>No updates yet</div>
                  </div>
                );
                return (
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {items.map((act, i) => {
                      const cfg = TYPE_ICONS[act.type] || TYPE_ICONS.accept;
                      const ActIcon = cfg.icon;
                      const isBroadcast = act.type === 'broadcast';
                      const dashIdx = act.sub.indexOf(' — ');
                      const taskRef  = dashIdx !== -1 ? act.sub.slice(0, dashIdx) : act.sub;
                      const taskName = dashIdx !== -1 ? act.sub.slice(dashIdx + 3) : '';
                      const isUnread = !readUpdateIds.has(act.id);
                      return (
                        <div key={act.id} style={{ display: 'flex', gap: 10, padding: '6px 8px', borderRadius: 8, background: isUnread ? (isBroadcast ? '#F5F3FF' : '#EEF2FF') : 'transparent', marginBottom: i < items.length - 1 ? 3 : 0, cursor: isBroadcast ? 'pointer' : 'default' }} onClick={() => {
                          if (isBroadcast) { const b = broadcasts.find(b => b.id === act.id); if (b) setViewBroadcast(b); }
                        }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: isUnread ? '#fff' : '#F0F2F8', border: `1.5px solid ${isUnread ? (isBroadcast ? '#DDD6FE' : '#3B5BFC40') : '#E8EAEF'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ActIcon size={10} color={cfg.color} strokeWidth={2.5} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: isBroadcast ? '#7C3AED' : '#1A1D2E' }}>{act.title}</div>
                              {isUnread && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isBroadcast ? '#7C3AED' : '#3B5BFC', flexShrink: 0 }} />}
                            </div>
                            {isBroadcast ? (
                              <div style={{ fontSize: 10, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.sub}</div>
                            ) : (
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#3B5BFC', padding: '1px 5px', borderRadius: 4 }}>{taskRef}</span>
                                <span style={{ fontSize: 10, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{taskName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Expanded panel */}
            {showUpdates && (
              <div style={{
                position: 'fixed', bottom: '2%', right: '1%',
                width: '26%', height: '70%',
                background: 'var(--bg-surface)', borderRadius: 18,
                border: '1.5px solid var(--border)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                zIndex: 200,
                boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
                animation: 'smoothReveal 0.3s cubic-bezier(0.22,1,0.36,1)',
              }}>
                <style>{`@keyframes smoothReveal { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
                <div style={{ padding: '16px 20px 14px', borderBottom: '1.5px solid var(--border-light)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={14} color="#3B5BFC" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Updates</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Recent changes</div>
                    </div>
                  </div>
                  <button onClick={() => setShowUpdates(false)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={13} color="var(--text-secondary)" />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {(() => {
                    const now = new Date();
                    const TASK_STAGE_TYPES = new Set(['payment','accept','review','update','complete','start','broadcast']);
                    const items = activity.filter(act => { const d = new Date(act.time); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && TASK_STAGE_TYPES.has(act.type); });
                    const anyUnread = items.some(a => !readUpdateIds.has(a.id));
                    if (items.length === 0) return (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <RefreshCw size={32} color="#C4C9D9" />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>No updates this month</div>
                      </div>
                    );
                    return (
                      <>
                        {anyUnread && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <button onClick={() => { const ids = items.map(a => a.id); setReadUpdateIds(prev => { const next = new Set([...prev, ...ids]); try { localStorage.setItem('memberReadUpdateIds', JSON.stringify([...next])); } catch {} return next; }); }} style={{ fontSize: 10, fontWeight: 700, color: '#3B5BFC', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}>Mark all read</button>
                          </div>
                        )}
                        {items.map((act, i) => {
                          const cfg = TYPE_ICONS[act.type] || TYPE_ICONS.accept;
                          const ActIcon = cfg.icon;
                          const isBroadcast = act.type === 'broadcast';
                          const dashIdx = act.sub.indexOf(' — ');
                          const taskRef  = dashIdx !== -1 ? act.sub.slice(0, dashIdx) : act.sub;
                          const taskName = dashIdx !== -1 ? act.sub.slice(dashIdx + 3) : '';
                          const isUnread = !readUpdateIds.has(act.id);
                          return (
                            <div key={act.id} onClick={() => {
                              if (isUnread) markUpdateRead(act.id);
                              if (isBroadcast) { const b = broadcasts.find(b => b.id === act.id); if (b) setViewBroadcast(b); }
                            }} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 10, background: isUnread ? (isBroadcast ? '#F5F3FF' : '#EEF2FF') : 'transparent', marginBottom: i < items.length - 1 ? 4 : 0, cursor: 'pointer', transition: 'background 0.2s' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: isUnread ? '#fff' : 'var(--bg-subtle)', border: `1.5px solid ${isUnread ? (isBroadcast ? '#DDD6FE' : '#3B5BFC40') : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ActIcon size={12} color={cfg.color} strokeWidth={2.5} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: isBroadcast ? '#7C3AED' : 'var(--text-primary)' }}>{act.title}</div>
                                  {isUnread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: isBroadcast ? '#7C3AED' : '#3B5BFC', flexShrink: 0 }} />}
                                </div>
                                {isBroadcast ? (
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{act.sub}</div>
                                ) : (
                                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#3B5BFC', padding: '1px 5px', borderRadius: 4 }}>{taskRef}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{taskName}</span>
                                  </div>
                                )}
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmt(act.time)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

          </div>
        </div>{/* end RIGHT column */}

      </div>{/* end two-column layout */}

      {chatTask && <TaskChatPanel task={chatTask} onClose={() => setChatTask(null)} currentUser={member} team={[]} />}

      {/* ── Broadcast Read Modal ── */}
      {viewBroadcast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '18px 22px 14px', borderBottom: '1.5px solid #F0F2F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Send size={14} color="#7C3AED" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.5 }}>Update from Admin</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                    Sent to {viewBroadcast.to} · {new Date(viewBroadcast.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewBroadcast(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E8EAEF', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color="#6B7280" />
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1D2E', lineHeight: 1.3, marginBottom: 14 }}>{viewBroadcast.title}</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{viewBroadcast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Modal ── */}
      {modalTask && (() => {
        const t = modalTask;
        const mem = t.members.find(m => m.id === member.id);
        const overdueFlag = isOverdue(t);
        const isComplete  = t.stage === 'Complete' || mem?.stage === 'Complete';
        const days = daysLeft(t.deadline, t.extendedDeadline);
        const currentStage = mem?.stage || t.stage;
        // Members can only select: Issue, Review A, or Review B
        const allowedNext = ['Issue', 'Review A', 'Review B'].filter(s => {
          // Don't show current stage as an option
          if (s === currentStage) return false;
          return true;
        });
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

              {/* Modal header */}
              <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F0F2F8', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: isComplete ? '#ECFDF5' : overdueFlag ? '#FEF2F2' : STAGE_BG[currentStage], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isComplete ? <CheckCircle size={18} color="#12C479" strokeWidth={2.5} /> : overdueFlag ? <AlertCircle size={18} color="#EF4444" strokeWidth={2.5} /> : <Clock size={18} color={STAGE_COLORS[currentStage]} strokeWidth={2.5} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: isComplete ? '#12C479' : '#3B5BFC', padding: '2px 8px', borderRadius: 5 }}>{t.id}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1D2E' }}>{t.title}</span>
                    {t.category && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.category.bg, color: t.category.color, fontWeight: 700, border: `1px solid ${t.category.color}30`, flexShrink: 0, marginLeft: 4 }}>{t.category.emoji} {t.category.label}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: STAGE_BG[currentStage], color: STAGE_COLORS[currentStage] }}>{currentStage}</span>
                    <span style={{ fontSize: 12, color: overdueFlag ? '#EF4444' : days <= 2 ? '#F97316' : '#6B7280', fontWeight: 600 }}>
                      {isComplete ? new Date(t.paidOn || t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : overdueFlag ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? '🔥 Due today' : days === 1 ? '⏰ Due tomorrow' : `${t.extendedDeadline ? 'Extended: ' : 'Due '}${new Date(t.extendedDeadline || t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </span>
                    {t.tags && t.tags.map(tag => <span key={tag.label} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 600 }}>{tag.emoji} {tag.label}</span>)}
                  </div>
                </div>
                <button onClick={() => setModalTask(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F0F2F8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, color: '#6B7280' }}>✕</button>
              </div>

              {/* Modal body — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Overview */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Task Overview</div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>{t.description}</p>
                </div>

                {/* Private instructions */}
                {mem?.memberDesc && (
                  <div style={{ background: 'linear-gradient(135deg, #F0F4FF, #F5F3FF)', border: '1.5px solid #C7D4FF', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#3B5BFC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Instructions</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>{mem.memberDesc}</p>
                  </div>
                )}

                {/* Team */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Team</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {t.members.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: m.id === member.id ? '#EEF2FF' : '#F8F9FF', border: `1.5px solid ${m.id === member.id ? '#C7D4FF' : '#E8EAEF'}`, borderRadius: 10, padding: '7px 12px' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>{m.avatar}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D2E' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>{m.role}</div>
                        </div>
                        {m.id === member.id && <span style={{ fontSize: 9, color: '#3B5BFC', fontWeight: 800, background: '#EEF2FF', padding: '1px 6px', borderRadius: 5 }}>You</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scribes */}
                {(() => {
                  const taskScribes = (globalNotes || []).filter(n =>
                    n.taskId === t.id && (
                      n.assignMode === 'all' ||
                      (n.assignees || []).includes(String(member.id))
                    )
                  );
                  if (!taskScribes.length) return null;
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Scribes</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {taskScribes.map((s, i) => (
                          <button key={i} type="button"
                            onClick={() => { setModalTask(null); if (onNavigateToNotes) onNavigateToNotes(); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F5F3FF', borderRadius: 10, border: '1.5px solid #DDD6FE', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: s.type === 'sheet' ? '#ECFDF5' : '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #DDD6FE' }}>
                              {s.type === 'sheet'
                                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12C479" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{s.type === 'sheet' ? 'Sheet' : 'Note'} � Tap to open</div>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Stage workflow */}
                {!isComplete && (
                  <div style={{ padding: '14px 16px', background: '#FAFBFF', borderRadius: 12, border: '1.5px solid #F0F2F8' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Stage Workflow</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {STAGES.map((s, i, arr) => {
                        const curIdx = STAGES.indexOf(currentStage);
                        const sIdx   = STAGES.indexOf(s);
                        const isPast = sIdx < curIdx;
                        const isCur  = s === currentStage;
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPast ? '#12C479' : isCur ? '#3B5BFC' : '#F0F2F8', border: `2px solid ${isPast ? '#12C479' : isCur ? '#3B5BFC' : '#E8EAEF'}`, fontSize: 11, fontWeight: 800, color: isPast || isCur ? '#fff' : '#9CA3AF' }}>
                                {isPast ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: 9, fontWeight: isCur ? 800 : 500, color: isCur ? '#3B5BFC' : '#9CA3AF', marginTop: 4, whiteSpace: 'nowrap' }}>{s}</span>
                            </div>
                            {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: isPast ? '#12C479' : '#F0F2F8', marginBottom: 16, minWidth: 8 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Update stage */}
                {!isComplete && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1.5px solid #E8EAEF' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 2 }}>Update your stage</div>
                        {stageSelect[t.id] && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{STAGE_DESCRIPTIONS[stageSelect[t.id]]}</div>}
                      </div>
                      <select value={stageSelect[t.id] || ''} onChange={e => setStageSelect(prev => ({ ...prev, [t.id]: e.target.value }))}
                        style={{ height: 38, borderRadius: 10, border: `1.5px solid ${stageSelect[t.id] ? '#3B5BFC' : '#E8EAEF'}`, padding: '0 12px', fontSize: 12, fontWeight: 600, color: '#1A1D2E', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: 160 }}>
                        <option value="">Select new stage…</option>
                        {allowedNext.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button disabled={!stageSelect[t.id] || updating === t.id} onClick={() => handleStageUpdate(t)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: stageSelect[t.id] ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : '#F0F2F8', color: stageSelect[t.id] ? '#fff' : '#9CA3AF', fontSize: 12, fontWeight: 700, cursor: stageSelect[t.id] ? 'pointer' : 'default', boxShadow: stageSelect[t.id] ? '0 4px 12px rgba(59,91,252,0.3)' : 'none', transition: 'all 0.15s' }}>
                        {updating === t.id ? <><RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : 'Update Stage'}
                      </button>
                    </div>
                    
                    {/* Issue text box - only show when Issue stage is selected */}
                    {stageSelect[t.id] === 'Issue' && (
                      <div style={{ padding: '14px 16px', background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FED7D7' }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Describe the Issue *
                        </label>
                        <textarea
                          value={issueText[t.id] || ''}
                          onChange={e => setIssueText(prev => ({ ...prev, [t.id]: e.target.value }))}
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

                {isComplete && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F0FDF4', borderRadius: 12, border: '1.5px solid #BBF7D0' }}>
                    <CheckCircle size={20} color="#12C479" strokeWidth={2.5} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#12C479' }}>Task completed — great work!</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Your payment of ${mem?.budget?.toLocaleString()} is being processed</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Task Request Modal */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>New Task</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Submit a task to your admin</div>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#6B7280" />
              </button>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title *</label>
                <input 
                  value={requestTitle} 
                  onChange={e => setRequestTitle(e.target.value)} 
                  placeholder="Enter task title..."
                  style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} 
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                <textarea 
                  value={requestDescription} 
                  onChange={e => setRequestDescription(e.target.value)} 
                  placeholder="Describe what you need help with..." 
                  rows={4}
                  style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} 
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRequestModal(false)} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleRequestTask} 
                disabled={!requestTitle.trim()}
                style={{
                  padding: '11px 28px', 
                  border: 'none', 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontWeight: 700, 
                  cursor: requestTitle.trim() ? 'pointer' : 'not-allowed',
                  background: requestTitle.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)',
                  color: requestTitle.trim() ? '#fff' : 'var(--text-muted)',
                  boxShadow: requestTitle.trim() ? '0 6px 20px rgba(59,91,252,0.4)' : 'none',
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1001, background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1.5px solid #12C479', display: 'flex', alignItems: 'center', gap: 12, minWidth: 350 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={20} color="#12C479" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', marginBottom: 2 }}>Task Request Submitted</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Your request has been sent to the admin for review and approval.</div>
          </div>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} color="#9CA3AF" />
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
