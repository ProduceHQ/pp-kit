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
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        .rs-btn {
          background: none;
          border: 1px solid #2a2a2a;
          color: #888;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
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
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 28, color: '#e8b842', letterSpacing: '.05em', marginBottom: 4 }}>
          PERSPECTIVE PICTURES
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 18, color: '#2a2a2a', letterSpacing: '.05em', marginBottom: 40 }}>
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
