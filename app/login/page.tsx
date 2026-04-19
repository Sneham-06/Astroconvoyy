'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API_URL from '../config';

export default function Login() {
    const [role, setRole] = useState<'driver' | 'head' | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [officerId, setOfficerId] = useState('');
    const [officerPassword, setOfficerPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [driverMode, setDriverMode] = useState<'menu' | 'entry' | 'sos' | 'login'>('login');
    const router = useRouter();

    // Registration State
    const [regData, setRegData] = useState({
        call_sign: '',
        convoy_name: '',
        start_point: '',
        destination: '',
        mission_type: 'supplies',
        load_weight: '',
        num_vehicles: '1',
        urgency: 'normal'
    });

    useEffect(() => {
        // Direct entry mode (skips role select and code entry)
        if (window.location.search.includes('mode=entry')) {
            setRole('driver');
            setDriverMode('entry');
            return;
        }

        // Check if we are coming from a 'Start New Mission' reset
        if (window.location.search.includes('reset=true')) {
            localStorage.clear();
            return;
        }

        const existingRole = localStorage.getItem('userRole');
        if (existingRole) {
            if (existingRole === 'driver') {
                if (localStorage.getItem('driverData')) router.push('/driver');
            }
            else router.push('/dashboard');
        }
    }, []);

    // ── HARDCODED MILITARY HEAD CREDENTIALS ──────────────────────────────
    const OFFICER_ID       = 'MJRSINGH';
    const OFFICER_PASSWORD = 'ASTRA@2025';
    // ─────────────────────────────────────────────────────────────────────

    const handleHeadLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        if (officerId.trim() !== OFFICER_ID || officerPassword !== OFFICER_PASSWORD) {
            setLoginError('⛔ ACCESS DENIED — Invalid Officer ID or Password.');
            setLoading(false);
            return;
        }

        localStorage.setItem('userRole', 'head');
        router.push('/dashboard');
    };

    const handleDriverLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // SUPPORT FOR GENERIC UNIT CODE (To create new convoys)
        if (accessCode.toUpperCase() === 'ARMY' || accessCode.toUpperCase() === 'UNIT') {
            setDriverMode('entry');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/driver/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_code: accessCode })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('userRole', 'driver');
                localStorage.setItem('driverData', JSON.stringify(data.driver));
                router.push('/driver');
            } else {
                alert(data.error || 'Invalid Access Code. Use "ARMY" for new missions.');
            }
        } catch (e) { alert('Connection error'); }
        setLoading(false);
    };

    const handleEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const convoyRes = await fetch(`${API_URL}/api/convoy/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_name: regData.convoy_name || `CONVOY-${Date.now()}`,
                    start_point: regData.start_point,
                    destination: regData.destination,
                    mission_type: regData.mission_type,
                    load_weight: parseFloat(regData.load_weight),
                    num_vehicles: parseInt(regData.num_vehicles),
                    urgency: regData.urgency
                })
            });
            const convoyData = await convoyRes.json();
            
            if (convoyData.success) {
                const driverRes = await fetch(`${API_URL}/api/driver/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        convoy_id: convoyData.convoy_id,
                        call_sign: regData.call_sign,
                        phone_number: 'N/A' // Set default since it's removed from UI
                    })
                });
                const driverData = await driverRes.json();
                if (driverData.success) {
                    alert(`✅ Entry Successful! Mission visible to Command. Code: ${driverData.access_code}`);
                    localStorage.setItem('userRole', 'driver');
                    localStorage.setItem('driverData', JSON.stringify({
                        convoy_id: convoyData.convoy_id,
                        call_sign: regData.call_sign
                    }));
                    router.push('/driver');
                }
            }
        } catch (e) { alert('Failed to register entry'); }
        setLoading(false);
    };

    const triggerSOS = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/driver/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: "EMERGENCY_DIRECT",
                    location: "Unknown Location (Direct Alert)",
                    issue_type: "immediate_sos"
                })
            });
            alert('🚨 SOS ALERT SENT DIRECTLY TO COMMAND CENTER!');
            setDriverMode('menu');
        } catch (e) { alert('SOS failed'); }
        setLoading(false);
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh' }}>
            <div className="card glass-premium" style={{ maxWidth: driverMode === 'entry' ? '800px' : '500px', width: '100%', padding: '2.5rem' }}>
                
                {/* Header */}
                <div className="text-center mb-3">
                    <h1 style={{ fontSize: '1.8rem' }}>🛡️ ASTRACONVOY</h1>
                    <p style={{ color: 'var(--military-green-accent)', letterSpacing: '2px', fontSize: '0.7rem' }}>
                        MILITARY PROTOCOL INTERFACE
                    </p>
                </div>

                {/* Role Selection */}
                {!role ? (
                    <div className="grid gap-2">
                        <button className="btn btn-primary" style={{ padding: '2rem', height: 'auto' }} onClick={() => setRole('head')}>
                            <span style={{ fontSize: '2rem' }}>🎖️</span><br/>MILITARY HEAD
                        </button>
                        <button className="btn btn-warning" style={{ padding: '2rem', height: 'auto' }} onClick={() => setRole('driver')}>
                            <span style={{ fontSize: '2rem' }}>🚛</span><br/>CANTONMENT DRIVER
                        </button>
                    </div>
                ) : role === 'head' ? (
                    <form onSubmit={handleHeadLogin}>
                        <div className="flex-between mb-2">
                            <h3>OFFICER AUTHENTICATION</h3>
                            <button type="button" className="btn" style={{ fontSize: '0.7rem' }} onClick={() => { setRole(null); setLoginError(''); }}>BACK</button>
                        </div>

                        {loginError && (
                            <div style={{
                                background: 'rgba(255,0,51,0.12)',
                                border: '1px solid #ff0033',
                                color: '#ff4466',
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                marginBottom: '1rem',
                                letterSpacing: '0.5px'
                            }}>
                                {loginError}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">OFFICER ID</label>
                            <input
                                type="text"
                                placeholder="e.g. MJRSINGH"
                                className="form-input"
                                value={officerId}
                                onChange={e => { setOfficerId(e.target.value); setLoginError(''); }}
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">SECURE PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="form-input"
                                value={officerPassword}
                                onChange={e => { setOfficerPassword(e.target.value); setLoginError(''); }}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'VERIFYING...' : '🔐 AUTHORIZE ACCESS'}
                        </button>
                    </form>
                ) : (
                    /* Driver Section */
                    <div>
                        <div className="flex-between mb-2">
                            <h3>DRIVER PORTAL</h3>
                            <button className="btn" style={{ fontSize: '0.7rem' }} onClick={() => { setRole(null); setDriverMode('menu'); }}>BACK</button>
                        </div>

                        {driverMode === 'menu' && (
                            <div className="grid gap-2">
                                <div className="text-center mb-2" style={{ color: 'var(--military-gold)', fontSize: '0.8rem' }}>
                                    ✅ AUTHORIZATION GRANTED
                                </div>
                                <button className="btn btn-primary" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }} onClick={() => setDriverMode('entry')}>
                                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                                    <span>ENTRY CONVOY (START NEW)</span>
                                </button>
                                <button className="btn btn-danger" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }} onClick={triggerSOS}>
                                    <span style={{ fontSize: '1.5rem' }}>🆘</span>
                                    <span>IMMEDIATE SOS ALERT</span>
                                </button>
                                <button className="btn btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => setDriverMode('login')}>
                                    LOGOUT / BACK
                                </button>
                            </div>
                        )}

                        {driverMode === 'login' && (
                            <form onSubmit={handleDriverLogin}>
                                <div className="form-group">
                                    <label className="form-label">ACCESS CODE</label>
                                    <input type="password" className="form-input" placeholder="••••••••" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ACCESS DASHBOARD</button>
                                <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setDriverMode('menu')}>CANCEL</button>
                            </form>
                        )}

                        {driverMode === 'entry' && (
                            <form onSubmit={handleEntrySubmit}>
                                <div className="grid grid-2">
                                    <div>
                                        <div className="form-group"><label className="form-label">Unit Call Sign</label><input type="text" className="form-input" placeholder="e.g. VULCAN-1" value={regData.call_sign} onChange={e => setRegData({...regData, call_sign: e.target.value})} required /></div>
                                        <div className="form-group"><label className="form-label">Convoy Name</label><input type="text" className="form-input" placeholder="e.g. ALPHA-9" value={regData.convoy_name} onChange={e => setRegData({...regData, convoy_name: e.target.value})} required /></div>
                                        <div className="form-group"><label className="form-label">Starting From</label><input type="text" className="form-input" placeholder="Location A" value={regData.start_point} onChange={e => setRegData({...regData, start_point: e.target.value})} required /></div>
                                        <div className="form-group"><label className="form-label">Destination</label><input type="text" className="form-input" placeholder="Location B" value={regData.destination} onChange={e => setRegData({...regData, destination: e.target.value})} required /></div>
                                    </div>
                                    <div>
                                        <div className="form-group"><label className="form-label">Mission Type</label><select className="form-select" value={regData.mission_type} onChange={e => setRegData({...regData, mission_type: e.target.value})}><option value="medical">Medical</option><option value="ammunition">Ammunition</option><option value="supplies">Supplies</option><option value="fuel">Fuel</option></select></div>
                                        <div className="form-group"><label className="form-label">Load Weight (Tons)</label><input type="number" className="form-input" value={regData.load_weight} onChange={e => setRegData({...regData, load_weight: e.target.value})} required /></div>
                                        <div className="form-group">
                                            <label className="form-label">Mission Priority</label>
                                            <select className="form-select" value={regData.urgency} onChange={e => setRegData({...regData, urgency: e.target.value})}>
                                                <option value="critical">🚨 CRITICAL</option>
                                                <option value="high">⚠️ HIGH</option>
                                                <option value="normal">🟢 NORMAL</option>
                                                <option value="low">⚪ LOW</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1.2rem' }} disabled={loading}>
                                    {loading ? 'INITIALIZING MISSION...' : '🚀 REGISTER & START MISSION'}
                                </button>
                                
                                <div className="text-center mt-2">
                                    <button type="button" className="btn btn-outline" style={{ border: 'none', fontSize: '0.8rem' }} onClick={() => setDriverMode('login')}>
                                        🏠 Back to Login / Use different code
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
