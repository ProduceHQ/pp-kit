import { useState, useMemo, useEffect } from 'react';
import { buildBookedMap, unitLabel } from '../utils';
import Pill from '../components/Pill';
import DatePicker from '../components/DatePicker';

export default function InventoryView({ inventory, categories, projects, onAdd, onAddMultiple, onUpdate, onDelete }) {
  const today = new Date().toISOString().split('T')[0];

  // View mode state
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [checkDate, setCheckDate] = useState(today);

  // Manage mode state
  const [isManaging, setIsManaging]           = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [addForm, setAddForm]                 = useState({ category: categories[0] ?? '', name: '', count: 1, newCategoryName: '' });
  const [addIsNewCat, setAddIsNewCat]         = useState(false);
  const [addError, setAddError]               = useState('');
  const [manageSearch, setManageSearch]       = useState('');

  // If the active category filter no longer exists, reset to All.
  useEffect(() => {
    if (category !== 'All' && !categories.includes(category)) setCategory('All');
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Booked set: Set<unitId> for the selected check date.
  const bookedSet = useMemo(
    () => buildBookedMap(inventory, checkDate, checkDate, projects),
    [inventory, checkDate, projects],
  );

  const filteredUnits = useMemo(
    () => inventory.filter(unit =>
      (category === 'All' || unit.category === category) &&
      (unit.name.toLowerCase().includes(search.toLowerCase()) ||
       (unit.serial_number ?? '').toLowerCase().includes(search.toLowerCase()))
    ),
    [inventory, search, category],
  );

  // Group inventory by category → name for manage mode.
  const nameGroups = useMemo(() => {
    const result = {};
    for (const cat of categories) {
      const units = inventory.filter(u => u.category === cat);
      if (!units.length) continue;
      const byName = {};
      for (const unit of units) {
        (byName[unit.name] ??= []).push(unit);
      }
      result[cat] = byName; // { cat: { name: unit[] } }
    }
    return result;
  }, [inventory, categories]);

  const startManaging = () => {
    setIsManaging(true);
    setConfirmDeleteId(null);
    setAddError('');
    setManageSearch('');
    setAddForm({ category: categories[0] ?? '', name: '', count: 1, newCategoryName: '' });
    setAddIsNewCat(false);
  };

  const handleAdd = () => {
    const cat = addIsNewCat ? addForm.newCategoryName.trim() : addForm.category;
    if (!cat) { setAddError('Category is required.'); return; }
    if (!addForm.name.trim()) { setAddError('Item name is required.'); return; }

    const name = addForm.name.trim();
    const count = Math.max(1, addForm.count);

    // Find highest existing unit_number for this name+category in inventory
    const existing = inventory.filter(u => u.category === cat && u.name === name);
    const maxNum = existing.reduce((m, u) => Math.max(m, u.unit_number ?? 0), 0);

    if (count === 1) {
      onAdd({ category: cat, name, unit_number: maxNum + 1 });
    } else {
      const units = Array.from({ length: count }, (_, i) => ({
        category: cat,
        name,
        unit_number: maxNum + i + 1,
        serial_number: null,
      }));
      onAddMultiple(units);
    }

    setAddForm(f => ({ ...f, name: '', count: 1, newCategoryName: '' }));
    setAddIsNewCat(false);
    setAddError('');
  };

  // ── MANAGE MODE ────────────────────────────────────────────────────────────
  if (isManaging) {
    return (
      <div>
        <div className="inv-titlerow" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 34, letterSpacing: '-.02em', lineHeight: 1, textTransform: 'uppercase' }}>MANAGE INVENTORY</h1>
            <p style={{ color: 'var(--tx-dim)', fontSize: 11, fontWeight: 500, marginTop: 4 }}>{inventory.length} units across {categories.length} categories</p>
          </div>
          <button className="by" onClick={() => { setIsManaging(false); setConfirmDeleteId(null); }}>Done Editing</button>
        </div>

        {/* Search bar */}
        <div className="sw" style={{ marginBottom: 10 }}>
          <span>⌕</span>
          <input
            className="fi"
            placeholder="Search items or serial numbers…"
            value={manageSearch}
            onChange={e => setManageSearch(e.target.value)}
          />
        </div>

        {/* Add Item form */}
        <div className="ca" style={{ padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Add New Item
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Category */}
            <div style={{ minWidth: 160 }}>
              <select
                className="fi"
                value={addIsNewCat ? '__new__' : addForm.category}
                onChange={e => {
                  if (e.target.value === '__new__') { setAddIsNewCat(true); }
                  else { setAddIsNewCat(false); setAddForm(f => ({ ...f, category: e.target.value })); }
                }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new__">+ New category…</option>
              </select>
              {addIsNewCat && (
                <input
                  className="fi"
                  placeholder="Category name"
                  value={addForm.newCategoryName}
                  onChange={e => setAddForm(f => ({ ...f, newCategoryName: e.target.value }))}
                  style={{ marginTop: 6 }}
                />
              )}
            </div>
            {/* Name */}
            <input
              className="fi"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="Item name"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            {/* Count (number of units to create) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--tx-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Units</span>
              <input
                type="number" className="qb" min={1}
                value={addForm.count}
                onChange={e => setAddForm(f => ({ ...f, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                style={{ width: 60 }}
              />
            </div>
            <button className="by" onClick={handleAdd}>+ Add</button>
          </div>
          {addError && <div style={{ color: '#e07070', fontSize: 11, marginTop: 8 }}>⚠ {addError}</div>}
        </div>

        {/* Editable unit list grouped by category → name */}
        <div className="ca">
          {Object.entries(nameGroups).map(([cat, byName]) => {
            const q = manageSearch.toLowerCase();
            // Filter names/units by search query
            const filteredByName = Object.fromEntries(
              Object.entries(byName)
                .map(([name, units]) => [name, units.filter(u =>
                  !q ||
                  name.toLowerCase().includes(q) ||
                  (u.serial_number ?? '').toLowerCase().includes(q)
                )])
                .filter(([, units]) => units.length > 0)
            );
            if (!Object.keys(filteredByName).length) return null;
            return (
              <div key={cat}>
                <div className="dl">{cat}</div>
                {Object.entries(filteredByName).map(([name, units]) => (
                  <div key={name}>
                    {/* Name group header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 14px 4px', background: 'var(--bg-sub)', borderBottom: '1px solid var(--bd-sub)',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--tx-muted)', letterSpacing: '.04em' }}>{name}</span>
                      <button
                        className="bo"
                        style={{ padding: '3px 10px', fontSize: 10 }}
                        onClick={() => {
                          const maxNum = byName[name].reduce((m, u) => Math.max(m, u.unit_number ?? 0), 0);
                          onAdd({ category: cat, name, unit_number: maxNum + 1 });
                        }}
                      >
                        + Add unit
                      </button>
                    </div>

                    {/* Individual unit rows */}
                    {units.map(unit => {
                      const status = unit.status && unit.status !== 'available' ? unit.status : 'available';
                      return (
                        <div key={unit.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderBottom: '1px solid var(--bd-sub)',
                        }}>
                          {/* Unit number badge */}
                          <span style={{ fontSize: 10, color: 'var(--tx-dim)', letterSpacing: '.06em', flexShrink: 0, minWidth: 28 }}>
                            #{unit.unit_number}
                          </span>
                          {/* Name */}
                          <input
                            className="fi"
                            style={{ flex: 1 }}
                            value={unit.name}
                            onChange={e => onUpdate(unit.id, { name: e.target.value })}
                          />
                          {/* Serial number */}
                          <input
                            className="fi"
                            style={{ flex: 1, color: 'var(--tx-muted)' }}
                            placeholder="Serial number (optional)"
                            value={unit.serial_number ?? ''}
                            onChange={e => onUpdate(unit.id, { serial_number: e.target.value || null })}
                          />
                          {/* Status */}
                          <select
                            className="fi"
                            style={{
                              width: 100, flexShrink: 0,
                              color: status === 'damaged' ? '#e8a000' : status === 'missing' ? '#c44' : 'var(--tx-muted)',
                            }}
                            value={status}
                            onChange={e => onUpdate(unit.id, { status: e.target.value === 'available' ? null : e.target.value })}
                          >
                            <option value="available">OK</option>
                            <option value="damaged">Damaged</option>
                            <option value="missing">Missing</option>
                          </select>
                          {/* Delete */}
                          {confirmDeleteId === unit.id ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: '#c44', whiteSpace: 'nowrap' }}>Delete?</span>
                              <button className="bd" onClick={() => { onDelete(unit.id); setConfirmDeleteId(null); }}>Confirm</button>
                              <button className="bo" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="bd" style={{ flexShrink: 0 }} onClick={() => setConfirmDeleteId(unit.id)}>Delete</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--tx-vdim)', fontSize: 12 }}>
              No items yet. Add one above.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="inv-titlerow">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 34, letterSpacing: '-.02em', lineHeight: 1, textTransform: 'uppercase' }}>KIT INVENTORY</h1>
          <p style={{ color: 'var(--tx-dim)', fontSize: 11, fontWeight: 500, marginTop: 4 }}>{inventory.length} units across {categories.length} categories</p>
        </div>
        <button className="bo inv-manage-btn" onClick={startManaging}>Manage Inventory</button>
      </div>
      <div className="inv-filterrow">
        <div>
          <label style={{ display: 'block', fontSize: 10, color: 'var(--tx-dim)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>
            Availability as of
          </label>
          <DatePicker value={checkDate} onChange={setCheckDate} />
        </div>
        <div className="sw" style={{ flex: 1, minWidth: 0 }}>
          <span>⌕</span>
          <input className="fi" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="fi" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          <option>All</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ columns: '280px', columnGap: 10 }}>
        {categories.filter(c => category === 'All' || c === category).map(cat => {
          const units = filteredUnits.filter(u => u.category === cat);
          if (!units.length) return null;

          // Group by name within this category for the stacked view
          const byName = {};
          for (const unit of units) (byName[unit.name] ??= []).push(unit);

          return (
            <div key={cat} className="ca" style={{ breakInside: 'avoid', marginBottom: 10 }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: 'var(--accent)', textTransform: 'uppercase' }}>{cat}</span>
                <span style={{ fontSize: 10, color: 'var(--tx-vdim)' }}>({Object.keys(byName).length})</span>
              </div>
              {Object.entries(byName).map(([name, nameUnits]) => {
                const total  = nameUnits.length;
                // A unit is unavailable if it's booked OR flagged damaged/missing
                const free   = nameUnits.filter(u => !bookedSet.has(u.id) && (!u.status || u.status === 'available')).length;
                const allOut = free === 0;
                const someOut = free < total;
                return (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--bd-sub)', gap: 8 }}>
                    <span style={{ fontSize: 12, color: allOut ? 'var(--tx-vdim)' : 'var(--tx)' }}>{name}</span>
                    <div style={{ marginLeft: 8, flexShrink: 0 }}>
                      {allOut
                        ? <Pill variant="red">0/{total}</Pill>
                        : someOut
                          ? <Pill variant="amber">{free}/{total}</Pill>
                          : <Pill variant="green">{free}/{total}</Pill>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
