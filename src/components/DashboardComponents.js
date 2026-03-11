"use client";

// --- Stats Card Component ---
export const StatsCard = ({ title, value, subtext, badge, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>{title}</p>
        <h3 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: `var(--${color})` }}>{value}</h3>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {badge && <span className={`badge badge-${color}`}>{badge}</span>}
            {subtext && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtext}</span>}
        </div>
    </div>
);

// --- Project Row Component ---
export const ProjectRow = ({ project, onStatusChange, isAdmin, isSelected, onSelect }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Keşif': return 'badge-muted';
            case 'Projelendirme': return 'badge-secondary';
            case 'Teklif Aşamasında': return 'badge-warning';
            case 'Planlama': return 'badge-danger';
            case 'Altyapı Kontrolü': return 'badge-info';
            case 'Montaj': return 'badge-accent';
            case 'Devreye Alma': return 'badge-indigo';
            case 'Tamamlandı': return 'badge-success';
            default: return '';
        }
    };

    const getProgressValue = (status) => {
        const stages = {
            'Keşif': 10,
            'Projelendirme': 25,
            'Teklif Aşamasında': 40,
            'Planlama': 55,
            'Altyapı Kontrolü': 70,
            'Montaj': 85,
            'Devreye Alma': 95,
            'Tamamlandı': 100
        };
        return stages[status] || 0;
    };

    const getStatusColorHex = (status) => {
        switch (status) {
            case 'Keşif': return '#94a3b8';
            case 'Projelendirme': return '#c4b5fd';
            case 'Teklif Aşamasında': return '#fbbf24';
            case 'Planlama': return '#f87171';
            case 'Altyapı Kontrolü': return '#38bdf8';
            case 'Montaj': return '#2dd4bf';
            case 'Devreye Alma': return '#818cf8';
            case 'Tamamlandı': return '#10b981';
            default: return '#c4b5fd';
        }
    };

    const lastLog = project.logs && project.logs.length > 0 ? project.logs[project.logs.length - 1] : null;

    return (
        <div
            className="glass-card"
            style={{
                padding: '1.25rem', display: 'flex', gap: '1rem',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                background: isSelected ? 'rgba(56, 189, 248, 0.05)' : ''
            }}
            onClick={() => onStatusChange && onStatusChange(project.id)}
        >
            {isAdmin && (
                <div 
                    onClick={(e) => { e.stopPropagation(); onSelect(); }}
                    style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '4px',
                        border: '2px solid var(--border-glass)',
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        color: 'white', flexShrink: 0
                    }}
                >
                    {isSelected && '✓'}
                </div>
            )}
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '1.1rem' }}>{project.name}</h4>
                            {project.budget && (
                                <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    ${Number(project.budget).toLocaleString('en-US')}
                                    {project.discount && (
                                        <span style={{ color: '#fbbf24', fontSize: '0.75rem', background: 'rgba(251, 191, 36, 0.1)', padding: '0 0.4rem', borderRadius: '0.3rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                            -%{project.discount}
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{project.client} {project.responsible && `• 👤 ${project.responsible}`}</p>
                    </div>
                    <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                </div>

                {/* Mini Progress Bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${getProgressValue(project.status)}%`, 
                        height: '100%', 
                        background: getStatusColorHex(project.status),
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>

                {/* Previews Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem' }}>
                    {/* Note Preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {lastLog ? (
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    Son Güncelleme ({lastLog.user}):
                                </p>
                                <p style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {lastLog.text}
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Henüz not eklenmedi.</p>
                        )}
                    </div>

                    {/* Photo Thumbnails */}
                    {project.photos && project.photos.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {project.photos.slice(-3).map((photo, i) => (
                                <div key={i} style={{
                                    width: '40px', height: '40px', borderRadius: '0.4rem',
                                    overflow: 'hidden', border: '1px solid var(--border-glass)'
                                }}>
                                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Activity Item Component ---
export const ActivityItem = ({ activity }) => (
    <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-surface)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-glass)'
        }}>
            {activity.icon}
        </div>
        <div>
            <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{activity.action}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{activity.user} • {activity.time}</p>
        </div>
    </div>
);
