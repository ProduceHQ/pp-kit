import { useState, useEffect, useMemo } from 'react';
import * as api from './lib/api';
import AccessGate from './components/AccessGate';
import RegionSelect from './components/RegionSelect';
import InventoryView from './views/InventoryView';
import ProjectsView  from './views/ProjectsView';
import ProjectForm   from './views/ProjectForm';

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
  input,select,button{font-family:'DM Mono',monospace}

  /* Nav buttons */
  .nb{background:none;border:none;color:#555;font-size:11px;cursor:pointer;padding:14px 20px;letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid transparent;transition:all .15s}
  .nb:hover{color:#aaa}.nb.on{color:#e8b842;border-bottom-color:#e8b842}

  /* Action buttons */
  .by{background:#e8b842;color:#090909;border:none;padding:10px 22px;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:opacity .15s}
  .by:hover{opacity:.85}
  .bo{background:none;border:1px solid #252525;color:#666;padding:8px 16px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .15s}
  .bo:hover{border-color:#444;color:#bbb}
  .bd{background:none;border:1px solid #3a1515;color:#c44;padding:6px 14px;font-size:11px;cursor:pointer;border-radius:2px;transition:all .15s}
  .bd:hover{background:#1a0808}

  /* Form input */
  .fi{background:#111;border:1px solid #1e1e1e;color:#d8d3c9;padding:10px 13px;font-size:12px;border-radius:2px;width:100%;transition:border-color .15s}
  .fi:focus{outline:none;border-color:#e8b842}

  /* Card */
  .ca{background:#0e0e0e;border:1px solid #1c1c1c;border-radius:3px}

  /* Kit row */
  .ro{display:flex;align-items:center;padding:10px 14px;border:none;border-bottom:1px solid #141414;cursor:pointer;transition:background .1s;background:none;width:100%;text-align:left;color:inherit}
  .ro:hover:not(:disabled){background:#131313}
  .ro.sl{background:#161200;box-shadow:inset 3px 0 0 #e8b842}
  .ro:disabled{opacity:.35;cursor:not-allowed}
  .ro:focus-visible{outline:1px solid #e8b842;outline-offset:-1px}

  /* Checkbox */
  .ck{width:18px;height:18px;border-radius:2px;border:1.5px solid #2e2e2e;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:13px;transition:all .15s}
  .ck.on{background:#e8b842;border-color:#e8b842}

  /* Qty input */
  .qb{background:#181818;border:1px solid #282828;color:#d8d3c9;width:50px;text-align:center;padding:4px;font-size:12px;border-radius:2px}

  /* Category tab */
  .ct{background:none;border:none;padding:6px 13px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;color:#555;transition:all .15s}
  .ct:hover{color:#aaa}.ct.on{background:#1a1500;color:#e8b842}

  /* Project card */
  .pc{border:1px solid #1a1a1a;border-radius:3px;background:#0c0c0c;padding:18px 20px;transition:border-color .2s}
  .pc:hover{border-color:#2a2a2a}

  /* Search wrapper */
  .sw{position:relative}.sw span{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#555;font-size:15px;pointer-events:none}
  .sw input{padding-left:34px}

  /* Kit tag */
  .tg{background:#161616;border:1px solid #222;border-radius:2px;padding:3px 10px;font-size:11px;color:#888}

  /* Category divider */
  .dl{padding:7px 14px;background:#0c0c0c;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#555;border-bottom:1px solid #161616;border-top:1px solid #161616}

  /* DatePicker day hover */
  .dp-day:not([data-selected="true"]):hover{background:#1e1e1e !important}
`;

export default function App() {
  const [region, setRegion]           = useState(null);
  const [view, setView]               = useState('inventory');
  const [projects, setProjects]       = useState([]);
  const [inventory, setInventory]     = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // Derive categories dynamically from current inventory.
  const categories = useMemo(
    () => [...new Set(inventory.map(item => item.category))],
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

  const handleProjectSave = async (data) => {
    try {
      const dataWithRegion = { ...data, region };
      if (editProject) {
        // Optimistic update
        setProjects(prev => prev.map(p =>
          p.id === editProject.id ? { ...p, ...dataWithRegion } : p
        ));
        await api.saveProject(dataWithRegion, editProject.id);
      } else {
        // Persist first to get the new UUID, then add to local state
        const newId = await api.saveProject(dataWithRegion);
        setProjects(prev => [...prev, { id: newId, ...dataWithRegion }]);
      }
      setView('projects');
    } catch (e) {
      alert('Failed to save project: ' + e.message);
      // Revert: reload from server
      api.getProjects(region).then(setProjects).catch(() => {});
    }
  };

  const handleProjectDelete = async (id) => {
    // Optimistic remove
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
    // Optimistic update
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    try {
      await api.updateInventoryItem(id, updates);
    } catch (e) {
      alert('Failed to update item: ' + e.message);
      api.getInventory(region).then(setInventory).catch(() => {});
    }
  };

  const handleInventoryDelete = async (id) => {
    // Optimistic remove
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
        <div style={{ fontFamily: "'DM Mono',monospace", minHeight: '100vh', background: '#090909', color: '#d8d3c9' }}>
          <style>{GLOBAL_STYLES}</style>

          <header style={{ borderBottom: '1px solid #181818', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: '#e8b842', letterSpacing: '.08em' }}>PERSPECTIVE PICTURES</span>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: '#2a2a2a', letterSpacing: '.08em' }}>/ KIT</span>
              <span style={{ fontSize: 10, color: '#3a3a3a', letterSpacing: '.12em', textTransform: 'uppercase', marginLeft: 6 }}>
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
            </nav>
          </header>

          <main style={{ padding: '26px 28px', maxWidth: 1120, margin: '0 auto' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#333', fontSize: 12, letterSpacing: '.1em' }}>
                Loading…
              </div>
            )}

            {error && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ color: '#c44', fontSize: 13, marginBottom: 12 }}>Failed to connect to database</div>
                <div style={{ color: '#444', fontSize: 11 }}>{error}</div>
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
        </div>
      )}
    </AccessGate>
  );
}
