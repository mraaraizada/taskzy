import { useState } from 'react';
import { notify } from '../../lib/notify';
import { Send, CheckCircle, Clock, X, HelpCircle, MessageSquare, Edit2, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function ResponseForm({ submissionId, onResolve, initialResponse = '', isEditing = false, onCancelEdit }) {
  const [responseText, setResponseText] = useState(initialResponse);
  const handleSubmit = () => {
    if (!responseText.trim()) return;
    onResolve(submissionId, responseText.trim());
    setResponseText('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isEditing ? 'Edit Response' : 'Write Response'}</label>
        {isEditing && <button onClick={onCancelEdit} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>}
      </div>
      <textarea value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Type your response…" rows={5}
        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#3B5BFC'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      <button onClick={handleSubmit} disabled={!responseText.trim()} style={{ alignSelf: 'flex-start', padding: '10px 22px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: responseText.trim() ? 'pointer' : 'not-allowed', background: responseText.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)', color: responseText.trim() ? '#fff' : 'var(--text-muted)', boxShadow: responseText.trim() ? '0 4px 12px rgba(59,91,252,0.3)' : 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
        <CheckCircle size={14} /> {isEditing ? 'Update Response' : 'Mark as Solved'}
      </button>
    </div>
  );
}

function SubmitModal({ member, onClose }) {
  const { setHelpSubmissions } = useApp();
  const [helpText, setHelpText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!helpText.trim()) return;
    setHelpSubmissions(prev => [{
      id: Date.now(),
      member: { name: member.name, role: member.role, avatar: member.avatar, color: member.color },
      message: helpText.trim(),
      timestamp: new Date(),
      status: 'pending',
      response: null,
    }, ...prev]);
    setSubmitted(true);
    notify.helpSubmitted('Your request has been sent to the admin team');
    setTimeout(() => onClose(), 1800);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-surface)', borderRadius: 18, padding: '28px', width: 480, border: '1.5px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={18} color="#3B5BFC" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Submit Help Request</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Describe your issue or question</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        {submitted ? (
          <div style={{ background: '#ECFDF5', border: '1.5px solid #12C479', borderRadius: 12, padding: '18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={22} color="#12C479" strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>Request Submitted</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Your help request has been sent.</div>
            </div>
          </div>
        ) : (
          <>
            <textarea value={helpText} onChange={e => { if (e.target.value.length <= 1000) setHelpText(e.target.value); }}
              placeholder="Describe your issue, question, or request for assistance…"
              rows={6}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!helpText.trim()} style={{ padding: '9px 20px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: helpText.trim() ? 'pointer' : 'not-allowed', background: helpText.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)', color: helpText.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 7, boxShadow: helpText.trim() ? '0 4px 12px rgba(59,91,252,0.3)' : 'none' }}>
                <Send size={13} /> Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ManagementHelp({ member }) {
  const { helpSubmissions, setHelpSubmissions } = useApp();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editingResponse, setEditingResponse] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const pendingCount = helpSubmissions.filter(s => s.status === 'pending').length;
  const solvedCount  = helpSubmissions.filter(s => s.status === 'solved').length;

  function handleResolve(submissionId, responseText) {
    setHelpSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'solved', response: responseText } : s));
    setSelectedSubmission(prev => prev?.id === submissionId ? { ...prev, status: 'solved', response: responseText } : prev);
    setEditingResponse(false);
    notify.helpResolved();
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header row with + button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowSubmitModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,91,252,0.3)' }}>
          <Plus size={15} /> Submit Help
        </button>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', gap: 20 }}>
        {/* Left: detail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>
            {selectedSubmission ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: selectedSubmission.member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: `0 4px 10px ${selectedSubmission.member.color}55` }}>
                      {selectedSubmission.member.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedSubmission.member.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selectedSubmission.member.role} • {selectedSubmission.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedSubmission(null); setEditingResponse(false); }} style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--bg-surface)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <X size={14} /> Close
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedSubmission.status === 'solved'
                      ? <><CheckCircle size={16} color="#12C479" strokeWidth={2.5} /><span style={{ fontSize: 13, fontWeight: 700, color: '#12C479' }}>Solved</span></>
                      : <><Clock size={16} color="#F97316" strokeWidth={2.5} /><span style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>Pending</span></>
                    }
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Message</label>
                    <div style={{ padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-subtle)', lineHeight: 1.6 }}>{selectedSubmission.message}</div>
                  </div>
                  {selectedSubmission.status === 'solved' && !editingResponse ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Response</label>
                        <button onClick={() => setEditingResponse(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Edit2 size={11} /> Edit
                        </button>
                      </div>
                      <div style={{ padding: '14px 16px', border: '1.5px solid #12C479', borderRadius: 12, fontSize: 14, color: '#059669', background: '#ECFDF5', lineHeight: 1.6 }}>{selectedSubmission.response}</div>
                    </div>
                  ) : (
                    <ResponseForm submissionId={selectedSubmission.id} onResolve={handleResolve} initialResponse={editingResponse ? selectedSubmission.response : ''} isEditing={editingResponse} onCancelEdit={() => setEditingResponse(false)} />
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12 }}>
                <MessageSquare size={40} color="#C4C9D9" />
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>No Submission Selected</div>
                <div style={{ fontSize: 14 }}>Select a help request from the right panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: list */}
        <div style={{ width: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1.5px solid var(--border-light)', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Help Submissions</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} color="#F97316" strokeWidth={2.5} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316' }}>{pendingCount} Pending</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} color="#12C479" strokeWidth={2.5} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#12C479' }}>{solvedCount} Solved</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {helpSubmissions.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '48px 20px', gap: 12, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={24} color="#F97316" strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>No help requests yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 220 }}>Team members can submit help requests from their dashboard</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {helpSubmissions.map(sub => (
                    <div key={sub.id} onClick={() => { setSelectedSubmission(sub); setEditingResponse(false); }}
                      style={{ background: sub.status === 'solved' ? 'var(--bg-subtle)' : '#FFFBEB', border: `1.5px solid ${selectedSubmission?.id === sub.id ? '#3B5BFC' : sub.status === 'solved' ? 'var(--border)' : '#FDE68A'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: sub.member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>{sub.member.avatar}</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{sub.member.name}</span>
                        </div>
                        {sub.status === 'solved'
                          ? <CheckCircle size={13} color="#12C479" strokeWidth={2.5} />
                          : <Clock size={13} color="#F97316" strokeWidth={2.5} />
                        }
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {sub.message.split(' ').slice(0, 12).join(' ')}{sub.message.split(' ').length > 12 ? '…' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && <SubmitModal member={member} onClose={() => setShowSubmitModal(false)} />}
    </div>
  );
}
