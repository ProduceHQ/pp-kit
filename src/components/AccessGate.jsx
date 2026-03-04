import { useState } from 'react';

const CODE = import.meta.env.VITE_ACCESS_CODE;
const STORAGE_KEY = 'pp-kit-unlocked';

export default function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === '1',
  );
  const [input, setInput]   = useState('');
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);

  if (!CODE || unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === CODE) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#090909', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-8px)}
          40%,80%{transform:translateX(8px)}
        }
        .ag-shake { animation: shake 0.4s ease; }
        .ag-input { background:#111;border:1px solid #1e1e1e;color:#d8d3c9;padding:12px 16px;font-size:14px;font-family:'DM Mono',monospace;border-radius:2px;width:100%;box-sizing:border-box;letter-spacing:.2em;text-align:center;transition:border-color .15s; }
        .ag-input:focus { outline:none;border-color:#e8b842; }
        .ag-input::placeholder { letter-spacing:.05em;color:#333; }
        .ag-btn { background:#e8b842;color:#090909;border:none;padding:12px;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border-radius:2px;width:100%;font-family:'DM Mono',monospace;transition:opacity .15s;margin-top:8px; }
        .ag-btn:hover { opacity:.85; }
      `}</style>

      <div style={{ width: 320, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: '#e8b842', letterSpacing: '.08em', marginBottom: 4 }}>
          PERSPECTIVE PICTURES
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#2a2a2a', letterSpacing: '.08em', marginBottom: 36 }}>
          / KIT
        </div>

        <form onSubmit={handleSubmit}>
          <div className={shake ? 'ag-shake' : ''}>
            <input
              className="ag-input"
              type="password"
              placeholder="Enter access code"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              autoFocus
            />
            {error && (
              <div style={{ color: '#e07070', fontSize: 11, marginTop: 8, letterSpacing: '.06em' }}>
                ✕ Incorrect access code
              </div>
            )}
          </div>
          <button className="ag-btn" type="submit">Unlock</button>
        </form>
      </div>
    </div>
  );
}
