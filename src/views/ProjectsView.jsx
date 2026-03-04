import { useState } from 'react';
import { fmtDate, projStatus, unitLabel } from '../utils';
import Pill from '../components/Pill';
import KitReturnModal from '../components/KitReturnModal';

// Groups project kit by category, silently skipping orphaned unit references.
function buildKitGroups(kit, inventory) {
  const groups = {};
  for (const { itemId } of kit) {
    const unit = inventory.find(u => u.id === itemId);
    if (!unit) continue;
    (groups[unit.category] ??= []).push(unit);
  }
  return groups;
}

// Returns true if any unit in this project's kit is flagged damaged/missing.
function hasIssue(kit, inventory) {
  return kit.some(({ itemId }) => {
    const unit = inventory.find(u => u.id === itemId);
    return unit && unit.status && unit.status !== 'available';
  });
}

export default function ProjectsView({ inventory, projects, onNew, onEdit, onDelete, onKitPacked, onKitReturned }) {
  const today = new Date().toISOString().split('T')[0];
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedId, setExpandedId]           = useState(null);
  const [returnModalId, setReturnModalId]     = useState(null);
  const [showPast, setShowPast]               = useState(false);

  const handleDelete = (id) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const activeProjects = projects.filter(p => !p.returnedAt);
  const pastProjects   = projects.filter(p => p.returnedAt);
  const visibleProjects = showPast
    ? [...projects].sort((a, b) => a.startDate.localeCompare(b.startDate))
    : [...activeProjects].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const returnProject = projects.find(p => p.id === returnModalId);

  return (
    <div>
      {/* Return modal */}
      {returnProject && (
        <KitReturnModal
          project={returnProject}
          inventory={inventory}
          onSubmit={(returnItems) => {
            onKitReturned(returnProject.id, returnItems);
            setReturnModalId(null);
          }}
          onCancel={() => setReturnModalId(null)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: '.04em', lineHeight: 1 }}>PROJECTS</h1>
          <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>
            {activeProjects.length} active booking{activeProjects.length !== 1 ? 's' : ''}
            {pastProjects.length > 0 && ` · ${pastProjects.length} past`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {pastProjects.length > 0 && (
            <button className="bo" onClick={() => setShowPast(v => !v)}>
              {showPast ? 'Hide Past' : `Show Past (${pastProjects.length})`}
            </button>
          )}
          <button className="by" onClick={onNew}>+ New Project</button>
        </div>
      </div>

      {!visibleProjects.length && (
        <div style={{ border: '1px dashed #1e1e1e', borderRadius: 3, padding: '70px 0', textAlign: 'center', color: '#3a3a3a' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, marginBottom: 8 }}>NO PROJECTS YET</div>
          <div style={{ fontSize: 12 }}>Create a project to start booking kit</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {visibleProjects.map(project => {
          const status       = projStatus(project, today);
          const isExpanded   = expandedId === project.id;
          const isConfirming = confirmDeleteId === project.id;
          const kitGroups    = buildKitGroups(project.kit, inventory);
          const allCats      = Object.keys(kitGroups);
          const totalUnits   = Object.values(kitGroups).reduce((s, units) => s + units.length, 0);
          const issue        = hasIssue(project.kit, inventory);
          const isReturned   = !!project.returnedAt;
          const isPacked     = !!project.packedAt;
          const canPack      = !isPacked && !isReturned && (status.label === 'Upcoming' || status.label === 'Active');
          const canReturn    = isPacked && !isReturned;

          // Collapsed preview: first 4 units
          const flatUnits   = Object.values(kitGroups).flat();
          const previewUnits = flatUnits.slice(0, 4);
          const hiddenCount  = flatUnits.length - 4;

          return (
            <div key={project.id} className="pc" style={{ opacity: isReturned ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title + pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 21, letterSpacing: '.04em', color: '#d8d3c9' }}>{project.name}</h2>
                    <Pill variant={status.variant}>{status.label}</Pill>
                    {isPacked && !isReturned && <Pill variant="green">Packed</Pill>}
                    {isReturned && <Pill variant="grey">Returned</Pill>}
                    {issue && !isReturned && <Pill variant="red">Issue</Pill>}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: '#4a4a4a', fontSize: 11, marginBottom: 14 }}>
                    <span style={{ color: '#e8b842' }}>{project.number || '—'}</span>
                    <span>{fmtDate(project.startDate)} — {fmtDate(project.endDate)}</span>
                    <span>{totalUnits} unit{totalUnits !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Kit display */}
                  {!isExpanded ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {previewUnits.map(unit => (
                        <span key={unit.id} className="tg"
                          style={ unit.status && unit.status !== 'available' ? { borderColor: '#4a1515', color: '#c44' } : {} }
                        >
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
                    <div style={{ marginTop: 4 }}>
                      {allCats.map(cat => (
                        <div key={cat} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#e8b842', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                            {cat}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {kitGroups[cat].map(unit => {
                              const flagged = unit.status && unit.status !== 'available';
                              return (
                                <div key={unit.id} style={{ fontSize: 11, color: flagged ? '#c44' : '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span>{unitLabel(unit, inventory)}</span>
                                  {unit.serial_number && (
                                    <span style={{ color: '#444', fontSize: 10, letterSpacing: '.04em' }}>
                                      {unit.serial_number}
                                    </span>
                                  )}
                                  {flagged && <Pill variant={unit.status === 'missing' ? 'red' : 'amber'}>{unit.status}</Pill>}
                                </div>
                              );
                            })}
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
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {canPack && (
                        <button className="bo" style={{ borderColor: '#1a4a28', color: '#4a9a68' }}
                          onClick={() => onKitPacked(project.id)}>
                          Kit Packed
                        </button>
                      )}
                      {canReturn && (
                        <button className="bo" style={{ borderColor: '#4a3a00', color: '#c0a040' }}
                          onClick={() => setReturnModalId(project.id)}>
                          Kit Returned
                        </button>
                      )}
                      {!isReturned && (
                        <button className="bo" onClick={() => onEdit(project)}>Edit</button>
                      )}
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
