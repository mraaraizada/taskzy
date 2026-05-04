import { useState, useRef } from 'react';
import { Upload, ArrowRight } from 'lucide-react';

export default function WorkspaceSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [nameFocus, setNameFocus] = useState(false);
  const [subtitleFocus, setSubtitleFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onComplete({ name: name.trim(), subtitle: subtitle.trim(), logo: logoPreview });
    }, 800);
  };

  const inp = (focused) => ({
    width: '100%', height: 48, borderRadius: 10,
    border: `1.5px solid ${focused ? '#3B5BFC' : '#E5E7EB'}`,
    padding: '0 16px', fontSize: 14, color: '#1A1D2E', outline: 'none',
    background: focused ? '#F5F7FF' : '#FAFBFF',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(59,91,252,0.10)' : 'none',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      background: 'rgba(15,20,40,0.35)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 44px 36px',
        width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(59,91,252,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.9)',
        animation: 'wsSetupIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <style>{`
          @keyframes wsSetupIn {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D2E', letterSpacing: '-0.6px', marginBottom: 4 }}>Set up your workspace</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Personalise your workspace before you get started</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Logo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
            <div
              onClick={() => fileRef.current.click()}
              style={{ width: 64, height: 64, borderRadius: 16, border: '2px dashed #E5E7EB', background: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3B5BFC'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
            >
              {logoPreview
                ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Upload size={20} color="#9CA3AF" />
              }
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E', marginBottom: 2 }}>Workspace Logo</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>PNG, JPG up to 2MB</div>
              <button type="button" onClick={() => fileRef.current.click()} style={{ marginTop: 4, background: 'none', border: 'none', color: '#3B5BFC', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                {logoPreview ? 'Change image' : 'Upload image'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          {/* Workspace name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Workspace Name *</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              style={inp(nameFocus)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Subtitle <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="e.g. Design & Development Team"
              style={inp(subtitleFocus)}
              onFocus={() => setSubtitleFocus(true)}
              onBlur={() => setSubtitleFocus(false)}
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{ width: '100%', height: 50, borderRadius: 12, border: loading ? '1.5px solid #EEF2FF' : 'none', background: loading ? '#F5F7FF' : name.trim() ? 'linear-gradient(135deg, #3B5BFC, #7C3AED)' : '#E5E7EB', color: name.trim() ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 700, cursor: loading || !name.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: name.trim() && !loading ? '0 6px 20px rgba(59,91,252,0.3)' : 'none', transition: 'all 0.2s', marginTop: 4 }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid #EEF2FF', borderTopColor: '#3B5BFC', animation: 'spin 0.7s linear infinite' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#3B5BFC' }}>Setting up…</span>
              </div>
            ) : (
              <>Go to Dashboard <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
