import { useState, useRef, useEffect } from 'react';
import { notify } from '../lib/notify';
import { Clock, CheckCircle, TrendingUp, ArrowUpRight, Wallet, Download, X, DollarSign, Calendar, Plus, User, Users, Briefcase, ChevronDown, ChevronLeft, ChevronRight, ReceiptIndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';

function exportToCSV(rows) {
  const headers = ['Task ID', 'Task Title', 'Member', 'Assigned By', 'Role', 'Stage', 'Due Date', 'Amount', 'Status'];
  const lines = rows.map(r => [
    r.id,
    `"${r.title}"`,
    `"${r.memberName}"`,
    r.assignedBy || 'John Smith',
    r.assignedRole || 'Admin',
    r.stage,
    new Date(r.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    r.amount,
    r.isPaid ? 'Paid' : 'Pending',
  ].join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Payment Modal
function PaymentModal({ selectedRows, onClose, onConfirm }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [notes, setNotes] = useState('');
  const totalAmount = selectedRows.reduce((sum, row) => sum + row.amount, 0);
  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;

  const handleProcessPayment = () => {
    if (wordCount > 100) return;
    requestAdminPassword('process payment', () => {
      onConfirm(notes);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Process Payment</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Confirm payment for {selectedRows.length} task{selectedRows.length > 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Selected tasks summary */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Selected Tasks</div>
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedRows.map(row => (
                <div key={`${row.id}-${row.memberName}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: row.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{row.memberAvatar}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.memberName}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#12C479', flexShrink: 0 }}>₹ {row.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total amount */}
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #C7D4FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3B5BFC', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Payment Amount</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{selectedRows.length} task{selectedRows.length > 1 ? 's' : ''} selected</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3B5BFC', letterSpacing: '-1px' }}>₹ {totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Description <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional, max 100 words)</span></div>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              rows={4} 
              placeholder="Add notes about this payment (e.g., invoice number, payment method, special instructions)..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
              onBlur={e => e.target.style.borderColor = 'var(--border)'} 
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: wordCount > 100 ? '#EF4444' : 'var(--text-muted)', marginTop: 4 }}>
              {wordCount}/100 words
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button 
            onClick={handleProcessPayment} 
            disabled={wordCount > 100}
            style={{
              padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, 
              cursor: wordCount > 100 ? 'not-allowed' : 'pointer',
              background: wordCount > 100 ? 'var(--border)' : 'linear-gradient(135deg, #12C479, #059669)',
              color: wordCount > 100 ? 'var(--text-muted)' : '#fff',
              boxShadow: wordCount > 100 ? 'none' : '0 6px 20px rgba(18,196,121,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <DollarSign size={16} /> Process Payment
          </button>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        />
      )}
    </div>
  );
}

// Add Manual Payment Modal
function AddPaymentModal({ onClose, onAdd, team, tasks }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  // Check if Admin A is logged in
  const isAdminA = typeof window !== 'undefined' && localStorage.getItem('userEmail') === 'adminuser@taskzy.io';
  
  const [paymentType, setPaymentType] = useState('member'); // 'member' or 'investment'
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [payNow, setPayNow] = useState(false);

  // Payment categories with icons and colors - empty for Admin A
  const PAYMENT_CATEGORIES = isAdminA ? [] : [
    { label: 'Domain & Hosting', icon: '🌐', color: '#3B5BFC', bg: '#EEF2FF' },
    { label: 'Software & Tools', icon: '💻', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Infrastructure', icon: '🏢', color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'Marketing', icon: '📢', color: '#F97316', bg: '#FFF7ED' },
    { label: 'Equipment', icon: '🔧', color: '#12C479', bg: '#ECFDF5' },
    { label: 'Legal', icon: '⚖️', color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Training', icon: '📚', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Other', icon: '📦', color: '#6B7280', bg: '#F3F4F6' },
  ];

  const selectedMember = team.find(m => m.id === parseInt(memberId));
  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;
  const isValid = paymentType === 'investment' 
    ? amount && parseFloat(amount) > 0 && title.trim() && selectedCategory
    : memberId && amount && parseFloat(amount) > 0 && title.trim();

  const handleSubmit = () => {
    if (!isValid || wordCount > 100) return;
    requestAdminPassword('add payment', () => {
      const today = new Date().toISOString().split('T')[0];
      onAdd({
        paymentType,
        memberId: paymentType === 'member' ? parseInt(memberId) : null,
        amount: parseFloat(amount),
        description: title.trim(),
        notes: notes.trim(),
        dueDate: dueDate || today,
        isPaid: false,
        investmentCategory: paymentType === 'investment' && selectedCategory ? selectedCategory.label : null,
        taskId: taskId.trim() || null,
      });
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Add Manual Payment</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Create a payment for specific task</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Payment Type Selection */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Type *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setPaymentType('member'); setSelectedCategory(null); }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: paymentType === 'member' ? 'none' : '1.5px solid var(--border)',
                  background: paymentType === 'member' ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--bg-surface)',
                  color: paymentType === 'member' ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <Users size={16} /> Team
              </button>
              <button
                onClick={() => { setPaymentType('investment'); setMemberId(''); }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: paymentType === 'investment' ? 'none' : '1.5px solid var(--border)',
                  background: paymentType === 'investment' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'var(--bg-surface)',
                  color: paymentType === 'investment' ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <ReceiptIndianRupee size={16} /> Payment
              </button>
            </div>
          </div>

          {/* Team Member Selection - Only for member payments */}
          {paymentType === 'member' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Team Member *</label>
              <select 
                value={memberId} 
                onChange={e => setMemberId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '11px 16px', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: 10, 
                  fontSize: 14, 
                  color: 'var(--text-primary)', 
                  outline: 'none', 
                  background: 'var(--input-bg)', 
                  cursor: 'pointer', 
                  boxSizing: 'border-box' 
                }}
              >
                <option value="">Select team member...</option>
                {team.filter(m => m.status === 'Active').map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
              {selectedMember && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: selectedMember.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{selectedMember.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMember.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedMember.role} • {selectedMember.email}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Category - Only for payment type */}
          {paymentType === 'investment' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Payment Category * <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(select one)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PAYMENT_CATEGORIES.map(cat => {
                  const sel = selectedCategory?.label === cat.label;
                  return (
                    <button key={cat.label} onClick={() => setSelectedCategory(sel ? null : cat)} style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${sel ? cat.color : 'var(--border)'}`,
                      background: sel ? cat.bg : 'var(--bg-surface)',
                      color: sel ? cat.color : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                      boxShadow: sel ? `0 2px 8px ${cat.color}30` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <span style={{ fontSize: 14 }}>{cat.icon}</span> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task ID - Only for payment type */}
          {paymentType === 'investment' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>Task ID <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    value={taskSearchQuery}
                    onChange={e => { setTaskSearchQuery(e.target.value); setTaskId(''); setShowTaskDropdown(e.target.value.length > 0); }}
                    onFocus={() => taskSearchQuery.length > 0 && setShowTaskDropdown(true)}
                    onBlur={() => { setTimeout(() => { setShowTaskDropdown(false); if (taskSearchQuery && !taskId) setTaskId(taskSearchQuery); }, 200); }}
                    placeholder="Search or type Task ID..."
                    style={{ width: '100%', padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'}
                  />
                  {showTaskDropdown && taskSearchQuery && tasks && tasks.filter(t =>
                    t.id.toString().toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                    t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
                  ).length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto', zIndex: 1000 }}>
                      {tasks.filter(t =>
                        t.id.toString().toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                        t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
                      ).slice(0, 5).map(task => (
                        <div key={task.id} onClick={() => { setTaskId(task.id.toString()); setTaskSearchQuery(task.id.toString()); setShowTaskDropdown(false); }}
                          style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Task #{task.id}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {taskId && (
                  <button onClick={() => { setTaskId(''); setTaskSearchQuery(''); }}
                    style={{ padding: '6px 10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              {taskSearchQuery && (
                <div style={{ fontSize: 11, marginTop: 6, paddingLeft: 2 }}>
                  {tasks && tasks.find(t => t.id.toString() === taskId) ? (
                    <span style={{ color: '#12C479', fontWeight: 600 }}>✓ Linked to existing Task #{taskId}</span>
                  ) : taskId ? (
                    <span style={{ color: '#F97316', fontWeight: 600 }}>⚠ Task ID "{taskId}" not found</span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Amount and Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount (₹) *</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{ 
                  width: '100%', 
                  padding: '11px 16px', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: 10, 
                  fontSize: 14, 
                  color: 'var(--text-primary)', 
                  outline: 'none', 
                  background: 'var(--input-bg)', 
                  boxSizing: 'border-box' 
                }}
                onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                onBlur={e => e.target.style.borderColor = 'var(--border)'} 
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Due Date <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)}
                disabled={payNow}
                style={{ 
                  width: '100%', 
                  padding: '11px 16px', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: 10, 
                  fontSize: 14, 
                  color: 'var(--text-primary)', 
                  outline: 'none', 
                  background: payNow ? 'var(--bg-subtle)' : 'var(--input-bg)', 
                  boxSizing: 'border-box', 
                  colorScheme: 'normal',
                  cursor: payNow ? 'not-allowed' : 'text',
                  opacity: payNow ? 0.5 : 1,
                }}
                onFocus={e => !payNow && (e.target.style.borderColor = '#3B5BFC')} 
                onBlur={e => e.target.style.borderColor = 'var(--border)'} 
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title *</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., Bonus payment, Domain renewal, Office supplies..."
              style={{ 
                width: '100%', 
                padding: '11px 16px', 
                border: '1.5px solid var(--border)', 
                borderRadius: 10, 
                fontSize: 14, 
                color: 'var(--text-primary)', 
                outline: 'none', 
                background: 'var(--input-bg)', 
                boxSizing: 'border-box' 
              }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
              onBlur={e => e.target.style.borderColor = 'var(--border)'} 
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Description <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional, max 100 words)</span></div>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              rows={3} 
              placeholder="Additional notes about this payment..."
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1.5px solid var(--border)', 
                borderRadius: 10, 
                fontSize: 13, 
                color: 'var(--text-primary)', 
                outline: 'none', 
                background: 'var(--input-bg)', 
                resize: 'vertical', 
                fontFamily: 'inherit', 
                boxSizing: 'border-box' 
              }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
              onBlur={e => e.target.style.borderColor = 'var(--border)'} 
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: wordCount > 100 ? '#EF4444' : 'var(--text-muted)', marginTop: 4 }}>
              {wordCount}/100 words
            </div>
          </div>

          {/* Preview */}
          {isValid && (
            <div style={{ background: paymentType === 'investment' ? 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' : 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 14, padding: '16px 20px', border: paymentType === 'investment' ? '1.5px solid #F97316' : '1.5px solid #C7D4FF' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: paymentType === 'investment' ? '#F97316' : '#3B5BFC', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                {paymentType === 'investment' ? 'Payment Preview' : 'Payment Preview'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {paymentType === 'investment' && selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : (selectedMember ? selectedMember.name : 'Select Member')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{title}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: paymentType === 'investment' ? '#F97316' : '#3B5BFC', letterSpacing: '-1px' }}>₹ {parseFloat(amount).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} color="#F97316" />
                <span>Due: {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={!isValid || wordCount > 100}
            style={{
              padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: (!isValid || wordCount > 100) ? 'not-allowed' : 'pointer',
              background: (!isValid || wordCount > 100) ? 'var(--border)' : 'linear-gradient(135deg, #3B5BFC, #2142D9)',
              color: (!isValid || wordCount > 100) ? 'var(--text-muted)' : '#fff',
              boxShadow: (!isValid || wordCount > 100) ? 'none' : '0 6px 20px rgba(59,91,252,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <Plus size={16} /> Add Payment
          </button>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        />
      )}
    </div>
  );
}

// Category Payment Modal
function CategoryPaymentModal({ selectedRows, onClose, onConfirm, team }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const initialTotal = selectedRows.reduce((sum, row) => sum + row.amount, 0);
  const [totalAmount, setTotalAmount] = useState(initialTotal);
  const [description, setDescription] = useState('');
  const [taskAmounts, setTaskAmounts] = useState(
    selectedRows.reduce((acc, row) => {
      acc[`${row.id}-${row.memberName}`] = row.amount;
      return acc;
    }, {})
  );

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const calculatedTotal = Object.values(taskAmounts).reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0);

  const handleAmountChange = (key, value) => {
    setTaskAmounts(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleTotalAmountChange = (value) => {
    const newTotal = parseFloat(value) || 0;
    setTotalAmount(newTotal);
    
    // Check if any task has zero amount
    const hasZeroAmounts = selectedRows.some(row => {
      const key = `${row.id}-${row.memberName}`;
      return !taskAmounts[key] || taskAmounts[key] === 0;
    });
    
    // If any task has zero amount, split evenly
    if (hasZeroAmounts) {
      const perTask = newTotal / selectedRows.length;
      const newAmounts = {};
      selectedRows.forEach(row => {
        newAmounts[`${row.id}-${row.memberName}`] = perTask;
      });
      setTaskAmounts(newAmounts);
    }
  };

  const distributeEvenly = () => {
    const perTask = totalAmount / selectedRows.length;
    const newAmounts = {};
    selectedRows.forEach(row => {
      newAmounts[`${row.id}-${row.memberName}`] = perTask;
    });
    setTaskAmounts(newAmounts);
  };

  const handleConfirm = () => {
    requestAdminPassword('create payment', () => {
      const categoryData = {
        description: description.trim(),
        totalAmount: calculatedTotal,
        tasks: selectedRows.map(row => ({
          ...row,
          categoryAmount: taskAmounts[`${row.id}-${row.memberName}`],
        })),
      };
      
      onConfirm(categoryData);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Payment</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Total Amount Input */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Amount *</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
              <input 
                type="number"
                value={totalAmount} 
                onChange={e => handleTotalAmountChange(e.target.value)} 
                placeholder="Enter total amount..."
                style={{ width: '100%', padding: '11px 16px 11px 36px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                onBlur={e => e.target.style.borderColor = 'var(--border)'} 
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Amount will be split across {selectedRows.length} task{selectedRows.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Description <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional, max 100 words)</span></div>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3} 
              placeholder="Describe this category payment..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
              onBlur={e => e.target.style.borderColor = 'var(--border)'} 
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: wordCount > 100 ? '#EF4444' : 'var(--text-muted)', marginTop: 4 }}>
              {wordCount}/100 words
            </div>
          </div>

          {/* Total Amount Display */}
          <div style={{ background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #C7D4FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calculated Total</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Sum of all task amounts</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED', letterSpacing: '-1px' }}>₹ {calculatedTotal.toLocaleString()}</div>
            </div>
            <button
              onClick={distributeEvenly}
              style={{
                width: '100%',
                padding: '8px 14px',
                background: '#fff',
                border: '1.5px solid #C7D4FF',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#7C3AED',
                cursor: 'pointer',
              }}
            >
              Distribute Evenly (₹ {(totalAmount / selectedRows.length).toLocaleString()} per task)
            </button>
          </div>

          {/* Task Amount Distribution */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Amount Distribution</div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedRows.map(row => {
                const key = `${row.id}-${row.memberName}`;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{row.memberAvatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.memberName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>₹</span>
                      <input
                        type="number"
                        value={taskAmounts[key]}
                        onChange={e => handleAmountChange(key, e.target.value)}
                        style={{
                          width: 100,
                          padding: '6px 10px',
                          border: '1.5px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          background: 'var(--bg-surface)',
                          textAlign: 'right',
                        }}
                        onFocus={e => e.target.style.borderColor = '#3B5BFC'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button 
            onClick={handleConfirm}
            style={{
              padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: '#fff',
              boxShadow: '0 6px 20px #7C3AED40',
            }}
          >
            Create Payment
          </button>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        />
      )}
    </div>
  );
}

// ── Payment Detail Panel (Right Side) ───────────────────────────────────────
function PaymentDetailPanel({ payment, onClose }) {
  const panelRef = useRef(null);
  
  if (!payment) return null;

  // Close on click outside
  const handleDownloadPDF = () => {
    console.log('Download PDF for payment:', payment);
    // In a real app, this would generate and download a PDF receipt
    alert('PDF download functionality would be implemented here');
  };

  return (
    <div 
      ref={panelRef}
      style={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        background: 'var(--bg-surface)', 
        zIndex: 10,
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        borderLeft: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Payment Receipt</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{payment.taskId}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        
        {/* Status Badge */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 12,
            background: payment.isPaid ? '#ECFDF5' : '#FFF7ED',
            border: `1.5px solid ${payment.isPaid ? '#BBF7D0' : '#FED7AA'}`,
          }}>
            {payment.isPaid ? <CheckCircle size={20} color="#12C479" /> : <Clock size={20} color="#F97316" />}
            <span style={{ fontSize: 14, fontWeight: 700, color: payment.isPaid ? '#12C479' : '#F97316' }}>
              {payment.isPaid ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Payment Information</div>
          
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Task/Invoice ID</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{payment.taskId}</span>
              </div>

              {payment.title && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Task Title</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{payment.title}</span>
                </div>
              )}

              {payment.memberName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Member</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: payment.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                      {payment.memberAvatar}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{payment.memberName}</span>
                  </div>
                </div>
              )}

              {payment.memberRole && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Role</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{payment.memberRole}</span>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Amount</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#12C479' }}>₹ {payment.amount?.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Due Date</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(payment.deadline || payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {payment.isPaid && payment.paidOn && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Paid On</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#12C479' }}>
                    {new Date(payment.paidOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              {payment.stage && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Stage</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: payment.stage === 'Complete' ? '#ECFDF5' : '#EEF2FF', color: payment.stage === 'Complete' ? '#12C479' : '#3B5BFC' }}>
                    {payment.stage}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description/Notes */}
        {(payment.description || payment.notes) && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
              {payment.description ? 'Description' : 'Notes'}
            </div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {payment.description || payment.notes}
              </p>
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownloadPDF}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #3B5BFC, #2142D9)',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(59,91,252,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={18} />
          Download PDF Receipt
        </button>
      </div>
    </div>
  );
}

export default function FinancialPage() {
  // Check if Admin A is logged in
  const isAdminA = typeof window !== 'undefined' && localStorage.getItem('userEmail') === 'adminuser@taskzy.io';
  
  const { tasks, financials, STAGE_COLORS, STAGE_BG, markTaskPaid, team, addTaskHistoryEntry } = useApp();
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [manualPayments, setManualPayments] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCategoryPaymentModal, setShowCategoryPaymentModal] = useState(false);
  
  // Set default date range to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [dateRangeFilter, setDateRangeFilter] = useState('30days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [hoveredDescription, setHoveredDescription] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [editDescriptionValue, setEditDescriptionValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(15);

  // Build flat rows: one row per member per task
  const allRows = [];
  tasks.forEach(task => {
    task.members.forEach(m => {
      allRows.push({
        id:         task.id,
        taskId:     task.id,
        title:      task.title,
        description: task.description,
        deadline:   task.deadline,
        memberName: m.name,
        memberId:   m.id,
        memberRole: m.role,
        memberAvatar: m.avatar,
        memberColor:  m.color,
        stage:      m.stage,
        amount:     m.budget || 0,
        isPaid:     task.paid || task.stage === 'Complete',
        taskStage:  task.stage,
        isManual:   false,
        assignedBy: 'John Smith',
        assignedRole: 'Admin',
        paidOn:     (task.paid || task.stage === 'Complete') ? task.paidOn || new Date().toISOString() : null,
        category:   task.category || null,
      });
    });
  });

  // Add manual payments
  manualPayments.forEach(payment => {
    if (payment.paymentType === 'investment') {
      // Investment payment
      allRows.push({
        id:         payment.taskId,
        taskId:     payment.taskId,
        title:      payment.description,
        description: payment.notes || payment.description,
        deadline:   payment.dueDate,
        memberName: payment.investmentCategory,
        memberId:   null,
        memberRole: 'Investment',
        memberAvatar: '💰',
        memberColor:  '#F97316',
        stage:      payment.isPaid ? 'Complete' : 'New',
        amount:     payment.amount,
        isPaid:     payment.isPaid,
        taskStage:  payment.isPaid ? 'Complete' : 'New',
        isManual:   true,
        isInvestment: true,
        manualId:   payment.id,
        assignedBy: payment.assignedBy || 'John Smith',
        assignedRole: payment.assignedRole || 'Admin',
        paidOn:     payment.paidOn || null,
      });
    } else {
      // Team member payment
      const member = team.find(m => m.id === payment.memberId);
      if (member) {
        allRows.push({
          id:         payment.taskId,
          taskId:     payment.taskId,
          title:      payment.description,
          description: payment.notes || payment.description,
          deadline:   payment.dueDate,
          memberName: member.name,
          memberId:   member.id,
          memberRole: member.role,
          memberAvatar: member.avatar,
          memberColor:  member.color,
          stage:      payment.isPaid ? 'Complete' : 'New',
          amount:     payment.amount,
          isPaid:     payment.isPaid,
          taskStage:  payment.isPaid ? 'Complete' : 'New',
          isManual:   true,
          isInvestment: false,
          manualId:   payment.id,
          assignedBy: payment.assignedBy || 'John Smith',
          assignedRole: payment.assignedRole || 'Admin',
          paidOn:     payment.paidOn || null,
        });
      }
    }
  });

  // Filter by category/role
  const categoryFiltered = selectedCategories.length === 0
    ? allRows
    : allRows.filter(r => {
        // Check if any selected filter matches
        return selectedCategories.some(cat => {
          if (cat.type === 'category') {
            // Match investment category
            return r.isInvestment && r.memberName === cat.label;
          } else if (cat.type === 'role') {
            // Match member role
            return !r.isInvestment && r.memberRole === cat.label;
          }
          return false;
        });
      });

  // Filter by team member (multiple selection)
  const memberFiltered = selectedMembers.length === 0
    ? categoryFiltered
    : categoryFiltered.filter(r => {
        return selectedMembers.some(memberId => {
          if (memberId === 'Investment') {
            return r.isInvestment;
          }
          return r.memberId === memberId;
        });
      });

  // Filter by date range
  let dateFiltered = memberFiltered;
  if (dateFrom || dateTo) {
    dateFiltered = memberFiltered.filter(r => {
      const taskDate = new Date(r.deadline);
      taskDate.setHours(0, 0, 0, 0);
      
      let matchesDate = true;
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && taskDate >= fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && taskDate <= toDate;
      }
      
      return matchesDate;
    });
  }

  // Filter by status
  const statusFiltered = statusFilter === 'All' 
    ? dateFiltered 
    : statusFilter === 'Pending' 
      ? dateFiltered.filter(r => !r.isPaid)
      : dateFiltered.filter(r => r.isPaid);

  // Pending first, paid last
  const sorted = [
    ...statusFiltered.filter(r => !r.isPaid),
    ...statusFiltered.filter(r =>  r.isPaid),
  ];

  const totalBudget  = statusFiltered.reduce((s, r) => s + r.amount, 0);
  const totalPaid    = statusFiltered.filter(r => r.isPaid).reduce((s, r) => s + r.amount, 0);
  const totalPending = totalBudget - totalPaid;
  const paidRate     = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

  const pendingRows = sorted.filter(r => !r.isPaid);
  const selectedAmount = selectedRows.reduce((sum, row) => sum + row.amount, 0);

  // Payment categories - empty for Admin A
  const PAYMENT_CATEGORIES = [
    { label: 'Domain & Hosting', icon: '🌐', color: '#3B5BFC', type: 'category' },
    { label: 'Software & Tools', icon: '💻', color: '#7C3AED', type: 'category' },
    { label: 'Infrastructure', icon: '🏢', color: '#06B6D4', type: 'category' },
    { label: 'Marketing', icon: '📢', color: '#F97316', type: 'category' },
    { label: 'Equipment', icon: '🔧', color: '#12C479', type: 'category' },
    { label: 'Legal', icon: '⚖️', color: '#8B5CF6', type: 'category' },
    { label: 'Training', icon: '📚', color: '#F59E0B', type: 'category' },
    { label: 'Other', icon: '📦', color: '#6B7280', type: 'category' },
  ];

  // Get unique roles from team members
  const roles = [...new Set(team.map(m => m.role))].sort();
  const roleOptions = roles.map(role => ({ label: role, icon: '👤', color: '#3B5BFC', type: 'role' }));
  
  // Combined filter options
  const filterOptions = [...PAYMENT_CATEGORIES, ...roleOptions];

  const categoryDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (option) => {
    setSelectedCategories(prev => {
      const exists = prev.find(c => c.label === option.label);
      if (exists) {
        return prev.filter(c => c.label !== option.label);
      } else {
        return [...prev, option];
      }
    });
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const clearMemberFilters = () => {
    setSelectedMembers([]);
  };

  const toggleRow = (row) => {
    if (row.isPaid) return; // Can't select paid rows
    const key = `${row.id}-${row.memberName}`;
    const isSelected = selectedRows.some(r => `${r.id}-${r.memberName}` === key);
    if (isSelected) {
      setSelectedRows(prev => prev.filter(r => `${r.id}-${r.memberName}` !== key));
    } else {
      setSelectedRows(prev => [...prev, row]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === pendingRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...pendingRows]);
    }
  };

  const handlePayment = (notes) => {
    const paidTimestamp = new Date().toISOString();
    const count = selectedRows.length;
    const totalAmount = selectedRows.reduce((s, r) => s + r.amount, 0);
    
    // Group by task ID and mark as paid
    const taskIds = [...new Set(selectedRows.filter(r => !r.isManual).map(r => r.taskId))];
    taskIds.forEach(taskId => {
      markTaskPaid(taskId, { name: 'Admin' }, 'Payment Page');
    });
    
    // Mark manual payments as paid
    const manualIds = selectedRows.filter(r => r.isManual).map(r => r.manualId);
    if (manualIds.length > 0) {
      setManualPayments(prev => prev.map(p => 
        manualIds.includes(p.id) ? { ...p, isPaid: true, paidOn: paidTimestamp } : p
      ));
    }
    
    setSelectedRows([]);
    setShowPaymentModal(false);
    notify.paymentsProcessed(count, `₹ ${totalAmount.toLocaleString()} marked as paid`);
  };

  const handleAddPayment = (paymentData) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newTaskId = '#';
    for (let i = 0; i < 8; i++) newTaskId += chars[Math.floor(Math.random() * chars.length)];

    const linkedTaskId = paymentData.taskId;
    const linkedTask = linkedTaskId ? tasks.find(t => t.id === linkedTaskId) : null;
    if (linkedTask) {
      addTaskHistoryEntry(linkedTaskId, {
        stage: linkedTask.stage,
        date: new Date(),
        user: 'Admin',
        action: 'paid',
        note: `Manual payment added via Payment Page${paymentData.description ? ` — ${paymentData.description}` : ''}`,
      });
    }

    const newPayment = {
      id: Date.now(),
      taskId: linkedTaskId || newTaskId,
      ...paymentData,
      createdAt: new Date().toISOString(),
      paidOn: paymentData.isPaid ? new Date().toISOString() : null,
    };
    setManualPayments(prev => [...prev, newPayment]);
    notify.paymentAdded(`₹ ${(paymentData.amount || 0).toLocaleString()} — ${paymentData.description || 'Manual payment'}`);
  };

  const handleDescriptionEdit = (rowKey, currentDescription) => {
    setEditingDescription(rowKey);
    setEditDescriptionValue(currentDescription || '');
  };

  const handleDescriptionSave = (row) => {
    if (row.isManual) {
      // Update manual payment description
      setManualPayments(prev => prev.map(p => 
        p.id === row.manualId ? { ...p, notes: editDescriptionValue } : p
      ));
    }
    // Note: For regular tasks, you would need to update the task in the context
    // This would require adding an updateTaskDescription function to AppContext
    
    setEditingDescription(null);
    setEditDescriptionValue('');
  };

  const handleDescriptionCancel = () => {
    setEditingDescription(null);
    setEditDescriptionValue('');
  };

  const handleCategoryPayment = (categoryData) => {
    // Store category payment data with tasks
    // This would typically update the context/state to mark these tasks with the category
    console.log('Category Payment Created:', categoryData);
    
    // For now, we'll just close the modal and clear selection
    // In a real app, you'd update the tasks with category information
    setShowCategoryPaymentModal(false);
    setSelectedRows([]);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>

      {/* ── Payments table ── */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

        {/* Table toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1.5px solid var(--border-light)',
          background: 'var(--bg-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ height: 32, width: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Pending', 'Paid'].map(status => (
                <button key={status} onClick={() => setStatusFilter(prev => prev === status && status !== 'All' ? 'All' : status)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: statusFilter === status ? 'none' : '1.5px solid var(--border)',
                  background: statusFilter === status ? (status === 'Pending' ? '#F97316' : status === 'Paid' ? '#12C479' : '#3B5BFC') : 'var(--bg-surface)',
                  color: statusFilter === status ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s',
                }}>{status}</button>
              ))}
            </div>
            <div style={{ height: 32, width: '1px', background: 'var(--border)' }} />
            {dateRangeFilter === 'custom' ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowDateDropdown(p => !p)}
                  style={{ padding: '6px 10px', borderRadius: 10, border: '1.5px solid #3B5BFC', background: '#EEF2FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#3B5BFC" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#3B5BFC' }}>{dateFrom} → {dateTo}</span>
                  <button onClick={(e) => { e.stopPropagation(); setDateFrom(''); setDateTo(''); setDateRangeFilter('30days'); setShowDateDropdown(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#3B5BFC', fontSize: 14, lineHeight: 1 }}>×</button>
                </button>
                {showDateDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 14, zIndex: 200, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>FROM</label>
                      <input type="date" value={tempDateFrom} onChange={e => setTempDateFrom(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>TO</label>
                      <input type="date" value={tempDateTo} onChange={e => setTempDateTo(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button disabled={!tempDateFrom || !tempDateTo}
                      onClick={() => { setDateFrom(tempDateFrom); setDateTo(tempDateTo); setDateRangeFilter('custom'); setShowDateDropdown(false); }}
                      style={{ padding: '7px', background: tempDateFrom && tempDateTo ? '#3B5BFC' : '#E8EAEF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: tempDateFrom && tempDateTo ? '#fff' : '#9CA3AF', cursor: tempDateFrom && tempDateTo ? 'pointer' : 'not-allowed' }}>
                      Apply
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[
                  { label: 'All', value: 'all' },
                  { label: '7 Days', value: '7days' },
                  { label: '30 Days', value: '30days' },
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => {
                      if (dateRangeFilter === range.value) return;
                      setDateRangeFilter(range.value);
                      const today = new Date();
                      if (range.value === 'all') { setDateFrom(''); setDateTo(''); }
                      else if (range.value === '7days') { const d = new Date(today); d.setDate(today.getDate() - 7); setDateFrom(d.toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); }
                      else if (range.value === '30days') { const d = new Date(today); d.setDate(today.getDate() - 30); setDateFrom(d.toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); }
                    }}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: dateRangeFilter === range.value ? 'none' : '1.5px solid var(--border)',
                      background: dateRangeFilter === range.value ? '#3B5BFC' : 'var(--bg-surface)',
                      color: dateRangeFilter === range.value ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s',
                    }}
                  >{range.label}</button>
                ))}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowDateDropdown(p => !p)}
                    style={{ padding: '6px 8px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                  </button>
                  {showDateDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 14, zIndex: 200, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>FROM</label>
                        <input type="date" value={tempDateFrom} onChange={e => setTempDateFrom(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>TO</label>
                        <input type="date" value={tempDateTo} onChange={e => setTempDateTo(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <button
                        disabled={!tempDateFrom || !tempDateTo}
                        onClick={() => { setDateFrom(tempDateFrom); setDateTo(tempDateTo); setDateRangeFilter('custom'); setShowDateDropdown(false); }}
                        style={{ padding: '7px', background: tempDateFrom && tempDateTo ? '#3B5BFC' : '#E8EAEF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: tempDateFrom && tempDateTo ? '#fff' : '#9CA3AF', cursor: tempDateFrom && tempDateTo ? 'pointer' : 'not-allowed' }}>
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <User size={13} />
                Team Members {selectedMembers.length > 0 && `(${selectedMembers.length})`}
                <ChevronDown size={14} />
              </button>
              {showMemberDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  minWidth: 260,
                  maxHeight: 400,
                  overflowY: 'auto',
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Select Team Members</span>
                    {selectedMembers.length > 0 && (
                      <button
                        onClick={clearMemberFilters}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#3B5BFC',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    {/* Investment option */}
                    <button
                      onClick={() => toggleMember('Investment')}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: selectedMembers.includes('Investment') ? '#FFF7ED' : 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--border)', background: selectedMembers.includes('Investment') ? '#3B5BFC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedMembers.includes('Investment') && <CheckCircle size={12} color="#fff" strokeWidth={3} />}
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        💰
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Investments</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Company expenses</div>
                      </div>
                    </button>

                    <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />

                    {/* Team members */}
                    {team.map(member => (
                        <button
                          key={member.id}
                          onClick={() => toggleMember(member.id)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: selectedMembers.includes(member.id) ? '#EEF2FF' : 'transparent',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textAlign: 'left',
                            marginTop: 4,
                          }}
                        >
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--border)', background: selectedMembers.includes(member.id) ? '#3B5BFC' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {selectedMembers.includes(member.id) && <CheckCircle size={12} color="#fff" strokeWidth={3} />}
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                            {member.avatar}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{member.role}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ height: 32, width: '1px', background: 'var(--border)' }} />
            <div style={{ position: 'relative' }} ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Categories/Roles {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                <ChevronDown size={14} />
              </button>
              {showCategoryDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  minWidth: 280,
                  maxHeight: 400,
                  overflowY: 'auto',
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Filter by Category or Role</span>
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={clearCategories}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#EF4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Payment Categories */}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 8px' }}>Payment Categories</div>
                    {PAYMENT_CATEGORIES.map(cat => {
                      const isSelected = selectedCategories.some(c => c.label === cat.label);
                      return (
                        <div
                          key={cat.label}
                          onClick={() => toggleCategory(cat)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: isSelected ? cat.color + '15' : 'transparent',
                            border: `1px solid ${isSelected ? cat.color + '40' : 'transparent'}`,
                            marginBottom: 4,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg-subtle)')}
                          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 14 }}>{cat.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? cat.color : 'var(--text-secondary)', flex: 1 }}>{cat.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Team Roles */}
                  <div style={{ padding: '8px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 8px' }}>Team Roles</div>
                    {roleOptions.map(role => {
                      const isSelected = selectedCategories.some(c => c.label === role.label);
                      return (
                        <div
                          key={role.label}
                          onClick={() => toggleCategory(role)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: isSelected ? role.color + '15' : 'transparent',
                            border: `1px solid ${isSelected ? role.color + '40' : 'transparent'}`,
                            marginBottom: 4,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg-subtle)')}
                          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 14 }}>{role.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? role.color : 'var(--text-secondary)', flex: 1 }}>{role.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {selectedRows.length > 0 && (
              <>
                <div style={{ height: 32, width: '1px', background: 'var(--border)' }} />
                <button
                  onClick={() => setShowCategoryPaymentModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 8,
                    background: '#F5F3FF',
                    border: '1.5px solid #C7D4FF',
                    color: '#7C3AED', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}
                >
                  <span style={{ fontSize: 12 }}>📁</span> Category Payment ({selectedRows.length})
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginLeft: 16 }}>
            {selectedRows.length > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #12C479, #059669)',
                  border: 'none', color: '#fff', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,196,121,0.25)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <DollarSign size={12} /> Process Payment ({selectedRows.length})
              </button>
            )}
            <button
              onClick={() => setShowAddPaymentModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                border: 'none', color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={12} /> Add Payment
            </button>
            <button
              onClick={() => requestAdminPassword('export excel', () => exportToCSV(selectedRows.length > 0 ? selectedRows : sorted))}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: selectedRows.length > 0 ? 'linear-gradient(135deg, #12C479, #059669)' : 'linear-gradient(135deg, #3B5BFC, #2142D9)',
                border: 'none', color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', boxShadow: selectedRows.length > 0 ? '0 2px 8px rgba(18,196,121,0.25)' : '0 2px 8px rgba(59,91,252,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Download size={12} /> {selectedRows.length > 0 ? `Export ${selectedRows.length} Selected` : 'Export Excel'}
            </button>
            {sorted.length > rowsPerPage && (
              <>
                <div style={{ height: 32, width: '1px', background: 'var(--border)', marginLeft: 4 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      border: '1.5px solid var(--border)',
                      background: currentPage === 1 ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={12} color="var(--text-muted)" />
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 50, textAlign: 'center' }}>
                    {currentPage} / {Math.ceil(sorted.length / rowsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sorted.length / rowsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(sorted.length / rowsPerPage)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      border: '1.5px solid var(--border)',
                      background: currentPage === Math.ceil(sorted.length / rowsPerPage) ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      cursor: currentPage === Math.ceil(sorted.length / rowsPerPage) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: currentPage === Math.ceil(sorted.length / rowsPerPage) ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight size={12} color="var(--text-muted)" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '50px 560px 1.5fr 160px 130px 130px 120px 90px 90px 110px',
          padding: '10px 20px',
          borderBottom: '1.5px solid var(--border-light)',
          background: 'var(--bg-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input 
              type="checkbox" 
              checked={pendingRows.length > 0 && selectedRows.length === pendingRows.length}
              onChange={toggleAll}
              disabled={pendingRows.length === 0}
              style={{ cursor: pendingRows.length > 0 ? 'pointer' : 'not-allowed', width: 16, height: 16 }}
            />
          </div>
          {['Task', 'Description', 'Member', 'Assigned By', 'Category', 'Stage', 'Due Date', 'Amount', 'Paid On'].map((h, i) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: i === 1 ? 'left' : (i === 7 || i === 8) ? 'right' : 'left', paddingLeft: i === 2 ? 16 : i === 8 ? 16 : 0 }}>
              {h === 'Task' && selectedRows.length > 0
                ? <span style={{ color: '#3B5BFC', textTransform: 'none', fontSize: 12 }}>{selectedRows.length} selected (₹{selectedRows.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()})</span>
                : h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {sorted.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '80px 24px', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={32} color="#12C479" strokeWidth={1.8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>No payment records yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6 }}>Payments are generated from completed tasks, or you can add manual payments</div>
            </div>
            <button onClick={() => setShowAddPaymentModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
              <Plus size={15} /> Add Payment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, idx) => {
              const isLast = idx === sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).length - 1;
              const key = `${row.id}-${row.memberName}`;
              const isSelected = selectedRows.some(r => `${r.id}-${r.memberName}` === key);
              return (
                <div key={key} 
                  onClick={() => !row.isPaid && toggleRow(row)}
                  style={{
                    display: 'grid', gridTemplateColumns: '50px 560px 1.5fr 160px 130px 130px 120px 90px 90px 110px',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
                    background: isSelected ? '#EEF2FF' : row.isPaid ? 'var(--bg-surface)' : 'var(--bg-surface)',
                    transition: 'background 0.12s',
                    cursor: row.isPaid ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? '#EEF2FF' : 'var(--bg-surface)'; }}
                >
                  {/* Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => { e.stopPropagation(); toggleRow(row); }}
                      disabled={row.isPaid}
                      style={{ cursor: row.isPaid ? 'not-allowed' : 'pointer', width: 16, height: 16 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Task */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: row.isPaid ? '#ECFDF5' : '#FFF7ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {row.isPaid
                        ? <CheckCircle size={14} color="#12C479" strokeWidth={2.5} />
                        : <Clock size={14} color="#F97316" strokeWidth={2.5} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span 
                          onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); }}
                          style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: row.isPaid ? '#12C479' : '#3B5BFC', padding: '1px 6px', borderRadius: 4, flexShrink: 0, cursor: 'pointer' }}
                        >{row.id}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0, position: 'relative' }}>
                    {editingDescription === key ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                        <input
                          value={editDescriptionValue}
                          onChange={e => setEditDescriptionValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleDescriptionSave(row);
                            if (e.key === 'Escape') handleDescriptionCancel();
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            fontSize: 11,
                            color: 'var(--text-primary)',
                            background: '#fff',
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #3B5BFC',
                            outline: 'none',
                            fontWeight: 500,
                          }}
                        />
                        <button
                          onClick={() => handleDescriptionSave(row)}
                          style={{
                            background: '#ECFDF5',
                            border: 'none',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle size={12} color="#12C479" />
                        </button>
                        <button
                          onClick={handleDescriptionCancel}
                          style={{
                            background: '#FEF2F2',
                            border: 'none',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <X size={12} color="#EF4444" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleDescriptionEdit(key, row.description)}
                        onMouseEnter={() => setHoveredDescription(row.description)}
                        onMouseLeave={() => setHoveredDescription(null)}
                        style={{ 
                          fontSize: 11, 
                          color: 'var(--text-secondary)', 
                          background: 'var(--bg-subtle)', 
                          padding: '6px 12px', 
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          width: '100%',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: 32,
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#3B5BFC'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {row.description || '—'}
                      </div>
                    )}
                    {hoveredDescription === row.description && row.description && editingDescription !== key && (
                      <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px 24px',
                        background: '#fff',
                        color: '#374151',
                        fontSize: 14,
                        borderRadius: 12,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        border: '1px solid #E5E7EB',
                        whiteSpace: 'normal',
                        maxWidth: '500px',
                        lineHeight: '1.6',
                        zIndex: 10000,
                      }}>
                        {row.description}
                      </div>
                    )}
                  </div>

                  {/* Member */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, overflow: 'hidden' }}>
                    {row.isInvestment ? (
                      <>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: row.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{row.memberAvatar}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.memberName}</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: row.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{row.memberAvatar}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.memberName}</span>
                      </>
                    )}
                  </div>

                  {/* Assigned By */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{row.assignedBy}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Admin</div>
                  </div>

                  {/* Category */}
                  <div>
                    {row.category ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: row.category.bg, color: row.category.color, border: `1px solid ${row.category.color}30`, display: 'inline-block' }}>
                        {row.category.emoji} {row.category.label}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>

                  {/* Stage */}
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: row.isPaid ? '#ECFDF5' : STAGE_BG[row.stage], color: row.isPaid ? '#12C479' : STAGE_COLORS[row.stage] }}>
                      {row.isPaid ? 'Complete' : row.stage}
                    </span>
                  </div>

                  {/* Due date */}
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {new Date(row.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                      {row.isPaid && <ArrowUpRight size={12} color="#12C479" />}
                      <span style={{ fontSize: 15, fontWeight: 800, color: row.isPaid ? '#12C479' : '#F97316', letterSpacing: '-0.3px' }}>₹ {row.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: row.isPaid ? '#12C479' : '#F97316', background: row.isPaid ? '#ECFDF5' : '#FFF7ED', padding: '1px 7px', borderRadius: 6, marginTop: 2, display: 'inline-block' }}>
                      {row.isPaid ? 'paid' : 'pending'}
                    </div>
                  </div>

                  {/* Paid On */}
                  <div style={{ textAlign: 'right', paddingLeft: 16 }}>
                    {row.isPaid && row.paidOn ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#12C479' }}>
                          {new Date(row.paidOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                          {new Date(row.paidOn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal 
          selectedRows={selectedRows}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePayment}
        />
      )}

      {showAddPaymentModal && (
        <AddPaymentModal 
          team={team}
          tasks={tasks}
          onClose={() => setShowAddPaymentModal(false)}
          onAdd={handleAddPayment}
        />
      )}

      {showCategoryPaymentModal && (
        <CategoryPaymentModal
          selectedRows={selectedRows}
          team={team}
          onClose={() => setShowCategoryPaymentModal(false)}
          onConfirm={handleCategoryPayment}
        />
      )}

      {selectedPayment && (
        <PaymentDetailPanel
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        />
      )}
    </div>
  );
}
