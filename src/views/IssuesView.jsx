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
          fontSize: 10, fontWeight: 700, color: 'var(--tx-muted)', letterSpacing: '.15em',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          {title} ({units.length})
        </div>
        <div className="ca">
          {units.map(unit => (
            <div key={unit.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid var(--bd-sub)', gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {unitLabel(unit, inventory)}
                  <Pill variant={pillVariant}>{unit.status}</Pill>
                </div>
                <div style={{ fontSize: 10, color: 'var(--tx-muted)', marginTop: 3, letterSpacing: '.04em' }}>
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
      <div className="issues-hdr">
        <h1 style={{ fontWeight: 900, fontSize: 34, letterSpacing: '-.02em', lineHeight: 1, textTransform: 'uppercase' }}>ISSUES</h1>
        <p style={{ color: 'var(--tx-dim)', fontSize: 11, fontWeight: 500, marginTop: 4 }}>
          {flagged.length
            ? `${flagged.length} item${flagged.length !== 1 ? 's' : ''} need attention`
            : 'No issues — all kit is accounted for'}
        </p>
      </div>

      {!flagged.length && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '70px 0', textAlign: 'center', color: 'var(--tx-vdim)' }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-.01em', textTransform: 'uppercase', marginBottom: 8 }}>ALL CLEAR</div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>No damaged or missing items</div>
        </div>
      )}

      <Section title="Missing" units={missing} pillVariant="red" />
      <Section title="Damaged" units={damaged} pillVariant="amber" />
    </div>
  );
}
