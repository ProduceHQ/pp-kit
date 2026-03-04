import { useEffect } from 'react';

const REGIONS = ['London', 'Dubai'];
const STORAGE_KEY = 'pp-kit-region';

export default function RegionSelect({ onSelect }) {
  // If a valid region is already stored in this session, skip the picker.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (REGIONS.includes(stored)) onSelect(stored);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (region) => {
    sessionStorage.setItem(STORAGE_KEY, region);
    onSelect(region);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#090909', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        .rs-btn {
          background: none;
          border: 1px solid #2a2a2a;
          color: #888;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: .12em;
          text-transform: uppercase;
          padding: 18px 48px;
          cursor: pointer;
          border-radius: 2px;
          width: 100%;
          transition: all .15s;
        }
        .rs-btn:hover {
          border-color: #e8b842;
          color: #e8b842;
          background: #0d0a00;
        }
      `}</style>

      <div style={{ width: 280, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: '#e8b842', letterSpacing: '.08em', marginBottom: 4 }}>
          PERSPECTIVE PICTURES
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#2a2a2a', letterSpacing: '.08em', marginBottom: 40 }}>
          / KIT
        </div>

        <div style={{ fontSize: 10, color: '#444', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Select your office
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REGIONS.map(region => (
            <button
              key={region}
              className="rs-btn"
              onClick={() => handleSelect(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
