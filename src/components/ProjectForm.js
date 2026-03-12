"use client";
import { useState } from 'react';

export default function ProjectForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        responsible: '',
        status: 'Keşif',
        budget: '',
        discount: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, id: Date.now(), logs: [] });
    };

    return (
        <div style={{ padding: '0 0.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', margin: '1rem auto' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Yeni Proje Oluştur</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Proje Adı</label>
                        <input
                            required
                            type="text"
                            placeholder="Örn: Hilton Konferans Salonu"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Müşteri / Kurum</label>
                        <input
                            required
                            type="text"
                            placeholder="Müşteri adını giriniz"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sorumlu Kişi</label>
                        <input
                            required
                            type="text"
                            placeholder="Proje sorumlusunu giriniz"
                            value={formData.responsible}
                            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white' }}
                        />
                    </div>

                    <div className="resp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Bütçe (USD)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="Örn: 5000"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 2.2rem 0.75rem 0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: '#10b981', fontWeight: '700', fontSize: '1rem', outline: 'none' }}
                                />
                                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: '700' }}>$</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>İskonto (%)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="Örn: 15"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 2.2rem 0.75rem 0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: '#fbbf24', fontWeight: '700', fontSize: '1rem', outline: 'none' }}
                                />
                                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', fontWeight: '700' }}>%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Başlangıç Durumu</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white' }}
                        >
                            <option value="Keşif">Keşif</option>
                            <option value="Projelendirme">Projelendirme</option>
                            <option value="Teklif Aşamasında">Teklif Aşamasında</option>
                            <option value="Planlama">Planlama</option>
                            <option value="Altyapı Kontrolü">Altyapı Kontrolü</option>
                            <option value="Montaj">Montaj</option>
                            <option value="Devreye Alma">Devreye Alma</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Kaydet</button>
                        <button type="button" onClick={onCancel} style={{ flex: 1, background: 'none', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '0.75rem', cursor: 'pointer' }}>İptal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
