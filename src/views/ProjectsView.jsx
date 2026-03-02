import { useState } from 'react';
import { fmtDate, projStatus } from '../utils';
import Pill from '../components/Pill';

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
          const status          = projStatus(project, today);
          const isExpanded      = expandedId === project.id;
          const isConfirming    = confirmDeleteId === project.id;
          const previewKit      = project.kit.slice(0, 7);
          const hiddenKitCount  = project.kit.length - 7;

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
                    <span>{project.kit.length} item type{project.kit.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Kit tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(isExpanded ? project.kit : previewKit).map(k => {
                      const item = inventory.find(i => i.id === k.itemId);
                      return item
                        ? <span key={k.itemId} className="tg">{item.name}{k.qty > 1 ? ` ×${k.qty}` : ''}</span>
                        : null;
                    })}
                    {!isExpanded && hiddenKitCount > 0 && (
                      <button
                        onClick={() => setExpandedId(project.id)}
                        style={{ background: 'none', border: 'none', color: '#e8b842', fontSize: 11, cursor: 'pointer', padding: '3px 6px' }}
                      >
                        +{hiddenKitCount} more
                      </button>
                    )}
                    {isExpanded && (
                      <button
                        onClick={() => setExpandedId(null)}
                        style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer', padding: '3px 6px' }}
                      >
                        Show less ▲
                      </button>
                    )}
                  </div>
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
