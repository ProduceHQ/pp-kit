import { useState, useMemo, useEffect } from 'react';
import { buildBookedMap } from '../utils';
import Pill from '../components/Pill';
import DatePicker from '../components/DatePicker';

export default function InventoryView({ inventory, categories, projects, onAdd, onUpdate, onDelete }) {
  const today = new Date().toISOString().split('T')[0];

  // View mode state
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [checkDate, setCheckDate] = useState(today);

  // Manage mode state
  const [isManaging, setIsManaging]         = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [addForm, setAddForm]               = useState({ category: categories[0] ?? '', name: '', qty: 1, newCategoryName: '' });
  const [addIsNewCat, setAddIsNewCat]       = useState(false);
  const [addError, setAddError]             = useState('');

  // If the active category filter no longer exists, reset to All.
  useEffect(() => {
    if (category !== 'All' && !categories.includes(category)) setCategory('All');
  }, [categories]);

  const bookedMap = useMemo(
    () => buildBookedMap(inventory, checkDate, checkDate, projects),
    [inventory, checkDate, projects],
  );

  const filteredItems = useMemo(
    () => inventory.filter(item =>
      (category === 'All' || item.category === category) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
    [inventory, search, category],
  );

  const startManaging = () => {
    setIsManaging(true);
    setConfirmDeleteId(null);
    setAddError('');
    setAddForm({ category: categories[0] ?? '', name: '', qty: 1, newCategoryName: '' });
    setAddIsNewCat(false);
  };

  const handleAdd = () => {
    const cat = addIsNewCat ? addForm.newCategoryName.trim() : addForm.category;
    if (!cat) { setAddError('Category is required.'); return; }
    if (!addForm.name.trim()) { setAddError('Item name is required.'); return; }
    onAdd({ category: cat, name: addForm.name.trim(), qty: addForm.qty });
    setAddForm(f => ({ ...f, name: '', qty: 1, newCategoryName: '' }));
    setAddIsNewCat(false);
    setAddError('');
  };

  // ── MANAGE MODE ────────────────────────────────────────────────────────────
  if (isManaging) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: '.04em', lineHeight: 1 }}>MANAGE INVENTORY</h1>
            <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>{inventory.length} items across {categories.length} categories</p>
          </div>
          <button className="by" onClick={() => { setIsManaging(false); setConfirmDeleteId(null); }}>Done Editing</button>
        </div>

        {/* Add Item form */}
        <div className="ca" style={{ padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#e8b842', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
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
            {/* Qty */}
            <input
              type="number" className="qb" min={1}
              value={addForm.qty}
              onChange={e => setAddForm(f => ({ ...f, qty: Math.max(1, parseInt(e.target.value) || 1) }))}
              style={{ width: 60 }}
            />
            <button className="by" onClick={handleAdd}>+ Add</button>
          </div>
          {addError && <div style={{ color: '#e07070', fontSize: 11, marginTop: 8 }}>⚠ {addError}</div>}
        </div>

        {/* Editable item list grouped by category */}
        <div className="ca">
          {categories.map(cat => {
            const catItems = inventory.filter(item => item.category === cat);
            if (!catItems.length) return null;
            return (
              <div key={cat}>
                <div className="dl">{cat} ({catItems.length})</div>
                {catItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderBottom: '1px solid #141414',
                  }}>
                    <input
                      className="fi"
                      style={{ flex: 1 }}
                      value={item.name}
                      onChange={e => onUpdate(item.id, { name: e.target.value })}
                    />
                    <input
                      type="number" className="qb" min={1}
                      value={item.qty}
                      onChange={e => onUpdate(item.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ width: 60, flexShrink: 0 }}
                    />
                    {confirmDeleteId === item.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#c44', whiteSpace: 'nowrap' }}>Delete?</span>
                        <button className="bd" onClick={() => { onDelete(item.id); setConfirmDeleteId(null); }}>Confirm</button>
                        <button className="bo" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="bd" style={{ flexShrink: 0 }} onClick={() => setConfirmDeleteId(item.id)}>Delete</button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#3a3a3a', fontSize: 12 }}>
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: '.04em', lineHeight: 1 }}>KIT INVENTORY</h1>
          <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>{inventory.length} items across {categories.length} categories</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button className="bo" onClick={startManaging}>Manage Inventory</button>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#444', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>
              Availability as of
            </label>
            <DatePicker value={checkDate} onChange={setCheckDate} />
          </div>
          <div className="sw" style={{ width: 200 }}>
            <span>⌕</span>
            <input className="fi" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="fi" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
            <option>All</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
        {categories.filter(c => category === 'All' || c === category).map(cat => {
          const items = filteredItems.filter(item => item.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="ca">
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #181818', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, letterSpacing: '.1em', color: '#e8b842', textTransform: 'uppercase' }}>{cat}</span>
                <span style={{ fontSize: 10, color: '#2e2e2e' }}>({items.length})</span>
              </div>
              {items.map(item => {
                const booked = bookedMap[item.id] ?? 0;
                const avail  = item.qty - booked;
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid #111' }}>
                    <span style={{ fontSize: 12, color: avail === 0 ? '#3a3a3a' : '#c9c4ba' }}>{item.name}</span>
                    <div style={{ marginLeft: 8, flexShrink: 0 }}>
                      {avail === 0
                        ? <Pill variant="red">Out</Pill>
                        : avail < item.qty
                          ? <Pill variant="amber">{avail}/{item.qty}</Pill>
                          : <Pill variant="green">{item.qty}</Pill>
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
