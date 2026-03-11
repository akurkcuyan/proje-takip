"use client";
import { useState, useEffect } from 'react';
import { StatsCard, ProjectRow, ActivityItem } from '@/components/DashboardComponents';
import ProjectForm from '@/components/ProjectForm';
import ProjectDetail from '@/components/ProjectDetail';
import Login from '@/components/Login';
import { useLocalStorage } from '@/lib/useLocalStorage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [user, setUser] = useLocalStorage('protracker_user', null);

  const [projects, setProjects] = useLocalStorage('protracker_projects', []);

  const [activities, setActivities] = useLocalStorage('protracker_activities', []);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#0f172a' }} />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleLogout = () => {
    setUser(null);
    setSelectedProjectId(null);
    setShowForm(false);
    setSelectedIds([]);
  };

  const handleCreateProject = (newProject) => {
    setProjects([newProject, ...projects]);
    setActivities([{
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: user.name,
      action: `Yeni proje oluşturuldu: ${newProject.name}`,
      icon: "📝"
    }, ...activities]);
    setShowForm(false);
  };

  const handleStatusUpdate = (id, newStatus) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        setActivities([{
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: user.name,
          action: `${p.name} durumu güncellendi: ${newStatus}`,
          icon: "🔄"
        }, ...activities]);

        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleAddLog = (id, log) => {
    const project = projects.find(p => p.id === id);
    setProjects(projects.map(p => {
      if (p.id === id) {
        return { ...p, logs: [...(p.logs || []), { ...log, user: user.name }] };
      }
      return p;
    }));

    setActivities([{
      time: log.time,
      user: user.name,
      action: `${project.name}: ${log.text.substring(0, 30)}...`,
      icon: "⚡"
    }, ...activities]);
  };

  const handleAddPhoto = (id, photo) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        return { ...p, photos: [...(p.photos || []), photo] };
      }
      return p;
    }));
  };

  const handleUpdateProject = (id, updatedData) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const handleDeleteProject = (id) => {
    if (confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      const project = projects.find(p => p.id === id);
      setProjects(projects.filter(p => p.id !== id));
      setActivities([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: user.name,
        action: `Proje silindi: ${project.name}`,
        icon: "🗑️"
      }, ...activities]);
      setSelectedProjectId(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`${selectedIds.length} projeyi silmek istediğinize emin misiniz?`)) {
      setProjects(projects.filter(p => !selectedIds.includes(p.id)));
      setActivities([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: user.name,
        action: `${selectedIds.length} proje toplu silindi`,
        icon: "🗑️"
      }, ...activities]);
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearData = () => {
    const password = prompt("Sistemi sıfırlamak için yönetici şifresini giriniz:");
    if (password === "Alx131975!") {
      if (confirm("Tüm yerel verileri kalıcı olarak silmek istediğinize emin misiniz?")) {
        window.localStorage.removeItem('protracker_projects');
        window.localStorage.removeItem('protracker_activities');
        window.location.reload();
      }
    } else if (password !== null) {
      alert("Hatalı şifre!");
    }
  };

  // Roles Definition - Unified for all users
  const canCreate = true;
  const canSeeStats = true;
  const isAdmin = user.role === 'Genel Yönetici';
  const isSaha = false;

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Navigation */}
      <nav className="glass-nav no-print" style={{ marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dinakord Elektronik Proje Takip
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{user.role}</p>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>Çıkış</button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '0 2rem' }}>
        {showForm ? (
          <ProjectForm onSubmit={handleCreateProject} onCancel={() => setShowForm(false)} />
        ) : selectedProjectId ? (
          <ProjectDetail
            project={projects.find(p => p.id === selectedProjectId)}
            onBack={() => setSelectedProjectId(null)}
            onAddLog={handleAddLog}
            onAddPhoto={handleAddPhoto}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDeleteProject}
            onUpdateProject={handleUpdateProject}
            role={user.role}
            isAdmin={isAdmin}
          />
        ) : (
          <>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Hoş Geldiniz, {user.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>İşte bugün projelerinizdeki son durum.</p>
              </div>
              {isAdmin && (
                <button onClick={clearData} style={{ fontSize: '0.7rem', color: 'var(--danger)', background: 'none', border: '1px solid var(--danger)', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', cursor: 'pointer' }}>
                  Sistemi Sıfırla
                </button>
              )}
            </header>

            {canSeeStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatsCard
                  title="AKTİF PROJELER"
                  value={projects.filter(p => p.status !== 'Tamamlandı').length}
                  color="primary"
                  badge={projects.filter(p => p.status !== 'Tamamlandı' && (!p.id || p.id > 3)).length > 0 ? `+${projects.filter(p => p.status !== 'Tamamlandı' && (!p.id || p.id > 3)).length} YENİ` : ""}
                />
                <StatsCard 
                  title="ASKIDA BEKLEYENLER" 
                  value={projects.filter(p => ['Keşif', 'Projelendirme', 'Teklif Aşamasında'].includes(p.status)).length} 
                  color="secondary" 
                  subtext="Keşif, Proje, Teklif" 
                />
                <StatsCard title="MONTAJ AŞAMASINDA" value={projects.filter(p => p.status === 'Montaj').length} color="accent" subtext={`${projects.filter(p => p.status === 'Montaj').length} ekip sahada`} />
                <StatsCard title="TEKLİF AŞAMASINDA" value={projects.filter(p => p.status === 'Teklif Aşamasında').length} color="warning" badge={projects.filter(p => p.status === 'Teklif Aşamasında').length > 1 ? "DİKKAT" : ""} />
                <StatsCard title="TAMAMLANAN PROJELER" value={projects.filter(p => p.status === 'Tamamlandı').length} color="success" subtext="Toplam biten iş" />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Son Projeler</h2>
                    {isAdmin && selectedIds.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Seçilenleri Sil ({selectedIds.length})
                      </button>
                    )}
                  </div>
                  <button className="btn-primary" onClick={() => setShowForm(true)}>Yeni Proje</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {projects.map(project => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onStatusChange={() => setSelectedProjectId(project.id)}
                      isAdmin={isAdmin}
                      isSelected={selectedIds.includes(project.id)}
                      onSelect={() => toggleSelect(project.id)}
                    />
                  ))}
                </div>
              </section>

              <aside>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Günlük Gelişmeler</h2>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {activities.map((activity, i) => (
                      <ActivityItem key={i} activity={activity} />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
