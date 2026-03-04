import { useState, useEffect, useRef } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseLocalDate(str) {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export default function DatePicker({ value, onChange, placeholder = 'Select date' }) {
  const today    = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const parsed   = parseLocalDate(value);

  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()    ?? today.getMonth());
  const containerRef = useRef(null);

  // Sync calendar view when value changes externally.
  useEffect(() => {
    const d = parseLocalDate(value);
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (() => {
    const day = new Date(viewYear, viewMonth, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  })();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    onChange(toDateStr(viewYear, viewMonth, day));
    setOpen(false);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        className="fi"
        onClick={() => setOpen(o => !o)}
        style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ color: displayValue ? 'var(--tx)' : 'var(--tx-dim)' }}>
          {displayValue ?? placeholder}
        </span>
        <span style={{ color: 'var(--tx-muted)', fontSize: 10, marginLeft: 8, flexShrink: 0 }}>▾</span>
      </button>

      {/* Calendar popup */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: 'var(--bg-dp)', border: '1px solid var(--bd-dp)', borderRadius: 3,
          padding: 12, width: 256, boxShadow: 'var(--dp-shadow)',
        }}>
          {/* Month / year navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button
              type="button" onClick={prevMonth}
              style={{ background: 'none', border: 'none', color: 'var(--tx-muted)', cursor: 'pointer', fontSize: 20, padding: '0 8px', lineHeight: 1 }}
            >‹</button>
            <span style={{ fontSize: 12, color: 'var(--tx)', letterSpacing: '.04em', fontWeight: 500 }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button" onClick={nextMonth}
              style={{ background: 'none', border: 'none', color: 'var(--tx-muted)', cursor: 'pointer', fontSize: 20, padding: '0 8px', lineHeight: 1 }}
            >›</button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--tx-vdim)', padding: '2px 0', letterSpacing: '.04em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const isSel   = dateStr === value;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="dp-day"
                  style={{
                    background:  isSel ? 'var(--accent)' : isToday ? 'var(--dp-today-bg)' : 'transparent',
                    border:      isToday && !isSel ? '1px solid var(--dp-today-bd)' : '1px solid transparent',
                    color:       isSel ? '#090909' : isToday ? 'var(--accent)' : 'var(--dp-day)',
                    borderRadius: 2,
                    padding:     '5px 2px',
                    fontSize:    12,
                    cursor:      'pointer',
                    textAlign:   'center',
                    fontFamily:  "'DM Mono', monospace",
                    fontWeight:  isSel ? 600 : 400,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
