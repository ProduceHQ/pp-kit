import { useState } from 'react';
import { fmtDate, projStatus, unitLabel } from '../utils';
import Pill from '../components/Pill';

// Groups project kit by category, silently skipping orphaned unit references.
function buildKitGroups(kit, inventory) {
  const groups = {};
  for (const { itemId } of kit) {
    const unit = inventory.find(u => u.id === itemId);
    if (!unit) continue;
    (groups[unit.category] ??= []).push(unit);
  }
  return groups; // { category: unit[] }
}

export default function ProjectsView({ inventory, projects, onNew, onEdit, onDelete }) {
  const today = new Date().toISOString().split('T')[0];
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedId, setExpandedId]           = useState(null);

  const handleDelete = (id) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const sorted = [...projects].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: '.04em', lineHeight: 1 }}>PROJECTS</h1>
          <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>{projects.length} booking{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="by" onClick={onNew}>+ New Project</button>
      </div>

      {!projects.length && (
        <div style={{ border: '1px dashed #1e1e1e', borderRadius: 3, padding: '70px 0', textAlign: 'center', color: '#3a3a3a' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, marginBottom: 8 }}>NO PROJECTS YET</div>
          <div style={{ fontSize: 12 }}>Create a project to start booking kit</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {sorted.map(project => {
          const status       = projStatus(project, today);
          const isExpanded   = expandedId === project.id;
          const isConfirming = confirmDeleteId === project.id;
          const kitGroups    = buildKitGroups(project.kit, inventory);
          const allCats      = Object.keys(kitGroups);
          const totalUnits   = Object.values(kitGroups).reduce((s, units) => s + units.length, 0);

          // Collapsed preview: first 4 units flattened across categories
          const flatUnits = Object.values(kitGroups).flat();
          const previewUnits  = flatUnits.slice(0, 4);
          const hiddenCount   = flatUnits.length - 4;

          return (
            <div key={project.id} className="pc">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 21, letterSpacing: '.04em', color: '#d8d3c9' }}>{project.name}</h2>
                    <Pill variant={status.variant}>{status.label}</Pill>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: '#4a4a4a', fontSize: 11, marginBottom: 14 }}>
                    <span style={{ color: '#e8b842' }}>{project.number || '—'}</span>
                    <span>{fmtDate(project.startDate)} — {fmtDate(project.endDate)}</span>
                    <span>{totalUnits} unit{totalUnits !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Kit display */}
                  {!isExpanded ? (
                    // Collapsed: flat tags for first 4 units
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {previewUnits.map(unit => (
                        <span key={unit.id} className="tg">
                          {unitLabel(unit, inventory)}
                        </span>
                      ))}
                      {hiddenCount > 0 && (
                        <button
                          onClick={() => setExpandedId(project.id)}
                          style={{ background: 'none', border: 'none', color: '#e8b842', fontSize: 11, cursor: 'pointer', padding: '3px 6px' }}
                        >
                          +{hiddenCount} more
                        </button>
                      )}
                    </div>
                  ) : (
                    // Expanded: grouped by category with gold headers
                    <div style={{ marginTop: 4 }}>
                      {allCats.map(cat => (
                        <div key={cat} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#e8b842', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                            {cat}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {kitGroups[cat].map(unit => (
                              <div key={unit.id} style={{ fontSize: 11, color: '#888' }}>
                                <span>{unitLabel(unit, inventory)}</span>
                                {unit.serial_number && (
                                  <span style={{ color: '#444', marginLeft: 10, fontSize: 10, letterSpacing: '.04em' }}>
                                    {unit.serial_number}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setExpandedId(null)}
                        style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer', padding: '3px 0', marginTop: 2 }}
                      >
                        Show less ▲
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ flexShrink: 0 }}>
                  {isConfirming ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#c44', whiteSpace: 'nowrap' }}>Delete?</span>
                      <button className="bd" onClick={() => handleDelete(project.id)}>Confirm</button>
                      <button className="bo" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button className="bo" onClick={() => onEdit(project)}>Edit</button>
                      <button className="bd" onClick={() => setConfirmDeleteId(project.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
