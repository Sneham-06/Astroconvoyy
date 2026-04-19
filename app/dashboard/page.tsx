'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import API_URL from '../config';
import TacticalMap from '../components/TacticalMap';

export default function DashboardPage() {
    const router = useRouter();
    const [convoys, setConvoys] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [v2vMessages, setV2vMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState<{[key: string]: string}>({});
    const [showMap, setShowMap] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (!role || role !== 'head') {
            router.push('/login');
            return;
        }
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const urls = [
                `${API_URL}/api/convoy/list`,
                `${API_URL}/api/alerts`,
                `${API_URL}/api/analytics/dashboard`,
                `${API_URL}/api/v2v/messages`
            ];

            const responses = await Promise.all(urls.map(url => fetch(url).catch(e => null)));
            
            const results = await Promise.all(responses.map(async (res) => {
                if (!res || !res.ok) return null;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return res.json();
                }
                return null;
            }));

            const [convoysData, alertsData, statsData, v2vData] = results;

            if (convoysData) setConvoys(convoysData.convoys || []);
            if (alertsData) setAlerts(alertsData.alerts || []);
            if (statsData) setStats(statsData || {});
            if (v2vData) setV2vMessages(v2vData.messages || []);
            
            setLoading(false);
        } catch (error) {
            console.error('Tactical link unstable...', error);
            setLoading(false);
        }
    };

    const sendInstruction = async (convoyId: string, directMessage?: string) => {
        const text = directMessage || messageText[convoyId];
        if (!text) return;

        try {
            await fetch(`${API_URL}/api/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: convoyId,
                    content: text
                })
            });
            if (!directMessage) {
                setMessageText(prev => ({ ...prev, [convoyId]: '' }));
            }
            alert(convoyId === 'ALL' ? 'GLOBAL BROADCAST TRANSMITTED' : 'TACTICAL INSTRUCTION TRANSMITTED');
        } catch (e) { alert('Transmission failed'); }
    };

    const triggerEmergency = async (convoyId: string, type: string) => {
        try {
            await fetch(`${API_URL}/api/alerts/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: convoyId,
                    alert_type: 'emergency',
                    severity: 'critical',
                    message: `COMMAND INITIATED EMERGENCY: ${type.toUpperCase()}`
                })
            });
            fetchData();
            alert('EMERGENCY PROTOCOL INITIATED');
        } catch (e) { alert('Failed to trigger emergency'); }
    };

    const sendV2VMessage = async (convoyId: string) => {
        const content = prompt("Enter Broadcast Message for Convoy Unit:");
        if (!content) return;
        try {
            await fetch(`${API_URL}/api/v2v/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from_convoy_id: convoyId, message: content })
            });
            fetchData();
            alert('V2V broadcast sent');
        } catch (e) {}
    };

    const completeConvoy = async (convoyId: number) => {
        if (!confirm('Confirm marking this mission as COMPLETED and removing it from the active dashboard?')) return;
        try {
            const res = await fetch(`${API_URL}/api/convoy/${convoyId}/complete`, { method: 'POST' });
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error('Failed to complete convoy', e);
        }
    };


    const getThreatBadge = (level: number) => {
        if (level >= 8) return <span className="badge badge-critical">LEVEL {level} - CRITICAL</span>;
        if (level >= 5) return <span className="badge badge-warning">LEVEL {level} - HIGH</span>;
        return <span className="badge badge-low">LEVEL {level} - LOW</span>;
    };

    const getPriorityBadge = (score: number) => {
        if (score >= 80) return <span className="badge badge-critical">ALPHA PRIORITY</span>;
        if (score >= 50) return <span className="badge badge-warning">BRAVO PRIORITY</span>;
        return <span className="badge badge-low">ROUTINE</span>;
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="container text-center" style={{ marginTop: '20vh' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--military-gold)' }}>INITIATING COMMAND LINK...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <div className="container">
                <div className="flex-between mb-2">
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <rect x="3" y="12" width="4" height="9" rx="1"/>
                                <rect x="9.5" y="7" width="4" height="14" rx="1"/>
                                <rect x="16" y="3" width="4" height="18" rx="1"/>
                            </svg>
                            Strategic Command Dashboard
                        </h1>
                        <p style={{ color: '#a0a0a0' }}>Live mission tracking and real-time tactical overview</p>
                    </div>
                    <div className="badge badge-low" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', display: 'flex', gap: '1rem' }}>
                        <span>🟢 SYSTEM OPERATIONAL</span>
                    </div>
                </div>

                {/* Strategic Command Menu */}
                <div className="card mb-3" style={{ background: 'rgba(26, 61, 46, 0.3)', border: '1px solid var(--military-green-accent)' }}>
                    <div className="card-header" style={{ padding: '0.8rem 1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--military-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                            </svg>
                            STRATEGIC COMMAND MENU
                        </h3>
                    </div>
                    <div className="card-body" style={{ padding: '1rem' }}>
                        <div className="grid grid-3" style={{ gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => router.push('/threats')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                                THREAT INTEL
                            </button>
                            <button className="btn btn-outline" onClick={() => router.push('/emergencies')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                EMERGENCY HUB
                            </button>
                            <button className="btn btn-outline" onClick={() => router.push('/priority')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                PRIORITY CONTROL
                            </button>
                            <button className="btn btn-outline" onClick={() => router.push('/conflicts')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6l3 9h6l3-9"/><path d="M12 12v9"/><path d="M9 21h6"/></svg>
                                CONFLICT MATRIX
                            </button>
                            <button className="btn btn-outline" onClick={() => router.push('/digital-twin')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                DIGITAL TWIN
                            </button>
                            <button className="btn btn-outline" onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                EXIT TO HUB
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Command Control */}
                <div className="card mb-3" style={{ border: '2px solid var(--military-gold)', background: 'rgba(212, 175, 55, 0.05)' }}>
                    <div className="card-header flex-between" style={{ padding: '0.8rem 1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--military-gold)', margin: 0 }}>🔊 EMERGENCY GLOBAL BROADCAST</h3>
                        <div style={{ display: 'flex', gap: '1rem', flex: 1, marginLeft: '2rem' }}>
                            <input 
                                type="text" 
                                id="global-msg-input"
                                className="form-input" 
                                placeholder="Message to ALL active convoys..." 
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--military-gold)' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.currentTarget as HTMLInputElement;
                                        if (input.value) {
                                            sendInstruction('ALL', input.value);
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                            <button 
                                className="btn btn-danger"
                                onClick={() => {
                                    const input = document.getElementById('global-msg-input') as HTMLInputElement;
                                    if (input.value) {
                                        sendInstruction('ALL', input.value);
                                        input.value = '';
                                    }
                                }}
                            >
                                TRANSMIT ALL
                            </button>
                        </div>
                    </div>
                </div>

                {/* Direct Unit Intelligence Feed */}
                {alerts.filter(a => a.alert_type === 'report').length > 0 && (
                    <div className="card mb-3" style={{ 
                        borderLeft: '6px solid var(--military-green-accent)', 
                        animation: 'slideDown 0.4s ease, pulse-green 2s infinite',
                        boxShadow: '0 0 20px rgba(61, 122, 92, 0.2)' 
                    }}>
                        <div className="card-header flex-between" style={{ padding: '0.6rem 1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--military-green-accent)', margin: 0 }}>📡 DIRECT UNIT INTELLIGENCE (LATEST REPORTS)</h3>
                            <span className="badge badge-low" style={{ animation: 'pulse 1s infinite' }}>LIVE DATA</span>
                        </div>
                        <div className="card-body" style={{ maxHeight: '150px', overflowY: 'auto', padding: '1rem' }}>
                            {alerts.filter(a => a.alert_type === 'report').reverse().slice(0, 3).map((report, i) => (
                                <div key={i} className="alert alert-info" style={{ marginBottom: '0.5rem', background: 'rgba(61, 122, 92, 0.1)', border: '1px solid rgba(61, 122, 92, 0.3)' }}>
                                    <div className="flex-between">
                                        <strong>UNIT-{report.convoy_id}</strong>
                                        <small>{report.created_at}</small>
                                    </div>
                                    <div style={{ marginTop: '0.3rem', fontSize: '1rem', color: '#fff' }}>{report.message.replace('SITUATION REPORT: ', '')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-box">
                        <div className="stat-label">Active Convoys</div>
                        <div className="stat-value">{stats.total_active_convoys || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">High Threat</div>
                        <div className="stat-value" style={{ color: '#ff6b35' }}>{stats.high_threat_convoys || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Active Emergencies</div>
                        <div className="stat-value" style={{ color: '#ff0033' }}>{stats.active_emergencies || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Avg Threat</div>
                        <div className="stat-value">{stats.average_threat_level || 0}/10</div>
                    </div>
                </div>

                {/* Convoys List */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">🚛 Active Fleet Operations</h2>
                    </div>
                    <div className="card-body">
                        {convoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                📡 Waiting for ground units to transmit mission parameters...
                            </div>
                        ) : (
                            <div className="grid grid-1" style={{ gap: '1.5rem' }}>
                                {convoys.map((convoy) => (
                                    <div key={convoy.id} className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="card-header" style={{ padding: '1rem' }}>
                                            <div>
                                                <h3 className="card-title">{convoy.convoy_name || `UNIT-${convoy.id}`}</h3>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{convoy.start_point} → {convoy.destination}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {getThreatBadge(convoy.threat_level)}
                                                    {getPriorityBadge(convoy.priority_score)}
                                                </div>
                                                <button 
                                                    className="btn" 
                                                    onClick={() => completeConvoy(convoy.id)} 
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        background: 'rgba(0, 255, 136, 0.1)',
                                                        color: '#00ff88',
                                                        border: '1px solid #00ff88',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                    COMPLETE
                                                </button>
                                                <button 
                                                    className="btn" 
                                                    onClick={() => setShowMap(prev => ({ ...prev, [convoy.id]: !prev[convoy.id] }))} 
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        background: showMap[convoy.id] ? 'var(--military-gold)' : 'rgba(212,175,55,0.1)',
                                                        color: showMap[convoy.id] ? 'black' : 'var(--military-gold)',
                                                        border: '1px solid var(--military-gold)',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    🌍 {showMap[convoy.id] ? 'CLOSE FEED' : 'UNIT MAP'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ padding: '1rem' }}>
                                            <div className="grid grid-4 mb-2">
                                                <div><div style={{fontSize:'0.7rem', opacity:0.6}}>Mission</div><div>{convoy.mission_type}</div></div>
                                                <div><div style={{fontSize:'0.7rem', opacity:0.6}}>Vehicles</div><div>{convoy.num_vehicles}</div></div>
                                                <div><div style={{fontSize:'0.7rem', opacity:0.6}}>Load</div><div>{convoy.load_weight}T</div></div>
                                                <div><div style={{fontSize:'0.7rem', opacity:0.6}}>ETA</div><div>{convoy.eta}</div></div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                                                <div style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
                                                    <input 
                                                        type="text" 
                                                        className="form-input" 
                                                        placeholder="Send instruction..." 
                                                        style={{ flex: 1, padding: '0.5rem' }}
                                                        value={messageText[convoy.id] || ''}
                                                        onChange={(e) => setMessageText(prev => ({ ...prev, [convoy.id]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                sendInstruction(convoy.id);
                                                            }
                                                        }}
                                                    />
                                                    <button 
                                                        className="btn btn-primary" 
                                                        style={{ padding: '0.5rem 1.5rem', background: 'var(--military-gold)', color: 'black', fontWeight: 'bold' }}
                                                        onClick={() => sendInstruction(convoy.id)}
                                                    >
                                                        SEND
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-danger" onClick={() => triggerEmergency(convoy.id, 'alert')} style={{fontSize:'0.8rem', padding:'0.5rem 1rem'}}>🚨 SOS</button>
                                                    <button className="btn btn-primary" onClick={() => router.push('/digital-twin')} style={{fontSize:'0.8rem', padding:'0.5rem 1rem'}}>🛰️ HUB</button>
                                                </div>
                                            </div>

                                            {showMap[convoy.id] && (
                                                <div className="mt-2 animate-fadeIn" style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '1rem' }}>
                                                    <TacticalMap 
                                                        startPoint={convoy.start_point} 
                                                        destination={convoy.destination} 
                                                        height="250px"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="card mb-3">
                        <div className="card-header"><h2 className="card-title">🚨 Active Combat Alerts</h2></div>
                        <div className="card-body">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`alert ${alert.severity === 'critical' ? 'alert-emergency' : 'alert-warning'}`} style={{marginBottom:'0.5rem'}}>
                                    <strong>{alert.convoy_name}</strong>: {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tactical Communication Feed */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">📡 Tactical Communication Feed</h2>
                    </div>
                    <div className="card-body">
                        {v2vMessages.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>No tactical broadcasts currently in history.</p>
                        ) : (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {v2vMessages.map((msg, i) => (
                                    <div key={i} className={`alert ${msg.type === 'TAC' ? 'alert-emergency' : 'alert-info'}`} style={{ marginBottom: '0.5rem', opacity: msg.type === 'TAC' ? 1 : 0.8 }}>
                                        <div className="flex-between">
                                            <strong>{msg.from}</strong>
                                            <span style={{ fontSize: '0.7rem' }}>{msg.time}</span>
                                        </div>
                                        <div style={{ marginTop: '0.3rem' }}>{msg.message}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
