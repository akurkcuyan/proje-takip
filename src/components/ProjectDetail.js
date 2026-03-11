"use client";
import { useState, useEffect } from 'react';

export default function ProjectDetail({ project, onBack, onAddLog, onAddPhoto, onStatusUpdate, onDelete, onUpdateProject, role, isAdmin }) {
    const [logText, setLogText] = useState('');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({
        name: project.name,
        client: project.client,
        responsible: project.responsible,
        budget: project.budget || '',
        discount: project.discount || ''
    });

    // Sync edit form when project changes
    useEffect(() => {
        setEditForm({
            name: project.name,
            client: project.client,
            responsible: project.responsible,
            budget: project.budget || '',
            discount: project.discount || ''
        });
    }, [project]);

    const handleSaveInfo = () => {
        onUpdateProject(project.id, {
            ...project,
            name: editForm.name,
            client: editForm.client,
            responsible: editForm.responsible,
            budget: editForm.budget,
            discount: editForm.discount
        });
        setIsEditingInfo(false);
    };

    const canUpdateStatus = role === 'Yönetici' || role === 'Satış Ekibi' || role === 'Saha Ekibi' || isAdmin;

    const handleSubmitLog = (e) => {
        e.preventDefault();
        if (!logText.trim()) return;

        onAddLog(project.id, {
            text: logText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('tr-TR'),
            user: role // Will be overridden by name in parent but kept for safety
        });
        setLogText('');
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            onAddPhoto(project.id, reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            // Simulate examining the document by asking the user for the total price found
            const quotePrice = prompt(`${file.name} belgesi incelendi. Belgedeki GENEL TOPLAM tutarını (USD) giriniz:`, project.budget || "");
            
            const updatedQuotes = [...(project.quotes || []), {
                name: file.name,
                type: file.type,
                data: reader.result,
                date: new Date().toLocaleDateString('tr-TR')
            }];

            const updateData = { ...project, quotes: updatedQuotes };
            if (quotePrice !== null && quotePrice !== "") {
                updateData.budget = quotePrice;
            }
            
            onUpdateProject(project.id, updateData);
        };
        reader.readAsDataURL(file);
    };

    const handleStatusUpdateAttempt = (newStatus) => {
        const restrictedStages = ['Planlama', 'Altyapı Kontrolü', 'Montaj', 'Devreye Alma', 'Tamamlandı'];
        const hasQuote = project.quotes && project.quotes.length > 0;

        if (restrictedStages.includes(newStatus) && !hasQuote) {
            alert("⚠️ DİKKAT: Bu aşamaya geçebilmek için sisteme en az bir 'Fiyat Teklifi' (PDF/Excel) yüklenmiş olması gerekmektedir.\n\nLütfen önce 'Fiyat Teklifleri' bölümünden dökümanı yükleyiniz.");
            return;
        }

        onStatusUpdate(project.id, newStatus);
    };

    const incrementVisits = () => {
        onUpdateProject(project.id, { ...project, visits: (project.visits || 0) + 1 });
    };

    const handleDeletePhoto = (index) => {
        if (confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) {
            const updatedPhotos = project.photos.filter((_, i) => i !== index);
            onUpdateProject(project.id, { ...project, photos: updatedPhotos });
        }
    };

    const handleDeleteQuote = (index) => {
        if (confirm("Bu teklif dosyasını silmek istediğinize emin misiniz?")) {
            const updatedQuotes = project.quotes.filter((_, i) => i !== index);
            onUpdateProject(project.id, { ...project, quotes: updatedQuotes });
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
            case 'Devreye Alma': return '#818cf8'; // Indigo
            case 'Tamamlandı': return '#10b981';
            default: return 'var(--primary)';
        }
    };

    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    const handleResetZoom = () => setZoomLevel(1);

    return (
        <>
            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="no-print"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.95)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10001 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>➕+ </button>
                        <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>➖- </button>
                        <button onClick={(e) => { e.stopPropagation(); handleResetZoom(); }} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>🔄 Sıfırla</button>
                        <button onClick={() => setSelectedImage(null)} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>❌ Kapat</button>
                    </div>

                    <div
                        style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'auto', cursor: zoomLevel > 1 ? 'move' : 'default'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt="Zoomable"
                            style={{
                                maxWidth: zoomLevel > 1 ? 'none' : '90%',
                                maxHeight: zoomLevel > 1 ? 'none' : '90%',
                                objectFit: 'contain',
                                transform: `scale(${zoomLevel})`,
                                transition: 'transform 0.2s ease-out',
                                cursor: 'zoom-in',
                                boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                            }}
                        />
                    </div>
                    <p style={{ color: 'white', position: 'absolute', bottom: '2rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                        Kapatmak için dışarıya tıklayın veya Esc'ye basın.
                    </p>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {selectedPdf && (
                <div
                    className="no-print"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10000,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '2rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'white' }}>{selectedPdf.name}</h3>
                        <button 
                            onClick={() => setSelectedPdf(null)} 
                            style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Kapat ✕
                        </button>
                    </div>
                    <div style={{ flex: 1, background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <iframe 
                            src={selectedPdf.data} 
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="PDF Viewer"
                        />
                    </div>
                </div>
            )}

            <div className="glass-card" style={{ padding: '2rem' }}>

                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>←</span> Dashboard'a Dön
                </button>

                {/* Progress Bar Container */}
                <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '2rem', height: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-glass)' }}>
                    <div 
                        style={{ 
                            width: `${getProgressValue(project.status)}%`, 
                            height: '100%', 
                            background: `linear-gradient(90deg, var(--primary) 0%, ${getStatusColorHex(project.status)} 100%)`,
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 20px ${getStatusColorHex(project.status)}44`
                        }} 
                    />
                    <div style={{ position: 'absolute', right: '1rem', top: '-20px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                        %{getProgressValue(project.status)}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        {isEditingInfo ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '400px' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{ flex: 2, fontSize: '1.5rem', padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--primary)', color: 'white', fontWeight: '800' }}
                                        placeholder="Proje Adı"
                                    />
                                    <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '0.4rem' }}>
                                        <div style={{ position: 'relative', flex: 2 }}>
                                            <input
                                                value={editForm.budget}
                                                type="number"
                                                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem 1.8rem 0.5rem 0.5rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--primary)', color: '#10b981', fontWeight: '700', fontSize: '1rem', outline: 'none' }}
                                                placeholder="Bütçe"
                                            />
                                            <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: '700' }}>$</span>
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input
                                                value={editForm.discount}
                                                type="number"
                                                onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem 1.8rem 0.5rem 0.5rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--primary)', color: '#fbbf24', fontWeight: '700', fontSize: '1rem', outline: 'none' }}
                                                placeholder="İsk."
                                            />
                                            <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', fontWeight: '700' }}>%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        value={editForm.client}
                                        onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                                        style={{ flex: 1, padding: '0.4rem', borderRadius: '0.4rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.9rem' }}
                                        placeholder="Müşteri"
                                    />
                                    <input
                                        value={editForm.responsible}
                                        onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                                        style={{ flex: 1, padding: '0.4rem', borderRadius: '0.4rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.9rem' }}
                                        placeholder="Sorumlu"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleSaveInfo} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Kaydet</button>
                                    <button onClick={() => setIsEditingInfo(false)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'none', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>İptal</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', width: '100%', overflow: 'hidden' }}>
                                    <h1 style={{ 
                                        fontSize: '2.5rem', 
                                        display: 'flex', 
                                        alignItems: 'baseline', 
                                        gap: '1rem',
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        <span style={{ 
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis',
                                            flexShrink: 1
                                        }}>
                                            {project.name}
                                        </span>
                                    </h1>
                                    <button 
                                        onClick={() => setIsEditingInfo(true)}
                                        className="no-print"
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6, transition: '0.2s', flexShrink: 0 }}
                                        title="Düzenle"
                                    >
                                        ✏️
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>{project.client}</p>
                                    <span style={{ color: 'var(--border-glass)' }}>|</span>
                                    <p style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>👤 {project.responsible || 'Belirtilmedi'}</p>
                                    <span style={{ color: 'var(--border-glass)' }}>|</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Ziyaret:</span>
                                        <b style={{ color: 'var(--primary)' }}>{project.visits || 0}</b>
                                        <div className="no-print" style={{ display: 'flex', gap: '0.2rem' }}>
                                            <button onClick={incrementVisits} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', padding: '0 0.2rem' }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="no-print" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {isAdmin && (
                            <button
                                onClick={() => onDelete(project.id)}
                                style={{
                                    padding: '0.6rem', borderRadius: '0.75rem',
                                    background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)',
                                    color: '#f87171', cursor: 'pointer', fontSize: '1.2rem',
                                    transition: 'var(--transition-smooth)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Projeyi Sil"
                            >
                                🗑️
                            </button>
                        )}

                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'var(--transition-smooth)'
                            }}
                        >
                            <span>🖨️</span> PDF / Yazdır
                        </button>

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            {canUpdateStatus ? (
                                <>
                                    <select
                                        value={project.status}
                                        onChange={(e) => handleStatusUpdateAttempt(e.target.value)}
                                        style={{
                                            appearance: 'none',
                                            padding: '0.6rem 2.8rem 0.6rem 1.2rem',
                                            borderRadius: '0.75rem',
                                            background: project.status === 'Planlama' ? 'rgba(248, 113, 113, 0.1)' : 
                                                        project.status === 'Teklif Aşamasında' ? 'rgba(251, 191, 36, 0.1)' : 
                                                        project.status === 'Tamamlandı' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 212, 191, 0.1)',
                                            color: project.status === 'Planlama' ? '#f87171' : 
                                                   project.status === 'Teklif Aşamasında' ? '#fbbf24' : 
                                                   project.status === 'Tamamlandı' ? '#10b981' : '#2dd4bf',
                                            border: `1px solid ${project.status === 'Planlama' ? 'rgba(248, 113, 113, 0.2)' : 
                                                                 project.status === 'Teklif Aşamasında' ? 'rgba(251, 191, 36, 0.2)' : 
                                                                 project.status === 'Tamamlandı' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(45, 212, 191, 0.2)'}`,
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            transition: 'var(--transition-smooth)',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="Keşif">🔍 Keşif</option>
                                        <option value="Projelendirme">📐 Projelendirme</option>
                                        <option value="Teklif Aşamasında">💰 Teklif Aşamasında</option>
                                        <option value="Planlama">📋 Planlama</option>
                                        <option value="Altyapı Kontrolü">⚙️ Altyapı Kontrolü</option>
                                        <option value="Montaj">🛠️ Montaj</option>
                                        <option value="Devreye Alma">🚀 Devreye Alma</option>
                                        <option value="Tamamlandı">✅ Tamamlandı</option>
                                    </select>
                                    <span style={{ 
                                        position: 'absolute', right: '1rem', pointerEvents: 'none', 
                                        fontSize: '0.7rem', opacity: 0.8,
                                        color: project.status === 'Planlama' ? '#f87171' : 
                                               project.status === 'Teklif Aşamasında' ? '#fbbf24' : 
                                               project.status === 'Tamamlandı' ? '#10b981' : '#2dd4bf'
                                    }}>▼</span>
                                </>
                            ) : (
                                <span className={`badge ${
                                    project.status === 'Planlama' ? 'badge-danger' : 
                                    project.status === 'Teklif Aşamasında' ? 'badge-warning' : 'badge-success'
                                }`} style={{ padding: '0.6rem 1.2rem' }}>
                                    {project.status}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Only for Print */}
                    <div className="print-only" style={{ display: 'none' }}>
                         <span className={`badge ${
                            project.status === 'Planlama' ? 'badge-danger' : 
                            project.status === 'Teklif Aşamasında' ? 'badge-warning' : 'badge-success'
                        }`} style={{ padding: '0.5rem 1rem' }}>
                            {project.status}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left: Project Info & Log Form */}
                    <div>
                        <div className="no-print">
                            <h3 style={{ marginBottom: '1rem' }}>Yeni Gelişme Ekle</h3>
                            <form onSubmit={handleSubmitLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea
                                    value={logText}
                                    onChange={(e) => setLogText(e.target.value)}
                                    placeholder="Bugün yapılan çalışmaları buraya yazın..."
                                    style={{
                                        width: '100%', minHeight: '120px', padding: '1rem',
                                        borderRadius: '1rem', background: 'var(--bg-deep)',
                                        border: '1px solid var(--border-glass)', color: 'white',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <button type="submit" className="btn-primary">Notu Kaydet</button>
                            </form>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Saha Fotoğrafları</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                {project.photos && project.photos.map((photo, i) => (
                                    <div key={i} style={{ aspectRatio: '1', background: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border-glass)', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={photo}
                                            alt={`Proje Foto ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                            onClick={() => { setSelectedImage(photo); setZoomLevel(1); }}
                                        />
                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(i); }}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(244, 63, 94, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <label className="no-print" style={{ aspectRatio: '1', border: '2px dashed var(--border-glass)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', fontSize: '1.5rem' }}>
                                    +
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Fiyat Teklifleri (PDF/Excel)</h3>
                                <label className="no-print" style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    + Dosya Ekle
                                    <input type="file" accept=".pdf,.xls,.xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {project.quotes && project.quotes.length > 0 ? project.quotes.map((file, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.2rem' }}>{file.name.endsWith('.pdf') ? '📄' : '📊'}</span>
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{file.name}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.date}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {file.name.toLowerCase().endsWith('.pdf') && (
                                                <button 
                                                    onClick={() => setSelectedPdf(file)}
                                                    style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    Görüntüle
                                                </button>
                                            )}
                                            <a href={file.data} download={file.name} style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600' }}>İndir</a>
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleDeleteQuote(i)}
                                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
                                                    title="Dosyayı Sil"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-glass)', borderRadius: '0.5rem' }}>Henüz teklif eklenmedi.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Project Details & History */}
                    <div>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Proje Detayları</h3>
                            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Proje Bütçesi:</span>
                                    <span style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800' }}>
                                        ${project.budget ? Number(project.budget).toLocaleString('en-US') : '0'}
                                    </span>
                                </div>
                                {project.discount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Uygulanmış Ortalama İskonto:</span>
                                        <span style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: '700', background: 'rgba(251, 191, 36, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '0.4rem' }}>
                                            %{project.discount} İsk.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '1rem' }}>Proje Geçmişi</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {project.logs && project.logs.length > 0 ? (
                                project.logs.map((log, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                        <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{log.text}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {log.user} • {log.date} {log.time}
                                        </p>
                                    </div>
                                )).reverse()
                            ) : (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Henüz kayıt girilmemiş.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
