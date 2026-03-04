import { unitLabel } from '../utils';
import Pill from '../components/Pill';

export default function IssuesView({ inventory, onResolve }) {
  const flagged = inventory.filter(u => u.status && u.status !== 'available');
  const damaged = flagged.filter(u => u.status === 'damaged');
  const missing = flagged.filter(u => u.status === 'missing');

  const Section = ({ title, units, pillVariant }) => {
    if (!units.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10, color: '#e8b842', letterSpacing: '.12em',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          {title} ({units.length})
        </div>
        <div className="ca">
          {units.map(unit => (
            <div key={unit.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #141414', gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#c9c4ba', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {unitLabel(unit, inventory)}
                  <Pill variant={pillVariant}>{unit.status}</Pill>
                </div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 3, letterSpacing: '.04em' }}>
                  {unit.category}
                  {unit.serial_number && <span style={{ marginLeft: 12 }}>{unit.serial_number}</span>}
                </div>
              </div>
              <button
                className="bo"
                style={{ flexShrink: 0, fontSize: 10, padding: '6px 14px' }}
                onClick={() => onResolve(unit.id)}
              >
                Mark Resolved
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: '.04em', lineHeight: 1 }}>ISSUES</h1>
        <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>
          {flagged.length
            ? `${flagged.length} item${flagged.length !== 1 ? 's' : ''} need attention`
            : 'No issues — all kit is accounted for'}
        </p>
      </div>

      {!flagged.length && (
        <div style={{ border: '1px dashed #1e1e1e', borderRadius: 3, padding: '70px 0', textAlign: 'center', color: '#3a3a3a' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, marginBottom: 8 }}>ALL CLEAR</div>
          <div style={{ fontSize: 12 }}>No damaged or missing items</div>
        </div>
      )}

      <Section title="Missing" units={missing} pillVariant="red" />
      <Section title="Damaged" units={damaged} pillVariant="amber" />
    </div>
  );
}
