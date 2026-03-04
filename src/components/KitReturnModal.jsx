import { useState } from 'react';
import { unitLabel } from '../utils';

const STATUS_OPTIONS = [
  { value: 'returned', label: 'Returned',  color: '#1a5a30' },
  { value: 'damaged',  label: 'Damaged',   color: '#8a6000' },
  { value: 'missing',  label: 'Missing',   color: '#7a1515' },
];

export default function KitReturnModal({ project, inventory, onSubmit, onCancel }) {
  // Build the list of units in this project kit (skip orphans)
  const kitUnits = project.kit
    .map(k => inventory.find(u => u.id === k.itemId))
    .filter(Boolean);

  const [statuses, setStatuses] = useState(
    () => Object.fromEntries(kitUnits.map(u => [u.id, 'returned']))
  );

  const setStatus = (unitId, value) =>
    setStatuses(prev => ({ ...prev, [unitId]: value }));

  const handleSubmit = () => {
    const returnItems = kitUnits.map(u => ({ unitId: u.id, status: statuses[u.id] }));
    onSubmit(returnItems);
  };

  const issueCount = Object.values(statuses).filter(s => s !== 'returned').length;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 4,
        width: '100%', maxWidth: 560, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--bd-inp)' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '.04em', color: 'var(--tx)' }}>
            KIT RETURN — {project.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--tx-dim)', marginTop: 4 }}>
            Mark the condition of each item
          </div>
        </div>

        {/* Unit list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {kitUnits.map(unit => (
            <div key={unit.id} style={{
              padding: '12px 22px', borderBottom: '1px solid var(--bd-div)',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* Unit info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--tx)' }}>
                  {unitLabel(unit, inventory)}
                </div>
                {unit.serial_number && (
                  <div style={{ fontSize: 10, color: 'var(--tx-dim)', marginTop: 2, letterSpacing: '.04em' }}>
                    {unit.serial_number}
                  </div>
                )}
              </div>

              {/* Radio options */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {STATUS_OPTIONS.map(opt => {
                  const isSelected = statuses[unit.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(unit.id, opt.value)}
                      style={{
                        padding: '5px 12px', fontSize: 10, letterSpacing: '.06em',
                        textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
                        border: `1px solid ${isSelected ? opt.color : 'var(--bd)'}`,
                        background: isSelected ? `${opt.color}22` : 'none',
                        color: isSelected ? opt.color : 'var(--tx-dim)',
                        transition: 'all .12s',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 22px', borderTop: '1px solid var(--bd-inp)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ fontSize: 11, color: issueCount > 0 ? '#c44' : 'var(--tx-dim)' }}>
            {issueCount > 0
              ? `⚠ ${issueCount} item${issueCount !== 1 ? 's' : ''} flagged`
              : 'All items accounted for'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bo" onClick={onCancel}>Cancel</button>
            <button className="by" onClick={handleSubmit}>Confirm Return</button>
          </div>
        </div>
      </div>
    </div>
  );
}
