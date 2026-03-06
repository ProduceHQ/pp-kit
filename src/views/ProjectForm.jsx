import { useState, useMemo } from 'react';
import { buildBookedMap, unitLabel } from '../utils';
import DatePicker from '../components/DatePicker';

export default function ProjectForm({ inventory, categories, initialData, projects, editId, region, onSave, onBack }) {
  const [form, setForm] = useState({
    name:      initialData?.name      ?? '',
    number:    initialData?.number    ?? '',
    startDate: initialData?.startDate ?? '',
    endDate:   initialData?.endDate   ?? '',
  });
  const [formKit, setFormKit]                   = useState(initialData?.kit.map(k => ({ ...k })) ?? []);
  const [error, setError]                       = useState('');
  const [kitSearch, setKitSearch]               = useState('');
  const [activeCat, setActiveCat]               = useState(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  // Detect unsaved changes to guard the Back/Cancel actions.
  const isDirty = useMemo(() => {
    if (!initialData) {
      return form.name !== '' || form.number !== '' ||
             form.startDate !== '' || form.endDate !== '' ||
             formKit.length > 0;
    }
    return (
      form.name      !== initialData.name      ||
      form.number    !== initialData.number    ||
      form.startDate !== initialData.startDate ||
      form.endDate   !== initialData.endDate   ||
      JSON.stringify(formKit) !== JSON.stringify(initialData.kit)
    );
  }, [form, formKit, initialData]);

  // Set of booked unit IDs over the chosen date range (excluding this project when editing).
  const bookedSet = useMemo(
    () => buildBookedMap(inventory, form.startDate, form.endDate, projects, editId),
    [inventory, form.startDate, form.endDate, projects, editId],
  );

  // Group units by category, filtered by search (name or serial number).
  const kitGroups = useMemo(() => {
    const filtered = inventory.filter(unit => {
      const q = kitSearch.toLowerCase();
      return (
        unit.name.toLowerCase().includes(q) ||
        (unit.serial_number ?? '').toLowerCase().includes(q)
      );
    });
    return categories
      .map(cat => ({ cat, units: filtered.filter(u => u.category === cat) }))
      .filter(group => group.units.length > 0);
  }, [inventory, categories, kitSearch]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const toggleItem = (unitId) => {
    setFormKit(prev =>
      prev.find(k => k.itemId === unitId)
        ? prev.filter(k => k.itemId !== unitId)
        : [...prev, { itemId: unitId }]
    );
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Start and end dates are required.');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('Start date must be before end date.');
      return;
    }
    if (!formKit.length) {
      setError('Select at least one kit item.');
      return;
    }
    onSave({ ...form, kit: formKit });
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveWarning(true);
    } else {
      onBack();
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Unsaved changes warning banner */}
      {showLeaveWarning && (
        <div style={{
          background: '#130a00', border: '1px solid #5a3a00', borderRadius: 3,
          padding: '13px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <span style={{ fontSize: 12, color: '#e0a040' }}>⚠ You have unsaved changes. Leave anyway?</span>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="bo" onClick={onBack}>Discard changes</button>
            <button className="by" onClick={() => setShowLeaveWarning(false)}>Keep editing</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <button className="bo" onClick={handleBack}>← Back</button>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: '.04em' }}>
          {editId ? 'EDIT PROJECT' : 'NEW PROJECT'}
        </h1>
      </div>

      {/* Project details */}
      <div className="ca" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Project Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 10, color: 'var(--tx-dim)', display: 'block', marginBottom: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Project Name *
            </label>
            <input
              className="fi"
              placeholder="e.g. Nike Spring Campaign"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--tx-dim)', display: 'block', marginBottom: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Project Number
            </label>
            <input
              className="fi"
              value={form.number}
              onChange={e => updateField('number', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--tx-dim)', display: 'block', marginBottom: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Start Date *
              </label>
              <DatePicker
                value={form.startDate}
                onChange={v => updateField('startDate', v)}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--tx-dim)', display: 'block', marginBottom: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                End Date *
              </label>
              <DatePicker
                value={form.endDate}
                onChange={v => updateField('endDate', v)}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kit selector */}
      <div className="ca" style={{ marginBottom: 14 }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--bd-cat)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Select Kit</span>
            {(!form.startDate || !form.endDate) && (
              <span style={{ fontSize: 11, color: 'var(--tx-dim)', fontStyle: 'italic' }}>Set dates to see live availability</span>
            )}
          </div>
          <span style={{ fontSize: 11, color: formKit.length ? 'var(--accent)' : 'var(--tx-dim)' }}>{formKit.length} selected</span>
        </div>

        {/* Category tabs */}
        <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--bd-sub)', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <button className={`ct${activeCat === null ? ' on' : ''}`} onClick={() => setActiveCat(null)}>All</button>
          {categories.map(c => (
            <button key={c} className={`ct${activeCat === c ? ' on' : ''}`} onClick={() => setActiveCat(activeCat === c ? null : c)}>{c}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--bd-sub)' }}>
          <div className="sw">
            <span>⌕</span>
            <input className="fi" placeholder="Search kit or serial number..." value={kitSearch} onChange={e => setKitSearch(e.target.value)} />
          </div>
        </div>

        {/* Unit rows — grouped by name within each category */}
        <div style={{ maxHeight: 450, overflowY: 'auto' }} role="list">
          {kitGroups.filter(group => activeCat === null || group.cat === activeCat).map(({ cat, units }) => {
            // Group units by name within this category
            const byName = {};
            for (const unit of units) (byName[unit.name] ??= []).push(unit);

            return (
              <div key={cat}>
                <div className="dl">{cat}</div>
                {Object.entries(byName).map(([name, nameUnits]) => {
                  const availableUnits = nameUnits.filter(u => {
                    const sel = formKit.some(k => k.itemId === u.id);
                    return !((bookedSet.has(u.id) && !sel) || (u.status && u.status !== 'available' && !sel));
                  });
                  const allSelected = availableUnits.length > 0 && availableUnits.every(u => formKit.some(k => k.itemId === u.id));
                  return (
                  <div key={name}>
                    {/* Item name header row */}
                    <div style={{
                      padding: '6px 14px',
                      background: 'var(--bg-sub)',
                      borderBottom: '1px solid var(--bd-sub)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--tx-sub)' }}>{name}</span>
                      {nameUnits.length > 1 && availableUnits.length > 0 && (
                        <button
                          className="bo"
                          style={{ padding: '2px 10px', fontSize: 10, flexShrink: 0 }}
                          onClick={() => {
                            if (allSelected) {
                              setFormKit(prev => prev.filter(k => !availableUnits.some(u => u.id === k.itemId)));
                            } else {
                              const toAdd = availableUnits.filter(u => !formKit.some(k => k.itemId === u.id));
                              setFormKit(prev => [...prev, ...toAdd.map(u => ({ itemId: u.id }))]);
                            }
                          }}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    {/* Individual unit sub-rows */}
                    {nameUnits.map(unit => {
                      const sel     = formKit.some(k => k.itemId === unit.id);
                      const flagged = unit.status && unit.status !== 'available';
                      // Locked if: booked by another project, OR flagged damaged/missing (and not already in this form's kit)
                      const locked  = (bookedSet.has(unit.id) && !sel) || (flagged && !sel);

                      return (
                        <button
                          key={unit.id}
                          role="listitem"
                          className={`ro${sel ? ' sl' : ''}`}
                          onClick={() => { if (!locked) toggleItem(unit.id); }}
                          disabled={locked}
                          aria-pressed={sel}
                          aria-label={`${name} unit ${unit.unit_number}. ${locked ? 'Not available' : 'Available'}${sel ? ', selected' : ''}`}
                          style={{ paddingLeft: 28 }}
                        >
                          <div className={`ck${sel ? ' on' : ''}`} aria-hidden="true">
                            {sel && <span style={{ fontSize: 11, color: '#090909', fontWeight: 700 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <span style={{ fontSize: 11, color: locked ? 'var(--tx-vdim)' : 'var(--tx-muted)', letterSpacing: '.04em' }}>
                              ({unit.unit_number})
                            </span>
                            {unit.serial_number && (
                              <span style={{ fontSize: 11, color: locked ? 'var(--tx-vdim)' : 'var(--tx-muted)', marginLeft: 10, letterSpacing: '.04em' }}>
                                {unit.serial_number}
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize: 11, minWidth: 60, textAlign: 'right', flexShrink: 0,
                            color: locked ? '#4a1515' : '#1a5a30',
                          }}>
                            {flagged && !sel ? unit.status.toUpperCase() : locked ? 'BOOKED' : 'FREE'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking summary */}
      {formKit.length > 0 && (
        <div className="ca" style={{ padding: '14px 18px', marginBottom: 14, borderColor: '#1c1500' }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Booking Summary
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {formKit.map(k => {
              const unit = inventory.find(u => u.id === k.itemId);
              return unit ? (
                <span key={k.itemId} style={{
                  background: '#130f00', border: '1px solid #2a2000',
                  borderRadius: 2, padding: '4px 12px', fontSize: 11, color: '#c0a040',
                }}>
                  {unitLabel(unit, inventory)}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <div style={{
          background: '#130606', border: '1px solid #4a1515', borderRadius: 2,
          padding: '10px 16px', fontSize: 12, color: '#e07070', marginBottom: 14,
        }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="bo" onClick={handleBack}>Cancel</button>
        <button className="by" onClick={handleSave}>{editId ? 'Save Changes' : 'Create Booking'}</button>
      </div>
    </div>
  );
}
