import { useState, useRef } from 'react';
import { TrendingUp, Calendar, Wallet, CheckCircle, Clock, Users, AlertCircle, BarChart2, ChevronDown, X } from 'lucide-react';
import CustomerGrowth from '../components/CustomerGrowth';
import CustomerHabitsChart from '../components/BarChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Line as ChartJSLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const DATE_RANGES = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year',    value: 'year' },
];

// Generate real revenue data from tasks
const generateRevenueData = (tasks, range) => {
  const now = new Date();
  let periods = [];
  
  if (range === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      periods.push({
        label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
        start: new Date(d.setHours(0,0,0,0)),
        end: new Date(d.setHours(23,59,59,999))
      });
    }
  } else if (range === '30d') {
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i * 7 + 6));
      const end = new Date(now);
      end.setDate(now.getDate() - (i * 7));
      periods.push({ label: `W${5-i}`, start, end });
    }
  } else if (range === 'quarter') {
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      periods.push({
        label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()],
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0)
      });
    }
  } else { // year
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      periods.push({
        label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()],
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0)
      });
    }
  }
  
  return periods.map(p => {
    const periodTasks = tasks.filter(t => {
      const date = new Date(t.createdDate || t.deadline);
      return date >= p.start && date <= p.end;
    });
    const revenue = periodTasks.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
    const target = revenue * 0.85; // Target is 85% of actual
    return { month: p.label, revenue, target };
  });
};

// Generate team performance data from real tasks
const generateTeamData = (tasks) => {
  const categories = {};
  tasks.forEach(t => {
    const cat = t.category?.label || 'Other';
    const color = t.category?.color || '#C7D4FF';
    if (!categories[cat]) {
      categories[cat] = { name: cat, total: 0, completed: 0, color };
    }
    categories[cat].total++;
    if (t.stage === 'Complete') categories[cat].completed++;
  });
  
  return Object.values(categories).map(c => ({
    name: c.name,
    score: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    color: c.color
  })).sort((a, b) => b.score - a.score);
};

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1D2E', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {'\u20B9'}{(p.value / 1000).toFixed(0)}k
        </p>
      ))}
    </div>
  );
}

export default function PerformancePage() {
  // Check if Admin A is logged in
  const isAdminA = typeof window !== 'undefined' && localStorage.getItem('userEmail') === 'adminuser@taskzy.io';
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [activeRange, setActiveRange] = useState('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [budgetView, setBudgetView] = useState('tag');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagRef = useRef(null);
  const { tasks, team, dashStats, financials } = useApp();

  const handleRangePill = (value) => {
    if (activeRange === value) {
      setActiveRange(''); setDateFrom(''); setDateTo('');
      return;
    }
    setActiveRange(value);
    const now = new Date();
    if (value === '7d') {
      const d = new Date(now); d.setDate(now.getDate() - 7);
      setDateFrom(d.toISOString().split('T')[0]); setDateTo(now.toISOString().split('T')[0]);
    } else if (value === '30d') {
      const d = new Date(now); d.setDate(now.getDate() - 30);
      setDateFrom(d.toISOString().split('T')[0]); setDateTo(now.toISOString().split('T')[0]);
    } else if (value === 'quarter') {
      const d = new Date(now); d.setMonth(now.getMonth() - 3);
      setDateFrom(d.toISOString().split('T')[0]); setDateTo(now.toISOString().split('T')[0]);
    } else if (value === 'year') {
      const d = new Date(now); d.setFullYear(now.getFullYear() - 1);
      setDateFrom(d.toISOString().split('T')[0]); setDateTo(now.toISOString().split('T')[0]);
    }
  };

  const overdueTasks   = tasks.filter(t => new Date(t.deadline) < new Date() && t.stage !== 'Complete').length;
  const completionRate = dashStats.totalTasks ? Math.round((dashStats.completedTasks / dashStats.totalTasks) * 100) : 0;
  const activeMembers  = team.filter(m => m.status === 'Active').length;

  // collect unique tags and categories from all tasks
  const allTags = [];
  const allCats = [];
  tasks.forEach(t => {
    (t.tags || []).forEach(tag => {
      if (!allTags.find(x => x.label === tag.label)) allTags.push({ label: tag.label, color: tag.color });
    });
    const cat = t.category?.label;
    if (cat && !allCats.find(x => x.label === cat)) allCats.push({ label: cat, color: t.category.color });
  });

  // filtered tasks based on selections
  const filteredTasks = tasks.filter(t => {
    const tagMatch = selectedTags.length === 0 || (t.tags || []).some(tag => selectedTags.includes(tag.label));
    const catMatch = selectedCats.length === 0 || selectedCats.includes(t.category?.label);
    return tagMatch && catMatch;
  });

  // Investment Trend — one line per tag or category, budget by month
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const hasRealData = allTags.length > 0 || allCats.length > 0;
  const trendKeys = budgetView === 'tag' ? allTags : allCats;

  // Build real trend data from actual tasks
  const now = new Date();
  const fullTrendData = (() => {
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const entry = { month: MONTHS[d.getMonth()] };
      const monthTasks = filteredTasks.filter(t => {
        const date = new Date(t.createdDate || t.deadline);
        return date >= monthStart && date <= monthEnd;
      });
      trendKeys.forEach(key => {
        if (budgetView === 'tag') {
          entry[key.label] = monthTasks
            .filter(t => (t.tags || []).some(tag => tag.label === key.label))
            .reduce((s, t) => s + (t.totalBudget || 0), 0);
        } else {
          entry[key.label] = monthTasks
            .filter(t => t.category?.label === key.label)
            .reduce((s, t) => s + (t.totalBudget || 0), 0);
        }
      });
      months.push(entry);
    }
    return months;
  })();

  // Filter data based on date range if custom dates are selected
  let trendData = fullTrendData;
  if (dateFrom && dateTo) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth()) + 1;
    trendData = fullTrendData.slice(-Math.min(monthsDiff, fullTrendData.length));
  }
  
  const activeRangeLabel = DATE_RANGES.find(r => r.value === activeRange)?.label || 'Custom';

  // Budget split donut — by tag (weighted by position: first tag gets more)
  const tagMap = {};
  const catMap = {};
  filteredTasks.forEach(t => {
    const budget = t.totalBudget || 0;
    if (t.tags && t.tags.length > 0) {
      // weights: 1st = n, 2nd = n-1, ... last = 1, then normalize
      const n = t.tags.length;
      const totalWeight = (n * (n + 1)) / 2;
      t.tags.forEach((tag, idx) => {
        const weight = (n - idx) / totalWeight;
        if (!tagMap[tag.label]) tagMap[tag.label] = { name: tag.label, value: 0, color: tag.color };
        tagMap[tag.label].value += budget * weight;
      });
    } else {
      if (!tagMap['Other']) tagMap['Other'] = { name: 'Other', value: 0, color: '#C7D4FF' };
      tagMap['Other'].value += budget;
    }
    // by category — weighted: tasks with more tags give less to category
    const cat = t.category?.label || 'Other';
    const color = t.category?.color || '#C7D4FF';
    if (!catMap[cat]) catMap[cat] = { name: cat, value: 0, color };
    const tagCount = t.tags?.length || 1;
    const catWeight = tagCount / (tagCount + 1); // more tags = slightly less to category
    catMap[cat].value += budget * catWeight;
  });
  const sourceMap = budgetView === 'tag' ? tagMap : catMap;
  const totalBudget = Object.values(sourceMap).reduce((s, c) => s + c.value, 0);
  const spendData = Object.values(sourceMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(c => ({ ...c, pct: totalBudget ? Math.round((c.value / totalBudget) * 100) : 0 }));

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>

      {/* Date Range Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {DATE_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => handleRangePill(range.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: activeRange === range.value ? 'none' : '1.5px solid var(--border)',
                  background: activeRange === range.value ? '#3B5BFC' : 'var(--bg-surface)',
                  color: activeRange === range.value ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >{range.label}</button>
            ))}
          </div>
          <div style={{ height: 28, width: 1, background: 'var(--border)' }} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDatePicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${(dateFrom || dateTo) ? '#3B5BFC' : 'var(--border)'}`,
                background: (dateFrom || dateTo) ? '#EEF2FF' : 'var(--bg-surface)',
              }}
            >
              <Calendar size={14} color={(dateFrom || dateTo) ? '#3B5BFC' : 'var(--text-muted)'} />
              {(dateFrom || dateTo) && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#3B5BFC' }}>
                  {dateFrom && new Date(dateFrom + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {dateFrom && dateTo && ' – '}
                  {dateTo && new Date(dateTo + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </button>
            {showDatePicker && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 100,
                background: 'var(--bg-surface)', borderRadius: 12, padding: '14px 16px',
                border: '1.5px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>From (Month)</span>
                  <input type="month" value={tempDateFrom} onChange={e => setTempDateFrom(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-subtle)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>To (Month)</span>
                  <input type="month" value={tempDateTo} onChange={e => setTempDateTo(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-subtle)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); setTempDateFrom(''); setTempDateTo(''); setActiveRange(''); setShowDatePicker(false); }}
                      style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => { setDateFrom(tempDateFrom); setDateTo(tempDateTo); setActiveRange(''); setShowDatePicker(false); }}
                    disabled={!tempDateFrom && !tempDateTo}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: (tempDateFrom || tempDateTo) ? '#3B5BFC' : 'var(--bg-subtle)', color: (tempDateFrom || tempDateTo) ? '#fff' : 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: (tempDateFrom || tempDateTo) ? 'pointer' : 'default' }}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Tag / Category toggle + merged filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>View by</span>

          {/* Toggle + Filter merged into one pill group */}
          <div ref={tagRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg-surface)', borderRadius: 10, padding: 3, border: `1.5px solid ${(selectedTags.length + selectedCats.length) > 0 ? '#3B5BFC' : 'var(--border)'}`, alignItems: 'center' }}>
              {['tag', 'category'].map(v => (
                <button key={v} onClick={() => setBudgetView(v)} style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: budgetView === v ? '#3B5BFC' : 'transparent',
                  color: budgetView === v ? '#fff' : 'var(--text-secondary)',
                  boxShadow: budgetView === v ? '0 2px 8px rgba(59,91,252,0.25)' : 'none',
                  transition: 'all 0.15s', textTransform: 'capitalize',
                }}>{v}</button>
              ))}

              {/* Divider */}
              <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />

              {/* Arrow / filter indicator — click to toggle */}
              <button onClick={() => setShowTagDropdown(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', border: 'none', background: showTagDropdown ? 'var(--bg-subtle)' : 'transparent' }}>
                {(selectedTags.length + selectedCats.length) > 0 && (
                  <span style={{ background: '#3B5BFC', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                    {selectedTags.length + selectedCats.length}
                  </span>
                )}
                <ChevronDown size={12} color={showTagDropdown ? '#3B5BFC' : 'var(--text-muted)'} style={{ transition: 'transform 0.2s', transform: showTagDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
            </div>

            {showTagDropdown && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--bg-surface)', borderRadius: 12, border: '1.5px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, padding: 8 }}>
                {(selectedTags.length + selectedCats.length) > 0 && (
                  <button onClick={() => { setSelectedTags([]); setSelectedCats([]); }} style={{ width: '100%', padding: '6px 10px', background: '#FEF2F2', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#EF4444', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={11} /> Clear all
                  </button>
                )}
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Tags column */}
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 10px 6px' }}>Tags</div>
                    {allTags.map(tag => {
                      const checked = selectedTags.includes(tag.label);
                      return (
                        <div key={tag.label} onClick={() => setSelectedTags(prev => checked ? prev.filter(t => t !== tag.label) : [...prev, tag.label])}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: checked ? '#EEF2FF' : 'transparent' }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#3B5BFC' : 'var(--border)'}`, background: checked ? '#3B5BFC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                            {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{tag.label}</span>
                        </div>
                      );
                    })}
                    {allTags.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 10px' }}>No tags</div>}
                  </div>
                  <div style={{ width: 1, background: 'var(--border-light)', margin: '0 4px' }} />
                  {/* Category column */}
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 10px 6px' }}>Category</div>
                    {allCats.map(cat => {
                      const checked = selectedCats.includes(cat.label);
                      return (
                        <div key={cat.label} onClick={() => {
                          const newCats = checked ? selectedCats.filter(c => c !== cat.label) : [...selectedCats, cat.label];
                          setSelectedCats(newCats);
                          const tagsFromCats = new Set();
                          tasks.forEach(t => {
                            if (newCats.includes(t.category?.label)) (t.tags || []).forEach(tag => tagsFromCats.add(tag.label));
                          });
                          setSelectedTags(prev => [...new Set([...prev, ...tagsFromCats])]);
                        }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: checked ? '#F5F3FF' : 'transparent' }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#7C3AED' : 'var(--border)'}`, background: checked ? '#7C3AED' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                            {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.label}</span>
                        </div>
                      );
                    })}
                    {allCats.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 10px' }}>No categories</div>}
                  </div>
                </div>
                {allTags.length === 0 && allCats.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 10px' }}>No tags or categories found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Stat Cards — Finance + Tasks & Team */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>

        {/* Finance */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: '22px 24px', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={17} color="#3B5BFC" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Payment</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Budget overview</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
            {[
              { label: 'Total Invest', value: `₹${financials.totalInvestment.toLocaleString()}`, icon: Wallet,       color: '#3B5BFC', bg: '#EEF2FF' },
              { label: 'Paid',         value: `₹${financials.moneyPaid.toLocaleString()}`,        icon: CheckCircle, color: '#12C479', bg: '#ECFDF5' },
              { label: 'Pending',      value: `₹${financials.moneyDue.toLocaleString()}`,         icon: Clock,       color: '#F97316', bg: '#FFF7ED' },
              { label: 'Paid Rate',    value: `${financials.paidRate}%`,                          icon: TrendingUp,  color: '#7C3AED', bg: '#F5F3FF' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon size={14} color={s.color} strokeWidth={2} />
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks & Team merged */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: '22px 24px', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={17} color="#12C479" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Tasks & Team</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress & members</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Tasks',     value: String(dashStats.totalTasks),     color: '#7C3AED', bg: '#EDE9FE', icon: BarChart2 },
              { label: 'Task Completed',  value: String(dashStats.completedTasks), color: '#0369A1', bg: '#E0F2FE', icon: CheckCircle },
              { label: 'Completion Rate', value: `${completionRate}%`,             color: '#B45309', bg: '#FEF3C7', icon: TrendingUp },
              { label: 'Overdate Tasks',   value: String(overdueTasks),             color: overdueTasks === 0 ? '#15803D' : '#B91C1C', bg: overdueTasks === 0 ? '#DCFCE7' : '#FEE2E2', icon: AlertCircle },
              { label: 'Team Members',    value: String(team.length),              color: '#0F766E', bg: '#CCFBF1', icon: Users },
              { label: 'Active',          value: String(activeMembers),            color: '#9333EA', bg: '#F3E8FF', icon: Users },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon size={14} color={s.color} strokeWidth={2} />
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Investment Trend + Budget Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div className="card animate-fade-slide" style={{ padding: '22px 24px', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Investment Trend</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Budget allocation over time by {budgetView === 'tag' ? 'tags' : 'categories'}
                {activeRange && ` · ${activeRangeLabel}`}
                {(dateFrom && dateTo) && ` · ${trendData.length} month${trendData.length > 1 ? 's' : ''}`}
                {(selectedTags.length > 0 || selectedCats.length > 0) && ` · ${selectedTags.length + selectedCats.length} filter${selectedTags.length + selectedCats.length > 1 ? 's' : ''} applied`}
              </p>
            </div>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {trendKeys.map(tag => (
              <div key={tag.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tag.label}</span>
              </div>
            ))}
          </div>
          
          {/* Chart.js Line Chart */}
          <div style={{ height: 200 }}>
            {trendKeys.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <TrendingUp size={28} color="var(--text-muted)" strokeWidth={1.5} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>No data yet</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Create tasks with tags or categories to see trends</div>
              </div>
            ) : (
            <ChartJSLine
              data={{
                labels: trendData.map(d => d.month),
                datasets: trendKeys.map(tag => ({
                  label: tag.label,
                  data: trendData.map(d => d[tag.label] || 0),
                  borderColor: tag.color,
                  backgroundColor: tag.color + '20',
                  borderWidth: 2.5,
                  tension: 0.4,
                  pointRadius: 0,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: tag.color,
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 2,
                }))
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1A1D2E',
                    bodyColor: '#6B7280',
                    borderColor: '#E5E7EB',
                    borderWidth: 1.5,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
                      },
                      footer: function(tooltipItems) {
                        const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                        return 'Total: ₹' + Math.round(total).toLocaleString();
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#9CA3AF',
                      font: {
                        size: 11,
                      }
                    }
                  },
                  y: {
                    grid: {
                      color: '#F3F4F6',
                      drawBorder: false,
                    },
                    ticks: {
                      color: '#9CA3AF',
                      font: {
                        size: 11,
                      },
                      callback: function(value) {
                        return '₹' + (value / 1000) + 'k';
                      }
                    }
                  }
                }
              }}
            />
            )}
          </div>
        </div>

        <div className="card animate-fade-slide" style={{ padding: '22px 24px', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Budget Wise</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {budgetView === 'tag' ? 'Tags' : 'Categories'} spending distribution
                {activeRange && ` · ${activeRangeLabel}`}
                {(selectedTags.length > 0 || selectedCats.length > 0) && ` · ${selectedTags.length + selectedCats.length} filter${selectedTags.length + selectedCats.length > 1 ? 's' : ''} applied`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {spendData.length === 0 ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} color="var(--text-muted)" strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>No budget data</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>Create tasks with budgets to see distribution</div>
              </div>
            ) : (
            <>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width={140} height={140} minWidth={0}>
                <PieChart>
                  <Pie data={spendData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={0} dataKey="pct" strokeWidth={0}>
                    {spendData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#1A1D2E', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB', fontWeight: 700 }}>
                          ₹{Math.round(d.value).toLocaleString()}
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>₹{totalBudget.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {spendData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.pct}%</span>
                </div>
              ))}
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Task Completion + Task Growth */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <CustomerHabitsChart groupBy={budgetView} />
        <CustomerGrowth groupBy={budgetView} />
      </div>

      {/* Team Performance */}
      <div className="card animate-fade-slide" style={{ padding: '22px 24px', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Team Performance</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member scores based on completion, activity & efficiency</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
          {team.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="var(--text-muted)" strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>No team members yet</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Add team members to track performance metrics</div>
              </div>
            </div>
          ) : (
          <>
          {/* Left: performance bars by type/department */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Development', color: '#3B5BFC' },
              { name: 'Design', color: '#7C3AED' },
              { name: 'Marketing', color: '#12C479' },
              { name: 'Sales', color: '#F97316' },
              { name: 'Support', color: '#EF4444' },
            ].map(dept => {
              // Get all team members in this department based on role only
              const deptMembers = team.filter(m => 
                m.role?.toLowerCase().includes(dept.name.toLowerCase())
              );
              
              // Calculate department performance
              let totalScore = 0;
              let memberCount = 0;
              
              deptMembers.forEach(m => {
                const memberTasks = tasks.filter(t => t.assignee?.id === m.id);
                const completedTasks = memberTasks.filter(t => t.stage === 'Complete').length;
                const totalTasks = memberTasks.length;
                
                if (totalTasks > 0) {
                  const completionRate = completedTasks / totalTasks;
                  const recentActivity = (m.recentActivity || []).filter(a => 
                    a.type === 'stage_change' || a.type === 'task_completed'
                  ).length;
                  const activityScore = Math.min(recentActivity / 10, 1);
                  
                  const tasksInReview = memberTasks.filter(t => t.stage === 'In Review').length;
                  const reviewPenalty = Math.min(tasksInReview / totalTasks, 0.3);
                  
                  const tasksReturnedToReview = (m.recentActivity || []).filter(a => 
                    a.type === 'stage_change' && a.details?.includes('back to Review')
                  ).length;
                  const reviewReturnPenalty = Math.min(tasksReturnedToReview / 5, 0.2);
                  
                  const backwardUpdates = (m.recentActivity || []).filter(a => 
                    a.type === 'stage_change' && (
                      a.details?.includes('moved back') || 
                      a.details?.includes('reverted') ||
                      a.details?.includes('returned')
                    )
                  ).length;
                  const backwardPenalty = Math.min(backwardUpdates / 5, 0.2);
                  
                  const approvedTasks = memberTasks.filter(t => t.stage === 'Complete' && t.approvedBy).length;
                  const approvalBonus = (approvedTasks / totalTasks) * 0.5;
                  
                  const memberScore = (completionRate * 40) + (activityScore * 30) + (approvalBonus * 15) - 
                                     (reviewPenalty * 15) - (reviewReturnPenalty * 10) - (backwardPenalty * 10) + 15;
                  
                  totalScore += Math.max(0, Math.min(100, memberScore));
                  memberCount++;
                }
              });
              
              const avgScore = memberCount > 0 ? Math.round(totalScore / memberCount) : 50;
              
              return (
                <div key={dept.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{dept.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{avgScore}</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--input-bg)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${avgScore}%`, height: '100%', background: dept.color, borderRadius: 8, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Team members only */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Team Members</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {team
                .map(m => {
                  const memberTasks = tasks.filter(t => t.assignee?.id === m.id);
                  const completedTasks = memberTasks.filter(t => t.stage === 'Complete').length;
                  const totalTasks = memberTasks.length;
                  
                  // Calculate member performance score
                  let performanceScore = 50;
                  if (totalTasks > 0) {
                    const completionRate = completedTasks / totalTasks;
                    const recentActivity = (m.recentActivity || []).filter(a => 
                      a.type === 'stage_change' || a.type === 'task_completed'
                    ).length;
                    const activityScore = Math.min(recentActivity / 10, 1);
                    
                    const tasksInReview = memberTasks.filter(t => t.stage === 'In Review').length;
                    const reviewPenalty = Math.min(tasksInReview / totalTasks, 0.3);
                    
                    const tasksReturnedToReview = (m.recentActivity || []).filter(a => 
                      a.type === 'stage_change' && a.details?.includes('back to Review')
                    ).length;
                    const reviewReturnPenalty = Math.min(tasksReturnedToReview / 5, 0.2);
                    
                    const backwardUpdates = (m.recentActivity || []).filter(a => 
                      a.type === 'stage_change' && (
                        a.details?.includes('moved back') || 
                        a.details?.includes('reverted') ||
                        a.details?.includes('returned')
                      )
                    ).length;
                    const backwardPenalty = Math.min(backwardUpdates / 5, 0.2);
                    
                    const approvedTasks = memberTasks.filter(t => t.stage === 'Complete' && t.approvedBy).length;
                    const approvalBonus = (approvedTasks / totalTasks) * 0.5;
                    
                    performanceScore = Math.round(
                      (completionRate * 40) + (activityScore * 30) + (approvalBonus * 15) - 
                      (reviewPenalty * 15) - (reviewReturnPenalty * 10) - (backwardPenalty * 10) + 15
                    );
                  }
                  
                  return { 
                    ...m, 
                    completedTasks, 
                    totalTasks, 
                    performanceScore: Math.max(0, Math.min(100, performanceScore))
                  };
                })
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 5)
                .map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {m.avatar}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{m.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.performanceScore}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          </>
          )}
        </div>
      </div>

    </div>
  );
}
