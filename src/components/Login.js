"use client";
import { useState } from 'react';

export default function Login({ onLogin }) {
    const [selectedRole, setSelectedRole] = useState('Genel Yönetici');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const users = {
        'Genel Yönetici': { name: 'Admin', pass: 'Alx131975!' },
        'Yönetici': { name: 'Sarkis ÇAVUŞYAN', pass: 'sony1234' },
        'Saha Ekibi': { name: 'Montaj Ekibi', pass: 'din1234' },
        'Satış Ekibi': { name: 'Satış Ekibi', pass: 'din1234' }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const foundUser = users[selectedRole];

        if (foundUser && foundUser.pass === password) {
            onLogin({ role: selectedRole, name: foundUser.name });
        } else {
            setError('Hatalı şifre!');
        }
    };

    return (
        <div className="container" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: '800' }}>Dinakord Elektronik Proje Takip</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Devam etmek için giriş yapın.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', marginLeft: '0.5rem' }}>Giriş Yapılacak Rol</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            style={{
                                padding: '0.8rem 1rem', borderRadius: '0.8rem',
                                background: 'var(--bg-deep)', border: '1px solid var(--border-glass)',
                                color: 'white', cursor: 'pointer', appearance: 'none'
                            }}
                        >
                            <option value="Genel Yönetici">Genel Yönetici (Admin)</option>
                            <option value="Yönetici">Yönetici (Sarkis ÇAVUŞYAN)</option>
                            <option value="Saha Ekibi">Saha Ekibi (Montaj)</option>
                            <option value="Satış Ekibi">Satış Ekibi</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', marginLeft: '0.5rem' }}>Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                            style={{ padding: '0.8rem 1rem', borderRadius: '0.8rem', background: 'var(--bg-deep)', border: '1px solid var(--border-glass)', color: 'white' }}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>Giriş Yap</button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    © 2026 Proje Takip v1.7
                </p>
            </div>
        </div>
    );
}
