import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notify } from '../lib/notify';

// ── Shared Constants ──────────────────────────────────────────────────────────
export const STAGES = ['New', 'Start', 'Issue', 'Review A', 'Review B', 'Update', 'Complete'];
export const STAGE_COLORS = { New: '#9CA3AF', Start: '#3B5BFC', Issue: '#EF4444', 'Review A': '#F97316', 'Review B': '#7C3AED', Update: '#D97706', Complete: '#12C479' };
export const STAGE_BG = { New: '#F3F4F6', Start: '#EEF2FF', Issue: '#FEF2F2', 'Review A': '#FFF7ED', 'Review B': '#F5F3FF', Update: '#FFFBEB', Complete: '#ECFDF5' };

export const TAGS = [];

export const CATEGORIES = [];

export const PERMISSION_GROUPS = [
  { category: 'Task Management',    color: '#3B5BFC', bg: '#EEF2FF', perms: ['Create tasks','View all tasks','View assigned tasks only','Edit task title','Edit task description','Edit task deadline','Edit task budget','Delete tasks','Update own stage','Update any stage','Complete tasks','Assign team members','Remove team members'] },
  { category: 'Team Management',    color: '#7C3AED', bg: '#F5F3FF', perms: ['Add team members','Edit team members','View all team members','View members on assigned tasks','Assign roles','Deactivate members','Delete members','View private admin notes'] },
  { category: 'Financial',          color: '#12C479', bg: '#ECFDF5', perms: ['View all financials','View own payments only','View team payments','View task budgets','Edit budgets','Process payments','Generate financial reports','Export payment data'] },
  { category: 'System',             color: '#F97316', bg: '#FFF7ED', perms: ['Create roles','Edit roles','Delete roles','Manage permissions','System settings','View audit logs'] },
  { category: 'Dashboard & Reports',color: '#06B6D4', bg: '#ECFEFF', perms: ['View own dashboard','View admin dashboard','View own analytics','View team analytics','Generate reports'] },
  { category: 'Notifications',      color: '#EF4444', bg: '#FEF2F2', perms: ['Receive task notifications','Receive payment notifications','Receive team notifications','Receive system notifications'] },
];

const ADMIN_PERMS = Object.fromEntries(PERMISSION_GROUPS.map(g => [g.category, [...g.perms]]));

// User accounts for login
export const USERS = [
  { email: 'admin@taskzy.io', password: 'admin123', role: 'admin', memberId: null },
  { email: 'adminuser@taskzy.io', password: 'admin123', role: 'admin', memberId: null },
  { email: 'sarah@taskzy.io', password: 'sarah123', role: 'management', memberId: 1 },
  { email: 'marcus@taskzy.io', password: 'marcus123', role: 'member', memberId: 2 },
  { email: 'teammembera@taskzy.io', password: 'member123', role: 'member', memberId: 3 },
  { email: 'managementz@taskzy.io', password: 'management123', role: 'management', memberId: 4 },
];

// Initial roles with default Admin role
export const INITIAL_ROLES = [
  { 
    id: 1, 
    name: 'Admin', 
    description: 'Full system access with all permissions granted. Can manage users, roles, tasks, and system settings.', 
    color: '#7C3AED', 
    roleType: 'Admin', 
    members: 1, 
    permissions: ADMIN_PERMS 
  },
];
export const ADMIN_A_ROLES = [
  { id: 1,  name: 'Admin',            description: 'Full system access — all permissions granted',          color: '#3B5BFC', roleType: 'Management',  members: 1, permissions: ADMIN_PERMS },
];

const INITIAL_TEAM = [
  { id: 1, name: 'Sarah Johnson', role: 'Project Manager', email: 'sarah@taskzy.io', avatar: 'SJ', color: '#7C3AED', status: 'Active', joinedDate: new Date('2024-01-15'), desc: 'Experienced project manager with 8+ years in tech' },
  { id: 2, name: 'Marcus Chen', role: 'Senior Developer', email: 'marcus@taskzy.io', avatar: 'MC', color: '#12C479', status: 'Active', joinedDate: new Date('2024-02-01'), desc: 'Full-stack developer specializing in React and Node.js' },
  { id: 3, name: 'Team Member A', role: 'Team Member', email: 'teammembera@taskzy.io', avatar: 'TA', color: '#F97316', status: 'Active', joinedDate: new Date('2024-02-15'), desc: 'Dedicated team member contributing to various projects' },
  { id: 4, name: 'Management Z', role: 'Management', email: 'managementz@taskzy.io', avatar: 'MZ', color: '#06B6D4', status: 'Active', joinedDate: new Date('2024-03-01'), desc: 'Management team member overseeing operations' },
];

const INITIAL_TASKS = [];

const INITIAL_BROADCASTS = [];

const INITIAL_ACTIVITY = [];

const INITIAL_HELP_SUBMISSIONS = [];

const INITIAL_TASK_REQUESTS = [];

// ── Context ────────────────────────────────────────────────────────────────────
// ── Context ────────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

// ── Mock task-linked scribes ──────────────────────────────────────────────────
const INITIAL_TASK_SCRIBES = [];

export function AppProvider({ children }) {
  // Check logged in user email
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  
  // Determine current user based on email
  const getCurrentUserProfile = () => {
    switch(userEmail) {
      case 'adminuser@taskzy.io':
        return { name: 'Admin A', role: 'Administrator', avatar: 'AA', color: '#3B5BFC', userRole: 'admin' };
      case 'sarah@taskzy.io':
        return { name: 'Sarah', role: 'Management', avatar: 'S', color: '#7C3AED', userRole: 'management' };
      case 'marcus@taskzy.io':
        return { name: 'Marcus', role: 'Developer', avatar: 'M', color: '#12C479', userRole: 'member' };
      case 'teammembera@taskzy.io':
        return { name: 'Team Member A', role: 'Team Member', avatar: 'TA', color: '#F97316', userRole: 'member' };
      case 'managementz@taskzy.io':
        return { name: 'Management Z', role: 'Management', avatar: 'MZ', color: '#06B6D4', userRole: 'management' };
      default:
        return { name: 'Admin', role: 'Administrator', avatar: 'A', color: '#3B5BFC', userRole: 'admin' };
    }
  };
  
  const [currentUser, setCurrentUser] = useState(getCurrentUserProfile());
  
  // Data loading state - tracks if initial data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Initialize data — team members are real accounts, tasks/activity start with mock data
  const [tasks, setTasks]   = useState(INITIAL_TASKS);
  const [team, setTeam]     = useState(INITIAL_TEAM);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [taskRequests, setTaskRequests] = useState([]);
  const [trashedItems, setTrashedItems] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [helpSubmissions, setHelpSubmissions] = useState([]);
  const [unreadDescMembers, setUnreadDescMembers] = useState(new Set());
  const [roles, setRoles]   = useState(INITIAL_ROLES);
  const [notes, setNotes]   = useState(INITIAL_TASK_SCRIBES); // Global notes/scribes created from tasks
  const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS); // Team updates/announcements

  const updateBroadcast = useCallback((id, updates) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    // Also update in activity feed
    setActivity(prev => prev.map(a => a.id === id ? { ...a, title: updates.title ?? a.title, sub: updates.sub ?? a.sub } : a));
  }, []);

  const updateNote = useCallback((noteId, updates) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n));
  }, []);

  const deleteNote = useCallback((noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });
  const [currentPlan, setCurrentPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentPlan') || 'null'); } catch { return null; }
  });
  const [planExpiryDate, setPlanExpiryDate] = useState(() => {
    try { return localStorage.getItem('planExpiryDate') || 'Jan 15, 2025'; } catch { return 'Jan 15, 2025'; }
  });
  const isPlanActive = !planExpiryDate || new Date(planExpiryDate) >= new Date();
  const [planAlertBlink, setPlanAlertBlink] = useState(false);
  const triggerPlanBlink = useCallback(() => {
    setPlanAlertBlink(true);
    setTimeout(() => setPlanAlertBlink(false), 1500);
  }, []);

  const [showDonutWelcome, setShowDonutWelcome] = useState(false); // Start as false, only show when explicitly triggered
  const [hasSeenDonutWelcome, setHasSeenDonutWelcome] = useState(() => {
    try {
      return localStorage.getItem('hasSeenDonutWelcome') === 'true';
    } catch {
      return false;
    }
  });
  
  // Save to localStorage when donut welcome is shown and then hidden
  useEffect(() => {
    if (!showDonutWelcome && hasSeenDonutWelcome === false) {
      // Check if it was shown in this session
      const wasShown = sessionStorage.getItem('donutWelcomeShown');
      if (wasShown === 'true') {
        try {
          localStorage.setItem('hasSeenDonutWelcome', 'true');
          setHasSeenDonutWelcome(true);
        } catch {}
      }
    } else if (showDonutWelcome) {
      // Mark that it's being shown in this session
      sessionStorage.setItem('donutWelcomeShown', 'true');
    }
  }, [showDonutWelcome, hasSeenDonutWelcome]);
  const [adminPassword, setAdminPassword] = useState(() => {
    try { return localStorage.getItem('adminPassword') || 'admin123'; } catch { return 'admin123'; }
  });

  const updateAdminPassword = useCallback((newPwd) => {
    setAdminPassword(newPwd);
    try { localStorage.setItem('adminPassword', newPwd); } catch {}
  }, []);

  // Migrate existing tasks to have createdDate and history
  useEffect(() => {
    setTasks(prev => {
      const needsMigration = prev.some(task => !task.history || !task.createdDate);
      if (!needsMigration) return prev;
      
      return prev.map(task => {
        if (!task.history || !task.createdDate) {
          const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
          return {
            ...task,
            createdDate: task.createdDate || createdDate,
            history: task.history || [
              {
                stage: 'New',
                date: createdDate,
                user: 'Admin',
                action: 'created',
              }
            ]
          };
        }
        return task;
      });
    });
  }, []);

  // Simulate initial data loading - mark as loaded after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoaded(true);
    }, 1000); // 1 second delay for initial load
    return () => clearTimeout(timer);
  }, []);

  // Refresh data function - updates data without showing skeleton
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    // In a real app, this would fetch fresh data from API
    // For now, it just triggers a re-render to simulate data refresh
  }, []);

  useEffect(() => {
    try { localStorage.setItem('darkMode', darkMode); } catch {}
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(v => !v), []);

  // ── Activity helpers ─────────────────────────────────────────────────────
  const addActivity = useCallback((type, title, sub, amount = null, up = null, broadcastId = null) => {
    setActivity(prev => [{
      id: broadcastId || Date.now(),
      type, title, sub, amount, up,
      time: new Date(),
    }, ...prev.slice(0, 19)]);
  }, []);

  // Format time as relative string (e.g., "2 mins ago", "3 hours ago")
  const fmt = useCallback((date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  }, []);

  // ── Task actions ─────────────────────────────────────────────────────────
  const createTask = useCallback((task, createdBy = null) => {
    const now = new Date();
    const actor = createdBy ? createdBy.name : 'Admin';
    const source = createdBy?.source ? ` via ${createdBy.source}` : '';
    const taskWithHistory = {
      ...task,
      paid: false,
      createdDate: now,
      history: [
        {
          stage: task.stage || 'New',
          date: now,
          user: actor,
          action: 'created',
          note: source || undefined,
        }
      ]
    };
    setTasks(prev => [taskWithHistory, ...prev]);

    // Auto-create scribes as notes if task has scribes attached
    if (task.scribes && task.scribes.length > 0) {
      const newNotes = task.scribes.map(scribe => {
        // Resolve which member IDs get access based on assignMode
        let resolvedMembers = [];
        if (scribe.assignMode === 'all' || !scribe.assignMode) {
          resolvedMembers = (task.members || []).map(m => m.id);
        } else {
          resolvedMembers = (scribe.assignees || []).map(id => parseInt(id)).filter(Boolean);
        }
        return {
          id: Date.now() + Math.random(),
          type: scribe.type || 'note',
          title: scribe.title,
          tags: [],
          date: now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          body: '',
          archived: false,
          joinCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
          taskId: task.id,
          taskTitle: task.title,
          assignees: scribe.assignees || [],
          assignMode: scribe.assignMode || 'all',
          members: resolvedMembers, // joined members — used for access & display
          createdBy: actor,
        };
      });
      setNotes(prev => [...newNotes, ...prev]);
    }

    addActivity('new', 'Task Created', `${task.id} — ${task.title}`);
    notify.taskCreated(`${task.id} — ${task.title}`);
  }, [addActivity]);

  const updateTaskNote = useCallback((taskId, note) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, note } : t));
  }, []);

  const updateTask = useCallback((taskId, updatedTask, editedBy = null) => {
    const actor = editedBy ? editedBy.name : 'Admin';
    const now = new Date();
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, ...updatedTask,
      history: [...(t.history || []), { stage: t.stage, date: now, user: actor, action: 'edit' }],
    } : t));
    addActivity('edit', 'Task Updated', `${taskId} — ${updatedTask.title}`);
    notify.taskUpdated(`${taskId} — ${updatedTask.title}`);
  }, [addActivity]);

  // Update the whole task stage (admin bulk action) AND optionally a specific member's stage
  const updateTaskStage = useCallback((taskId, newStage, memberId = null, actorName = null, issueNote = null) => {
    const task = tasks.find(t => t.id === taskId);
    const now = new Date();

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      
      const historyEntry = {
        stage: newStage,
        date: now,
        user: actorName || (memberId ? (t.members.find(m => m.id === memberId)?.name || 'Member') : 'Admin'),
        action: 'updated',
        note: issueNote || undefined,
      };
      
      const updatedHistory = [...(t.history || []), historyEntry];
      
      // Store issue note if provided
      const updatedIssueNote = issueNote ? issueNote : t.issueNote;
      
      if (memberId !== null) {
        // Update only a specific member's stage
        const updatedMembers = t.members.map(m => m.id === memberId ? { ...m, stage: newStage } : m);
        // Task's overall stage = the highest/most advanced stage among members
        // For simplicity, derive task stage from majority/highest member stage
        const stageOrder = ['New', 'Start', 'Issue', 'Review A', 'Review B', 'Update', 'Complete'];
        const stages = updatedMembers.map(m => m.stage);
        // Use the most recent/active stage - take the lowest-indexed (least advanced) to show work still in progress
        const minIdx = Math.min(...stages.map(s => stageOrder.indexOf(s)));
        const taskStage = stageOrder[minIdx] || t.stage;
        const isPaid = taskStage === 'Complete';
        return { ...t, stage: taskStage, paid: t.paid || isPaid, members: updatedMembers, history: updatedHistory, issueNote: updatedIssueNote };
      } else {
        // Bulk update all members (skip members on hold)
        const isPaid = newStage === 'Complete';
        return { 
          ...t, 
          stage: newStage, 
          paid: t.paid || isPaid, 
          members: t.members.map(m => m.isOnHold ? m : { ...m, stage: newStage }), 
          history: updatedHistory,
          issueNote: updatedIssueNote
        };
      }
    }));

    // Show toast notification for stage updates
    if (task) {
      const memberName = memberId ? task.members.find(m => m.id === memberId)?.name : null;
      const description = memberName 
        ? `${memberName} updated ${taskId} to ${newStage}`
        : `${taskId} — ${task.title}`;
      
      notify.taskStage(newStage, description);
    }

    if (newStage === 'Complete') {
      if (task) addActivity('complete', 'Task Completed', `${taskId} — ${task.title}`, `+₹ ${task.totalBudget.toLocaleString()}`, true);
    } else if (newStage === 'Review A' || newStage === 'Review B') {
      if (task) addActivity('review', 'Submitted for Review', `${taskId} — ${task.title}`);
    } else if (newStage === 'Update') {
      if (task) addActivity('update', 'Update Requested', `${taskId} — ${task.title}`);
    } else if (newStage === 'Issue') {
      if (task) addActivity('issue', 'Issue Reported', `${taskId} — ${task.title}`);
    } else if (newStage === 'Start') {
      if (task) addActivity('start', 'Task Started', `${taskId} — ${task.title}`);
    }
  }, [tasks, addActivity]);

  const deleteTask = useCallback((taskId, deletedBy = null) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (task) {
      setTrashedItems(prev => [{ ...task, _trashType: 'task', _deletedBy: deletedBy, _deletedAt: new Date() }, ...prev]);
      addActivity('delete', 'Task Deleted', `${taskId} — ${task.title}`);
      notify.taskDeleted(`${taskId} moved to archive`);
    }
  }, [tasks, addActivity]);

  const pauseTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const now = new Date();
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      paused: true,
      pausedOn: now,
      history: [...(t.history || []), { stage: t.stage, date: now, user: 'Admin', action: 'paused' }],
    } : t));
    if (task) {
      addActivity('pause', 'Task On Hold', `${taskId} — ${task.title}`);
      notify.taskPaused(`${taskId} — ${task.title}`);
    }
  }, [tasks, addActivity]);

  const resumeTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const now = new Date();
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      paused: false,
      pausedOn: null,
      history: [...(t.history || []), { stage: t.stage, date: now, user: 'Admin', action: 'resumed' }],
    } : t));
    if (task) {
      addActivity('resume', 'Task Activated', `${taskId} — ${task.title}`);
      notify.taskResumed(`${taskId} — ${task.title}`);
    }
  }, [tasks, addActivity]);

  const markTaskPaid = useCallback((taskId, paidBy = null, source = null) => {
    const task = tasks.find(t => t.id === taskId);
    const now = new Date();
    const actor = paidBy ? paidBy.name : 'Admin';
    const historyEntry = {
      stage: 'Complete',
      date: now,
      user: actor,
      action: 'paid',
      note: source || undefined,
    };
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          stage: 'Complete',
          paid: true,
          paidOn: now,
          members: t.members.map(m => ({ ...m, stage: 'Complete' })),
          history: [...(t.history || []), historyEntry]
        };
      }
      return t;
    }));
    if (task) {
      addActivity('payment', 'Payment Processed', `${taskId} — ${task.title}`, `+₹ ${task.totalBudget.toLocaleString()}`, true);
      notify.paymentProcessed(`₹ ${task.totalBudget.toLocaleString()} — ${task.title}`);
    }
  }, [tasks, addActivity]);

  // ── Team actions ─────────────────────────────────────────────────────────
  const saveMember = useCallback((member, addedBy = null) => {
    setTeam(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) {
        const old = prev.find(m => m.id === member.id);
        if (old.desc !== member.desc) {
          setUnreadDescMembers(s => new Set([...s, member.id]));
        }
        addActivity('edit', 'Member Updated', `${member.name} — ${member.role}`);
        notify.memberUpdated(`${member.name} — ${member.role}`);
        return prev.map(m => m.id === member.id ? member : m);
      } else {
        const newMember = addedBy ? { ...member, addedBy } : member;
        addActivity('member', 'Member Added', `${member.name} — ${member.role}`);
        notify.memberAdded(`${member.name} joined as ${member.role}`);
        return [...prev, newMember];
      }
    });
  }, [addActivity]);

  const markDescRead = useCallback((memberId) => {
    setUnreadDescMembers(s => { const n = new Set(s); n.delete(memberId); return n; });
  }, []);

  const toggleMemberStatus = useCallback((memberId) => {
    setTeam(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const newStatus = m.status === 'Active' ? 'Inactive' : 'Active';
      addActivity(newStatus === 'Inactive' ? 'deactivate' : 'activate',
        newStatus === 'Inactive' ? 'Member Deactivated' : 'Member Activated',
        `${m.name} — ${m.role}`);
      if (newStatus === 'Active') notify.memberActivated(`${m.name} is now active`);
      else notify.memberDeactivated(`${m.name} is now inactive`);
      return { ...m, status: newStatus };
    }));
  }, [addActivity]);

  // ── Derived financial data ────────────────────────────────────────────────
  const financials = (() => {
    const totalInvestment = tasks.reduce((s, t) => s + t.totalBudget, 0);
    const moneyPaid = tasks.filter(t => t.paid || t.stage === 'Complete').reduce((s, t) => s + t.totalBudget, 0);
    const moneyDue = totalInvestment - moneyPaid;
    const paidRate = totalInvestment ? Math.round((moneyPaid / totalInvestment) * 100) : 0;

    // Member earnings derived from tasks
    const memberEarningsMap = {};
    tasks.forEach(task => {
      task.members.forEach(m => {
        if (!memberEarningsMap[m.id]) {
          memberEarningsMap[m.id] = { id: m.id, name: m.name, avatar: m.avatar, color: m.color, total: 0, paid: 0, pending: 0 };
        }
        memberEarningsMap[m.id].total += m.budget;
        if (task.paid || task.stage === 'Complete') memberEarningsMap[m.id].paid += m.budget;
        else memberEarningsMap[m.id].pending += m.budget;
      });
    });
    const memberEarnings = Object.values(memberEarningsMap).sort((a, b) => b.total - a.total);

    return { totalInvestment, moneyPaid, moneyDue, paidRate, memberEarnings };
  })();

  // ── Dashboard stats ────────────────────────────────────────────────────────
  const dashStats = {
    activeTasks: tasks.filter(t => t.stage !== 'Complete').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.stage === 'Complete').length,
    teamMembers: team.length,
    activeMembers: team.filter(m => m.status === 'Active').length,
    totalInvestment: financials.totalInvestment,
    moneyDue: financials.moneyDue,
    reviewPending: tasks.filter(t => t.stage === 'Review').length,
    stageBreakdown: STAGES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.stage === s).length }), {}),
  };

  // ── Task Request actions ─────────────────────────────────────────────────
  const addTaskRequest = useCallback((request) => {
    setTaskRequests(prev => [{ ...request, id: Date.now(), timestamp: new Date(), status: 'pending' }, ...prev]);
  }, []);

  const approveTaskRequest = useCallback((requestId, approvedBy = null) => {
    setTaskRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved', isCreated: true, approvedBy } : r));
  }, []);

  const completeTaskRequest = useCallback((requestId, approvedBy = null) => {
    setTaskRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed', isComplete: true, approvedBy: r.approvedBy || approvedBy } : r));
  }, []);

  const addTaskHistoryEntry = useCallback((taskId, entry) => {
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, history: [...(t.history || []), entry] }
      : t
    ));
  }, []);

  const addScheduledTask = useCallback((task) => {
    setScheduledTasks(prev => [{ ...task, isScheduled: true, createdAt: new Date() }, ...prev]);
    notify.taskScheduled(`${task.id} — ${task.title}`);
  }, []);

  const removeScheduledTask = useCallback((taskId) => {
    setScheduledTasks(prev => prev.filter(t => t.id !== taskId));
    notify.taskUnscheduled();
  }, []);

  const addToTrash = useCallback((item) => {
    setTrashedItems(prev => [{ ...item, _deletedAt: new Date() }, ...prev]);
  }, []);

  const restoreFromTrash = useCallback((itemId) => {
    const item = trashedItems.find(i => i.id === itemId);
    if (!item) return;
    if (item._trashType === 'task') {
      const { _trashType, _deletedBy, _deletedAt, ...task } = item;
      setTasks(prev => [task, ...prev]);
    }
    setTrashedItems(prev => prev.filter(i => i.id !== itemId));
    notify.itemRestored(item.title || 'Item moved back');
  }, [trashedItems]);

  const permanentlyDelete = useCallback((itemId) => {
    setTrashedItems(prev => prev.filter(i => i.id !== itemId));
    notify.itemDeleted();
  }, []);

  const clearTrash = useCallback(() => {
    setTrashedItems([]);
    notify.archiveCleared();
  }, []);

  const deleteTaskRequest = useCallback((requestId) => {
    setTaskRequests(prev => prev.filter(r => r.id !== requestId));
    notify.requestDismissed();
  }, []);

  // Provide TAGS and CATEGORIES for all users
  const contextTags = TAGS;
  const contextCategories = CATEGORIES;

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      tasks, team, activity, financials, dashStats, taskRequests, scheduledTasks, trashedItems, roles,
      notes, setNotes, updateNote, deleteNote,
      broadcasts, setBroadcasts, updateBroadcast,
      helpSubmissions, setHelpSubmissions,
      unreadDescMembers, markDescRead,
      createTask, updateTask, updateTaskNote, updateTaskStage, deleteTask, markTaskPaid, pauseTask, resumeTask, addTaskHistoryEntry,
      saveMember, toggleMemberStatus,
      saveRoles: setRoles,
      addTaskRequest, approveTaskRequest, completeTaskRequest, deleteTaskRequest, addScheduledTask, removeScheduledTask, addToTrash, restoreFromTrash, permanentlyDelete, clearTrash,
      addActivity, fmt,
      STAGES, STAGE_COLORS, STAGE_BG, TAGS: contextTags, CATEGORIES: contextCategories, PERMISSION_GROUPS,
      darkMode, toggleDarkMode,
      currentPlan, setCurrentPlan,
      planExpiryDate, setPlanExpiryDate, isPlanActive, planAlertBlink, triggerPlanBlink,
      showDonutWelcome, setShowDonutWelcome,
      adminPassword, updateAdminPassword,
      dataLoaded, // Export data loading state
      refreshData, // Export refresh function
      refreshTrigger, // Export refresh trigger for components to react to
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
