import { useState, useLayoutEffect, useEffect, useMemo } from 'react';
import * as api from './lib/api';
import AccessGate from './components/AccessGate';
import RegionSelect from './components/RegionSelect';
import InventoryView from './views/InventoryView';
import ProjectsView  from './views/ProjectsView';
import ProjectForm   from './views/ProjectForm';
import IssuesView    from './views/IssuesView';

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}

  /* ── Theme variables ─────────────────────────────────────────────────────── */
  :root,[data-theme="dark"]{
    --bg:#090909;--bg-card:#0e0e0e;--bg-proj:#0c0c0c;--bg-sub:#0a0a0a;
    --bg-input:#111;--bg-tag:#161616;--bg-row-h:#131313;--bg-row-sel:#161200;
    --bg-qty:#181818;--bg-dp:#111;
    --bd:#1c1c1c;--bd-proj:#1a1a1a;--bd-inp:#1e1e1e;--bd-tag:#222;
    --bd-div:#161616;--bd-sub:#141414;--bd-cat:#181818;--bd-dp:#2a2a2a;
    --bd-qty:#282828;--bd-ck:#2e2e2e;
    --tx:#d8d3c9;--tx-sub:#888;--tx-muted:#555;--tx-dim:#444;--tx-vdim:#3a3a3a;
    --accent:#e8b842;--hdr-sub:#2a2a2a;--hdr-region:#3a3a3a;
    --nav-bd:#181818;--dp-today-bg:#1a1500;--dp-today-bd:#3a3000;--dp-day:#b0aba2;
    --ct-on-bg:#1a1500;--scroll-track:#111;--scroll-thumb:#333;
    --dp-shadow:0 8px 32px rgba(0,0,0,.7);
  }
  [data-theme="light"]{
    --bg:#f4f1eb;--bg-card:#fff;--bg-proj:#fafaf8;--bg-sub:#f0ede8;
    --bg-input:#fff;--bg-tag:#eceae5;--bg-row-h:#f0ede8;--bg-row-sel:#fffbee;
    --bg-qty:#f0ede8;--bg-dp:#fff;
    --bd:#e0ddd8;--bd-proj:#e5e2dc;--bd-inp:#d0cdc8;--bd-tag:#dedad4;
    --bd-div:#e8e5e0;--bd-sub:#ece9e4;--bd-cat:#e8e5e0;--bd-dp:#d0cdc8;
    --bd-qty:#d0cdc8;--bd-ck:#c0bdb8;
    --tx:#1a1a18;--tx-sub:#555;--tx-muted:#888;--tx-dim:#999;--tx-vdim:#aaa;
    --hdr-sub:#b8b5ae;--hdr-region:#aaa;
    --nav-bd:#e8e5e0;--dp-today-bg:#fff8e0;--dp-today-bd:#e8c840;--dp-day:#333;
    --ct-on-bg:#fff8e0;--scroll-track:#e8e5e0;--scroll-thumb:#c8c5c0;
    --dp-shadow:0 4px 16px rgba(0,0,0,.1);
  }
  html,body{background:var(--bg);transition:background .2s}

  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--scroll-track)}::-webkit-scrollbar-thumb{background:var(--scroll-thumb);border-radius:3px}
  input,select,button{font-family:'DM Mono',monospace}

  /* Nav buttons */
  .nb{background:none;border:none;color:var(--tx-muted);font-size:11px;cursor:pointer;padding:14px 20px;letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid transparent;transition:all .15s}
  .nb:hover{color:var(--tx-sub)}.nb.on{color:var(--accent);border-bottom-color:var(--accent)}

  /* Action buttons */
  .by{background:var(--accent);color:#090909;border:none;padding:10px 22px;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:opacity .15s}
  .by:hover{opacity:.85}
  .bo{background:none;border:1px solid var(--bd);color:var(--tx-muted);padding:8px 16px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .15s}
  .bo:hover{border-color:var(--tx-muted);color:var(--tx)}
  .bd{background:none;border:1px solid #3a1515;color:#c44;padding:6px 14px;font-size:11px;cursor:pointer;border-radius:2px;transition:all .15s}
  .bd:hover{background:#1a0808}

  /* Form input */
  .fi{background:var(--bg-input);border:1px solid var(--bd-inp);color:var(--tx);padding:10px 13px;font-size:12px;border-radius:2px;width:100%;transition:border-color .15s}
  .fi:focus{outline:none;border-color:var(--accent)}

  /* Card */
  .ca{background:var(--bg-card);border:1px solid var(--bd);border-radius:3px}

  /* Kit row */
  .ro{display:flex;align-items:center;padding:10px 14px;border:none;border-bottom:1px solid var(--bd-sub);cursor:pointer;transition:background .1s;background:none;width:100%;text-align:left;color:inherit}
  .ro:hover:not(:disabled){background:var(--bg-row-h)}
  .ro.sl{background:var(--bg-row-sel);box-shadow:inset 3px 0 0 var(--accent)}
  .ro:disabled{opacity:.35;cursor:not-allowed}
  .ro:focus-visible{outline:1px solid var(--accent);outline-offset:-1px}

  /* Checkbox */
  .ck{width:18px;height:18px;border-radius:2px;border:1.5px solid var(--bd-ck);background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:13px;transition:all .15s}
  .ck.on{background:var(--accent);border-color:var(--accent)}

  /* Qty input */
  .qb{background:var(--bg-qty);border:1px solid var(--bd-qty);color:var(--tx);width:50px;text-align:center;padding:4px;font-size:12px;border-radius:2px}

  /* Category tab */
  .ct{background:none;border:none;padding:6px 13px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;color:var(--tx-muted);transition:all .15s}
  .ct:hover{color:var(--tx)}.ct.on{background:var(--ct-on-bg);color:var(--accent)}

  /* Project card */
  .pc{border:1px solid var(--bd-proj);border-radius:3px;background:var(--bg-proj);padding:18px 20px;transition:border-color .2s}
  .pc:hover{border-color:var(--bd)}

  /* Search wrapper */
  .sw{position:relative}.sw span{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--tx-muted);font-size:15px;pointer-events:none}
  .sw input{padding-left:34px}

  /* Kit tag */
  .tg{background:var(--bg-tag);border:1px solid var(--bd-tag);border-radius:2px;padding:3px 10px;font-size:11px;color:var(--tx-sub)}

  /* Category divider */
  .dl{padding:7px 14px;background:var(--bg-proj);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--bd-div);border-top:1px solid var(--bd-div)}

  /* DatePicker day hover */
  .dp-day:not([data-selected="true"]):hover{background:var(--bg-row-h) !important}

  /* ── Layout classes (CSS-owned so media queries can override inline) ───── */
  .app-hdr{background:var(--bg);border-bottom:1px solid var(--nav-bd);display:flex;align-items:center;justify-content:space-between;padding:0 28px}
  .app-main{padding:26px 28px;max-width:1120px;margin:0 auto}
  .bot-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(--bg);border-top:1px solid var(--nav-bd);padding-bottom:env(safe-area-inset-bottom,0px)}
  .inv-titlerow{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:12px}
  .inv-filterrow{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:20px}
  .proj-hdr{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px}
  .issues-hdr{margin-bottom:24px}

  /* ── Mobile (≤ 640px) ──────────────────────────────────────────────────── */
  @media(max-width:768px){
    .app-hdr{display:none}
    .app-main{padding:28px 16px 86px}
    .inv-titlerow{flex-direction:column;align-items:center;gap:10px;text-align:center}
    .inv-manage-btn{align-self:stretch}
    .proj-hdr{flex-direction:column;align-items:center;gap:12px;text-align:center}
    .issues-hdr{text-align:center}
    .theme-tog{bottom:76px!important}
    .inv-filterrow{flex-wrap:nowrap}
    .inv-filterrow select.fi{width:70px;min-width:70px}
  }
  @media(min-width:769px){.bot-nav{display:none}}
`;

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('pp-kit-theme') !== 'light'; } catch { return true; }
  });
  const [region, setRegion]           = useState(null);
  const [view, setView]               = useState('inventory');
  const [projects, setProjects]       = useState([]);
  const [inventory, setInventory]     = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [packedItems, setPackedItems] = useState({});   // { projectId: Set<unitId> }
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // Apply theme to <html> before paint so there's no flash.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('pp-kit-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  // Derive categories dynamically from current inventory.
  const categories = useMemo(
    () => [...new Set(inventory.map(item => item.category))],
    [inventory],
  );

  const issueCount = useMemo(
    () => inventory.filter(u => u.status && u.status !== 'available').length,
    [inventory],
  );

  // ── Initial data load (runs when region is set) ────────────────────────────
  useEffect(() => {
    if (!region) return;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [inv, proj] = await Promise.all([api.getInventory(region), api.getProjects(region)]);
        setInventory(inv);
        setProjects(proj);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [region]);

  // ── Project CRUD ───────────────────────────────────────────────────────────
  const openNew  = ()        => { setEditProject(null);    setView('form'); };
  const openEdit = (project) => { setEditProject(project); setView('form'); };

  const togglePackedUnit = (projectId, unitId) => {
    setPackedItems(prev => {
      const set = new Set(prev[projectId] ?? []);
      set.has(unitId) ? set.delete(unitId) : set.add(unitId);
      return { ...prev, [projectId]: set };
    });
  };

  const handleProjectSave = async (data) => {
    try {
      const dataWithRegion = { ...data, region };
      if (editProject) {
        setProjects(prev => prev.map(p =>
          p.id === editProject.id ? { ...p, ...dataWithRegion } : p
        ));
        await api.saveProject(dataWithRegion, editProject.id);
      } else {
        const newId = await api.saveProject(dataWithRegion);
        setProjects(prev => [...prev, { id: newId, ...dataWithRegion }]);
      }
      setView('projects');
    } catch (e) {
      alert('Failed to save project: ' + e.message);
      api.getProjects(region).then(setProjects).catch(() => {});
    }
  };

  const handleProjectDelete = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      await api.deleteProject(id);
    } catch (e) {
      alert('Failed to delete project: ' + e.message);
      api.getProjects(region).then(setProjects).catch(() => {});
    }
  };

  // ── Inventory CRUD ─────────────────────────────────────────────────────────
  const handleInventoryAdd = async (item) => {
    try {
      const newItem = await api.addInventoryItem({ ...item, region });
      setInventory(prev => [...prev, newItem]);
    } catch (e) {
      alert('Failed to add item: ' + e.message);
    }
  };

  const handleInventoryAddMultiple = async (units) => {
    try {
      const newItems = await api.addInventoryUnits(units.map(u => ({ ...u, region })));
      setInventory(prev => [...prev, ...newItems]);
    } catch (e) {
      alert('Failed to add items: ' + e.message);
    }
  };

  const handleInventoryUpdate = async (id, updates) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    try {
      await api.updateInventoryItem(id, updates);
    } catch (e) {
      alert('Failed to update item: ' + e.message);
      api.getInventory(region).then(setInventory).catch(() => {});
    }
  };

  // ── Kit lifecycle ──────────────────────────────────────────────────────────
  const handleKitPacked = async (projectId) => {
    const packedAt = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, packedAt } : p));
    try {
      await api.updateProject(projectId, { packed_at: packedAt });
    } catch (e) {
      alert('Failed to update project: ' + e.message);
      api.getProjects(region).then(setProjects).catch(() => {});
    }
  };

  const handleKitReturned = async (projectId, returnItems) => {
    const returnedAt = new Date().toISOString();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, returnedAt } : p));
    const updates = returnItems.filter(r => r.status !== 'returned');
    setInventory(prev => prev.map(u => {
      const match = updates.find(r => r.unitId === u.id);
      return match ? { ...u, status: match.status } : u;
    }));
    try {
      await api.updateProject(projectId, { returned_at: returnedAt });
      await Promise.all(
        updates.map(r => api.updateInventoryItem(r.unitId, { status: r.status }))
      );
    } catch (e) {
      alert('Failed to record return: ' + e.message);
      Promise.all([api.getProjects(region), api.getInventory(region)])
        .then(([proj, inv]) => { setProjects(proj); setInventory(inv); })
        .catch(() => {});
    }
  };

  const handleResolveIssue = async (unitId) => {
    setInventory(prev => prev.map(u => u.id === unitId ? { ...u, status: 'available' } : u));
    try {
      await api.updateInventoryItem(unitId, { status: 'available' });
    } catch (e) {
      alert('Failed to resolve issue: ' + e.message);
      api.getInventory(region).then(setInventory).catch(() => {});
    }
  };

  const handleInventoryDelete = async (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    try {
      await api.deleteInventoryItem(id);
    } catch (e) {
      alert('Failed to delete item: ' + e.message);
      api.getInventory(region).then(setInventory).catch(() => {});
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AccessGate>
      {!region ? (
        <RegionSelect onSelect={setRegion} />
      ) : (
        <div style={{ fontFamily: "'DM Mono',monospace", minHeight: '100vh', background: 'var(--bg)', color: 'var(--tx)', transition: 'background .2s,color .2s' }}>
          <style>{GLOBAL_STYLES}</style>

          <header className="app-hdr">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: 'var(--accent)', letterSpacing: '.08em' }}>PERSPECTIVE PICTURES</span>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: 'var(--hdr-sub)', letterSpacing: '.08em' }}>/ KIT</span>
              <span style={{ fontSize: 10, color: 'var(--hdr-region)', letterSpacing: '.12em', textTransform: 'uppercase', marginLeft: 6 }}>
                ● {region.toUpperCase()}
              </span>
            </div>
            <nav style={{ display: 'flex' }} aria-label="Main navigation">
              {[['inventory', 'Inventory'], ['projects', 'Projects']].map(([key, label]) => (
                <button
                  key={key}
                  className={`nb${(view === key || (view === 'form' && key === 'projects')) ? ' on' : ''}`}
                  onClick={() => setView(key)}
                  aria-current={view === key ? 'page' : undefined}
                >
                  {label}
                </button>
              ))}
              <button
                className={`nb${view === 'issues' ? ' on' : ''}`}
                onClick={() => setView('issues')}
                aria-current={view === 'issues' ? 'page' : undefined}
                style={{ position: 'relative' }}
              >
                Issues
                {issueCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 10, right: 6,
                    background: '#c44', color: '#fff',
                    fontSize: 9, fontWeight: 700, borderRadius: 10,
                    padding: '1px 5px', lineHeight: 1.4,
                  }}>
                    {issueCount}
                  </span>
                )}
              </button>
            </nav>
          </header>

          <main className="app-main">
            {loading && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--tx-vdim)', fontSize: 12, letterSpacing: '.1em' }}>
                Loading…
              </div>
            )}

            {error && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ color: '#c44', fontSize: 13, marginBottom: 12 }}>Failed to connect to database</div>
                <div style={{ color: 'var(--tx-dim)', fontSize: 11 }}>{error}</div>
                <button className="bo" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {view === 'inventory' && (
                  <InventoryView
                    inventory={inventory}
                    categories={categories}
                    projects={projects}
                    onAdd={handleInventoryAdd}
                    onAddMultiple={handleInventoryAddMultiple}
                    onUpdate={handleInventoryUpdate}
                    onDelete={handleInventoryDelete}
                  />
                )}
                {view === 'projects' && (
                  <ProjectsView
                    inventory={inventory}
                    projects={projects}
                    onNew={openNew}
                    onEdit={openEdit}
                    onDelete={handleProjectDelete}
                    onKitPacked={handleKitPacked}
                    onKitReturned={handleKitReturned}
                    packedItems={packedItems}
                    onTogglePacked={togglePackedUnit}
                  />
                )}
                {view === 'issues' && (
                  <IssuesView
                    inventory={inventory}
                    onResolve={handleResolveIssue}
                  />
                )}
                {view === 'form' && (
                  <ProjectForm
                    inventory={inventory}
                    categories={categories}
                    initialData={editProject}
                    projects={projects}
                    editId={editProject?.id ?? null}
                    region={region}
                    onSave={handleProjectSave}
                    onBack={() => setView('projects')}
                  />
                )}
              </>
            )}
          </main>

          {/* Bottom nav – mobile only (hidden ≥ 641px via CSS) */}
          <nav className="bot-nav">
            {[['inventory', 'Inventory'], ['projects', 'Projects'], ['issues', 'Issues']].map(([key, label]) => {
              const active = view === key || (view === 'form' && key === 'projects');
              return (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    borderTop: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    color: active ? 'var(--accent)' : 'var(--tx-muted)',
                    fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                    fontFamily: "'DM Mono',monospace", padding: '12px 0 10px',
                    cursor: 'pointer', position: 'relative', transition: 'color .15s',
                  }}
                  aria-current={view === key ? 'page' : undefined}
                >
                  {label}
                  {key === 'issues' && issueCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 7, right: '20%',
                      background: '#c44', color: '#fff',
                      fontSize: 9, fontWeight: 700, borderRadius: 10,
                      padding: '1px 5px', lineHeight: 1.4,
                    }}>
                      {issueCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Dark / light mode toggle */}
          <button
            className="theme-tog"
            onClick={() => setIsDark(d => !d)}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 500,
              width: 44, height: 44, borderRadius: '50%',
              background: isDark ? '#1c1c1c' : '#fff',
              border: `1px solid ${isDark ? '#2e2e2e' : '#d0cdc8'}`,
              color: isDark ? '#e8b842' : '#777',
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isDark ? '0 2px 16px rgba(0,0,0,.6)' : '0 2px 16px rgba(0,0,0,.1)',
              transition: 'all .2s',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀' : '🌙'}
          </button>
        </div>
      )}
    </AccessGate>
  );
}
