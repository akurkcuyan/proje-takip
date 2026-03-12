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
        discount: project.discount || '',
        quoteStatus: project.quoteStatus || 'Beklemede', // Beklemede, Kabul Edildi, Reddedildi
        paymentMethod: project.paymentMethod || '',
        agreementTerms: project.agreementTerms || ''
    });

    const [isEditingTerms, setIsEditingTerms] = useState(false);
    const [tempTerms, setTempTerms] = useState({
        paymentMethod: project.paymentMethod || '',
        agreementTerms: project.agreementTerms || ''
    });

    // Sync edit form when project changes
    useEffect(() => {
        setEditForm({
            name: project.name,
            client: project.client,
            responsible: project.responsible,
            budget: project.budget || '',
            discount: project.discount || '',
            quoteStatus: project.quoteStatus || 'Beklemede',
            paymentMethod: project.paymentMethod || '',
            agreementTerms: project.agreementTerms || ''
        });
        setTempTerms({
            paymentMethod: project.paymentMethod || '',
            agreementTerms: project.agreementTerms || ''
        });
    }, [project]);

    const handleSaveInfo = () => {
        onUpdateProject(project.id, {
            ...project,
            name: editForm.name,
            client: editForm.client,
            responsible: editForm.responsible,
            budget: editForm.budget,
            discount: editForm.discount,
            quoteStatus: editForm.quoteStatus,
            paymentMethod: editForm.paymentMethod,
            agreementTerms: editForm.agreementTerms
        });
        setIsEditingInfo(false);
    };

    const handleSaveTerms = () => {
        onUpdateProject(project.id, {
            ...project,
            paymentMethod: tempTerms.paymentMethod,
            agreementTerms: tempTerms.agreementTerms
        });
        setIsEditingTerms(false);
    };

    const canUpdateStatus = role === 'Yönetici' || role === 'Satış Ekibi' || role === 'Saha Ekibi' || isAdmin;

    const handleSubmitLog = (e) => {
        e.preventDefault();
        if (!logText.trim()) return;

        onAddLog(project.id, {
            text: logText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('tr-TR'),
            user: role,
            status: project.status // Capture current status
        });
        setLogText('');
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) { // 50 MB Limit
            alert("⚠️ Yüklediğiniz fotoğraf 50MB'dan büyük olamaz!");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Sunucudaki projetakip klasörünün ana dizininde bulunan upload.php'ye dosya yollanır
            const res = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Sunucu hatası');
            
            const data = await res.json();
            if (data.success) {
                onAddPhoto(project.id, data.url);
            } else {
                alert("Yükleme Hatası: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Fotoğraf yüklenemedi. Sunucu veya internet bağlantınızı kontrol edin.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) { // 50 MB Limit
            alert("⚠️ Yüklediğiniz dosya/PDF 50MB'dan büyük olamaz!");
            return;
        }

        const quotePrice = prompt(`${file.name} belgesi incelendi. Belgedeki GENEL TOPLAM tutarını (USD) giriniz:`, project.budget || "");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Sunucu hatası');
            
            const data = await res.json();
            if (data.success) {
                const updatedQuotes = [...(project.quotes || []), {
                    name: file.name,
                    type: file.type,
                    data: data.url, // URL'yi kaydediyoruz, Base64 değil
                    date: new Date().toLocaleDateString('tr-TR')
                }];

                const updateData = { ...project, quotes: updatedQuotes };
                if (quotePrice !== null && quotePrice !== "") {
                    updateData.budget = quotePrice;
                }
                
                onUpdateProject(project.id, updateData);
            } else {
                alert("Yükleme Hatası: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Teklif dosyası yüklenemedi. PHP sunucu ayarlarını veya internetinizi kontrol edin.");
        }
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

            <div className="glass-card container" style={{ padding: '2rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print mobile-stack">
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
                        <span>←</span> Dashboard'a Dön
                    </button>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => setIsEditingInfo(true)}
                            style={{ 
                                padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
                                color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                transition: '0.2s', display: 'flex', alignItems: 'center'
                            }}
                            title="Düzenle"
                        >
                            Düzenle
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => onDelete(project.id)}
                                style={{
                                    padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                                    background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)',
                                    color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                    transition: '0.2s', display: 'flex', alignItems: 'center'
                                }}
                                title="Projeyi Sil"
                            >
                                Sil
                            </button>
                        )}

                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                display: 'flex', alignItems: 'center', transition: '0.2s'
                            }}
                        >
                            PDF / Yazdır
                        </button>
                    </div>
                </div>

                {/* Workflow Status Buttons */}
                <div 
                    className="no-print" 
                    style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem', 
                        marginBottom: '1rem',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-glass)'
                    }}
                >
                    {['Keşif', 'Projelendirme', 'Teklif Aşamasında', 'Planlama', 'Altyapı Kontrolü', 'Montaj', 'Devreye Alma', 'Tamamlandı'].map((status) => {
                        const isActive = project.status === status;
                        const isPast = getProgressValue(project.status) > getProgressValue(status);
                        const icons = {
                            'Keşif': '🔍', 'Projelendirme': '📐', 'Teklif Aşamasında': '💰', 'Planlama': '📋',
                            'Altyapı Kontrolü': '⚙️', 'Montaj': '🛠️', 'Devreye Alma': '🚀', 'Tamamlandı': '✅'
                        };
                        
                        return (
                            <button
                                key={status}
                                disabled={!canUpdateStatus}
                                onClick={() => handleStatusUpdateAttempt(status)}
                                style={{
                                    flex: 1,
                                    minWidth: '120px',
                                    padding: '0.75rem 0.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid',
                                    borderColor: isActive ? getStatusColorHex(status) : 'var(--border-glass)',
                                    background: isActive ? `${getStatusColorHex(status)}22` : isPast ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: isActive ? getStatusColorHex(status) : isPast ? 'var(--text-muted)' : 'rgba(255,255,255,0.4)',
                                    fontSize: '0.7rem',
                                    fontWeight: isActive ? '800' : '600',
                                    cursor: canUpdateStatus ? 'pointer' : 'default',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', opacity: isActive || isPast ? 1 : 0.4 }}>{icons[status]}</span>
                                <span>{status}</span>
                            </button>
                        );
                    })}
                </div>

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

                {/* Content starts below progress bar */}


                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        {isEditingInfo ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '500px', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '0.2rem' }}>PROJE ADI</label>
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{ fontSize: '1.2rem', padding: '0.75rem', borderRadius: '0.6rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white', fontWeight: '800', width: '100%' }}
                                        placeholder="Proje Adı Giriniz"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '0.2rem' }}>PROJE BÜTÇESİ</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                value={editForm.budget}
                                                type="number"
                                                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 2rem', borderRadius: '0.6rem', background: 'var(--bg-deep)', border: '1px solid #10b98144', color: '#10b981', fontWeight: '800', fontSize: '1.1rem', outline: 'none' }}
                                                placeholder="0.00"
                                            />
                                            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: '800' }}>$</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '0.2rem' }}>İSKONTO (%)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                value={editForm.discount}
                                                type="number"
                                                onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                                                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 0.75rem', borderRadius: '0.6rem', background: 'var(--bg-deep)', border: '1px solid #fbbf2444', color: '#fbbf24', fontWeight: '800', fontSize: '1.1rem', outline: 'none' }}
                                                placeholder="0"
                                            />
                                            <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', fontWeight: '800' }}>%</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '0.2rem' }}>MÜŞTERİ / KURUM</label>
                                        <input
                                            value={editForm.client}
                                            onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                                            style={{ padding: '0.6rem', borderRadius: '0.6rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.9rem' }}
                                            placeholder="Müşteri Adı"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '0.2rem' }}>SORUMLU KİŞİ</label>
                                        <input
                                            value={editForm.responsible}
                                            onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                                            style={{ padding: '0.6rem', borderRadius: '0.6rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.9rem' }}
                                            placeholder="Sorumlu Kişi"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button onClick={handleSaveInfo} className="btn-primary" style={{ flex: 1, padding: '0.75rem', fontWeight: '700' }}>Bilgileri Güncelle</button>
                                    <button onClick={() => setIsEditingInfo(false)} style={{ flex: 1, padding: '0.75rem', background: 'none', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: '600' }}>İptal Et</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Row 1: Project Name + Identity */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                    <h1 style={{ fontSize: '2rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {project.name}
                                    </h1>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{project.client}</p>
                                        <span className="mobile-hide" style={{ color: 'var(--border-glass)', fontSize: '0.85rem' }}>•</span>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>👤 {project.responsible || 'Belirtilmedi'}</p>
                                        <span className="mobile-hide" style={{ color: 'var(--border-glass)', fontSize: '0.85rem' }}>•</span>
                                        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 Ziyaret:</span>
                                            <b style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{project.visits || 0}</b>
                                            <button onClick={incrementVisits} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', padding: '0 0.2rem', fontSize: '1rem', lineHeight: 1 }}>+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Status Bar */}
                                <div className="no-print" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border-glass)',
                                    marginBottom: '1rem'
                                }}>

                                    
                                    {/* Anlaşma Detayları */}
                                    {project.quoteStatus === 'Kabul Edildi' && !['Keşif', 'Projelendirme'].includes(project.status) && (
                                        <>
                                            {isEditingTerms ? (
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <label style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💳 Ödeme Şekli</label>
                                                        <input 
                                                            value={tempTerms.paymentMethod}
                                                            onChange={(e) => setTempTerms({ ...tempTerms, paymentMethod: e.target.value })}
                                                            placeholder="Örn: %50 Peşin Kalan 30-60-90"
                                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', color: 'white', fontSize: '0.85rem', width: '220px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <label style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🤝 Anlaşma Şekli</label>
                                                        <input 
                                                            value={tempTerms.agreementTerms}
                                                            onChange={(e) => setTempTerms({ ...tempTerms, agreementTerms: e.target.value })}
                                                            placeholder="Örn: Sözleşme İmzalandı"
                                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', color: 'white', fontSize: '0.85rem', width: '200px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.4rem', paddingBottom: '0.1rem' }}>
                                                        <button onClick={handleSaveTerms} style={{ background: '#10b981', border: 'none', color: 'black', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800' }}>Kaydet</button>
                                                        <button onClick={() => setIsEditingTerms(false)} style={{ background: 'none', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>İptal</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>💳 Ödeme: <b style={{ color: 'white' }}>{project.paymentMethod || '-'}</b></span>
                                                    <span style={{ color: 'var(--border-glass)', fontSize: '0.9rem' }}>|</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>🤝 Anlaşma: <b style={{ color: 'white' }}>{project.agreementTerms || '-'}</b></span>
                                                    <button 
                                                        onClick={() => setIsEditingTerms(true)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem 0.3rem', fontSize: '0.8rem', opacity: 0.6 }}
                                                        title="Anlaşma Detaylarını Düzenle"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Teklif Kararı */}
                                    {!['Keşif', 'Projelendirme'].includes(project.status) && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-glass)' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', whiteSpace: 'nowrap' }}>📋 Teklif Durumu:</span>
                                                <select
                                                    value={project.quoteStatus || 'Beklemede'}
                                                    onChange={(e) => onUpdateProject(project.id, { ...project, quoteStatus: e.target.value })}
                                                    style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid var(--border-glass)',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.35rem 2rem 0.35rem 0.6rem',
                                                        color: project.quoteStatus === 'Kabul Edildi' ? '#10b981' : 
                                                               project.quoteStatus === 'Reddedildi' ? '#f87171' : '#fbbf24',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        appearance: 'none',
                                                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 0.5rem center'
                                                    }}
                                                >
                                                    <option value="Beklemede" style={{ background: '#111', color: '#fbbf24' }}>⏳ BEKLEMEDE</option>
                                                    <option value="Kabul Edildi" style={{ background: '#111', color: '#10b981' }}>✅ KABUL EDİLDİ</option>
                                                    <option value="Reddedildi" style={{ background: '#111', color: '#f87171' }}>❌ REDDEDİLDİ</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
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

                <div className="resp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left: Project Management */}
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
                                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Teklif Durumu:</span>
                                        <span style={{ 
                                            fontSize: '0.9rem', 
                                            fontWeight: '700', 
                                            color: project.quoteStatus === 'Kabul Edildi' ? '#10b981' : project.quoteStatus === 'Reddedildi' ? '#f87171' : '#fbbf24'
                                        }}>
                                            {project.quoteStatus === 'Kabul Edildi' ? '✅ Kabul Edildi' : project.quoteStatus === 'Reddedildi' ? '❌ Kabul Edilmedi' : '⏳ Beklemede'}
                                        </span>
                                    </div>
                                    {project.quoteStatus === 'Kabul Edildi' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ödeme Şekli:</span>
                                            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>
                                                {project.paymentMethod || 'Belirtilmedi'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Saha Fotoğrafları</h3>
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
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
                                <h3>Fiyat Teklifleri</h3>
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

                    {/* Right: Activity Stream */}
                    <div>

                        <div className="no-print" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Yeni Gelişme Ekle</h3>
                            <form onSubmit={handleSubmitLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea
                                    value={logText}
                                    onChange={(e) => setLogText(e.target.value)}
                                    placeholder="Bugün yapılan çalışmaları buraya yazın..."
                                    style={{
                                        width: '100%', minHeight: '100px', padding: '1rem',
                                        borderRadius: '1rem', background: 'var(--bg-deep)',
                                        border: '1px solid var(--border-glass)', color: 'white',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <button type="submit" className="btn-primary">Notu Kaydet</button>
                            </form>
                        </div>

                        <h3 style={{ marginBottom: '1rem' }}>Proje Geçmişi</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {project.logs && project.logs.length > 0 ? (
                                project.logs.map((log, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                        <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{log.text}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{log.user} • {log.date} {log.time}</span>
                                            {log.status && <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{log.status}</span>}
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
