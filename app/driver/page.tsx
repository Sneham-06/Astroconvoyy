'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import API_URL from '../config';
import TacticalMap from '../components/TacticalMap';

export default function DriverDashboard() {
    const [mounted, setMounted] = useState(false);
    const [driverData, setDriverData] = useState<any>(null);
    const [convoyInfo, setConvoyInfo] = useState<any>(null);
    const [myConvoys, setMyConvoys] = useState<any[]>([]);
    const [sosConfirm, setSosConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
        const role = localStorage.getItem('userRole');
        const data = localStorage.getItem('driverData');
        
        if (role !== 'driver' || !data) {
            window.location.href = '/login';
            return;
        }
        
        setDriverData(JSON.parse(data));
    }, []);

    const [messages, setMessages] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [lastMsgCount, setLastMsgCount] = useState(0);

    useEffect(() => {
        if (messages.length > lastMsgCount && lastMsgCount > 0) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
        setLastMsgCount(messages.length);
    }, [messages, lastMsgCount]);

    // NOTE: useEffects moved below function definitions to avoid 'called before defined' error


    const fetchConvoyInfo = async () => {
        try {
            const res = await fetch(`${API_URL}/api/driver/convoy/${driverData.convoy_id}`);
            if (!res.ok) return;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                setConvoyInfo(data);
                
                // CRITICAL: If the server gave us a real ID (e.g. 2) and we are using a temp ID (e.g. 1776...), 
                // update our identity so HQ can find us!
                if (data.id && String(data.id) !== String(driverData.convoy_id)) {
                    console.log(`📡 [AUTO-SYNC] Updating Unit ID: ${driverData.convoy_id} -> ${data.id}`);
                    const newData = { ...driverData, convoy_id: data.id };
                    setDriverData(newData);
                    localStorage.setItem('driverData', JSON.stringify(newData));
                    // No page reload needed, state will handle it
                }
            }
        } catch (e) {}
    };

    const fetchMessages = async () => {
        // ALWAYS use the real DB ID from convoyInfo — never the stale localStorage ID
        const realId = convoyInfo?.id || driverData?.convoy_id;
        if (!realId) return;
        
        console.log(`[TACTICAL LINK] Polling with Real DB ID: ${realId}`);

        try {
            const res = await fetch(`${API_URL}/api/messages/get/${realId}`);
            if (!res.ok) return;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (data.success) setMessages(data.messages);
            }
        } catch (e) {}
    };

    const fetchMyConvoys = async () => {
        if (!driverData?.call_sign) return;
        try {
            const res = await fetch(`${API_URL}/api/driver/my-convoys?call_sign=${encodeURIComponent(driverData.call_sign)}`);
            const data = await res.json();
            if (data.convoys) setMyConvoys(data.convoys);
        } catch (e) {}
    };

    const switchConvoy = (convoy: any) => {
        const newData = { ...driverData, convoy_id: convoy.id };
        setDriverData(newData);
        setConvoyInfo(convoy);
        localStorage.setItem('driverData', JSON.stringify(newData));
    };

    // Step 1: When driverData loads, fetch convoy info + all driver's convoys
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (driverData?.convoy_id) {
            fetchConvoyInfo();
            fetchMyConvoys();
        }
    }, [driverData]);

    // Step 2: Once we have convoyInfo (with real DB ID), start polling messages
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (convoyInfo?.id) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 4000);
            return () => clearInterval(interval);
        }
    }, [convoyInfo]);

    const sendReportToHQ = async (message: string) => {
        if (!driverData?.convoy_id) return;
        try {
            await fetch(`${API_URL}/api/driver/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: driverData.convoy_id,
                    message: message
                })
            });
            alert('REPORT TRANSMITTED TO HQ');
        } catch (e) { alert('Transmission failed'); }
    };

    const triggerSOS = async () => {
        if (!sosConfirm) {
            setSosConfirm(true);
            setTimeout(() => setSosConfirm(false), 5000);
            return;
        }
        try {
            await fetch(`${API_URL}/api/driver/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: driverData.convoy_id,
                    location: convoyInfo?.current_position || 'Field',
                    issue_type: 'driver_emergency'
                })
            });
            alert('🚨 SOS ALERT SENT TO COMMAND');
            setSosConfirm(false);
            fetchConvoyInfo();
        } catch (e) {}
    };

    if (!mounted || !driverData) return <div style={{ minHeight: '100vh', background: '#0a0e0f' }}></div>;

    const route = convoyInfo?.route_data?.recommended_route;
    const hasEmergency = convoyInfo?.status === 'emergency';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e0f 0%, #1a3d2e 100%)' }}>
            <Navigation />
            <div className="container" style={{ position: 'relative' }}>
                {/* INCOMING HQ TOAST */}
                {showToast && (
                    <div style={{ 
                        position: 'fixed', 
                        top: '20px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        zIndex: 9999,
                        background: 'var(--military-gold)',
                        color: 'black',
                        padding: '1rem 2rem',
                        borderRadius: '4px',
                        boxShadow: '0 0 30px rgba(212,175,55,0.5)',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        animation: 'slideDown 0.4s ease forwards'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🛰️</span>
                        <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>INCOMING HQ INSTRUCTION</div>
                            <div style={{ fontSize: '1rem' }}>{messages[messages.length-1]?.content}</div>
                        </div>
                    </div>
                )}

                <div className="flex-between mb-3" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h1>🚛 MISSION DASHBOARD</h1>
                        <p style={{ color: 'var(--military-gold)' }}>CONVOY IDENTIFIER: {convoyInfo?.convoy_name || 'LOADING...'}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                        localStorage.removeItem('driverData'); // Only remove mission data, keep role
                        window.location.href = '/login?mode=entry'; // Redirect directly to entry form
                    }} style={{ padding: '0.8rem 1.5rem', fontWeight: 'bold' }}>
                        🚀 START NEW MISSION
                    </button>
                </div>

                {/* Tactical Map Visualization */}
                {convoyInfo && (
                    <div className="mb-3">
                        <TacticalMap 
                            startPoint={convoyInfo.start_point} 
                            destination={convoyInfo.destination} 
                        />
                    </div>
                )}

                {/* My Convoys Switcher */}
                {myConvoys.length > 0 && (
                    <div className="card mb-3" style={{ 
                        background: 'rgba(212, 175, 55, 0.05)', 
                        border: '1px solid var(--military-gold)',
                        boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
                    }}>
                        <div className="card-header" style={{ 
                            padding: '0.8rem 1.2rem', 
                            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>📋</span>
                            <h3 style={{ fontSize: '1rem', color: 'var(--military-gold)', margin: 0, letterSpacing: '1px' }}>
                                ACTIVE DEPLOYMENTS ({myConvoys.length})
                            </h3>
                        </div>
                        <div className="card-body" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {myConvoys.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => switchConvoy(c)}
                                    className="glass-premium"
                                    style={{
                                        padding: '0.7rem 1.2rem',
                                        borderRadius: '6px',
                                        border: `1px solid ${convoyInfo?.id === c.id ? 'var(--military-gold)' : 'rgba(255,255,255,0.1)'}`,
                                        background: convoyInfo?.id === c.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)',
                                        color: convoyInfo?.id === c.id ? 'var(--military-gold)' : '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        minWidth: '180px',
                                        textAlign: 'left',
                                        transition: 'all 0.3s ease',
                                        boxShadow: convoyInfo?.id === c.id ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{c.convoy_name}</span>
                                        {convoyInfo?.id === c.id && <span style={{ fontSize: '0.8rem' }}>● LIVE</span>}
                                    </div>
                                    <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                                        {c.start_point} → {c.destination}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card mb-2 text-center" style={{ background: sosConfirm ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <button className="btn btn-danger" style={{ width: '100%', padding: '2rem', fontSize: '1.5rem' }} onClick={triggerSOS}>
                        {sosConfirm ? '⚠️ CONFIRM SOS' : '🆘 SEND EMERGENCY SOS'}
                    </button>
                    {sosConfirm && <p className="mt-1" style={{ color: 'red' }}>Tap again to confirm emergency signal</p>}
                </div>

                <div className="grid grid-4 mb-2">
                    <div className="stat-box"><div className="stat-label">Convoy</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>{convoyInfo?.convoy_name || '...'}</div></div>
                    <div className="stat-box"><div className="stat-label">Threat</div><div className="stat-value" style={{ fontSize: '1.5rem', color: convoyInfo?.threat_level > 5 ? 'red' : 'green' }}>{convoyInfo?.threat_level || 0}/10</div></div>
                    <div className="stat-box"><div className="stat-label">ETA</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>{convoyInfo?.eta || '--'}</div></div>
                    <div className="stat-box"><div className="stat-label">Status</div><div className="badge badge-low">{convoyInfo?.status || 'Active'}</div></div>
                </div>

                {/* Report to Command */}
                <div className="card mb-2" style={{ borderLeft: '6px solid var(--military-green-accent)', background: 'rgba(61, 122, 92, 0.1)' }}>
                    <div className="card-header" style={{ padding: '0.6rem 1rem' }}>
                        <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--military-green-accent)', fontWeight: 'bold' }}>📡 REPORT TO COMMAND (HQ)</h2>
                    </div>
                    <div className="card-body" style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="text" 
                                id="report-input"
                                className="form-input" 
                                placeholder="Type situational report..." 
                                style={{ flex: 1 }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.currentTarget as HTMLInputElement;
                                        if (input.value) {
                                            sendReportToHQ(input.value);
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                            <button 
                                className="btn btn-primary" 
                                style={{ background: 'var(--military-green-accent)', border: 'none' }}
                                onClick={() => {
                                    const input = document.getElementById('report-input') as HTMLInputElement;
                                    if (input.value) {
                                        sendReportToHQ(input.value);
                                        input.value = '';
                                    }
                                }}
                            >
                                TRANSMIT
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Messages */}
                <div className="card mb-2" style={{ borderLeft: '6px solid var(--military-gold)', background: 'rgba(212, 175, 55, 0.08)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}>
                    <div className="card-header" style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--military-gold)', fontWeight: 'bold' }}>📩 COMMAND INSTRUCTIONS</h2>
                            <span style={{ fontSize: '0.6rem', color: '#00ff00', background: 'rgba(0,255,0,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>📡 LINK ACTIVE</span>
                            <button 
                                onClick={() => { fetchConvoyInfo(); fetchMessages(); }}
                                style={{ background: 'none', border: '1px solid var(--military-gold)', color: 'var(--military-gold)', fontSize: '0.6rem', padding: '0.2rem 0.5rem', cursor: 'pointer', borderRadius: '4px' }}
                            >
                                🔄 FORCE SYNC
                            </button>
                        </div>
                        {messages.length > 0 && <span className="badge badge-critical" style={{ animation: 'pulse 1s infinite' }}>NEW ORDERS</span>}
                    </div>
                    <div className="card-body" style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.8rem 1.2rem' }}>
                        {messages.length === 0 ? (
                            <div className="text-center" style={{ padding: '1.5rem', opacity: 0.6, border: '1px dashed rgba(212,175,55,0.2)', borderRadius: '8px' }}>
                                <div className="spinner-small" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--military-gold)' }}>📡 <b>SECURE CHANNEL SCANNING...</b></p>
                                <p style={{ fontSize: '0.7rem' }}>Standing by for mission-critical data from HQ Command.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[...messages].reverse().map((m, i) => (
                                    <div key={i} className="message-received" style={{ 
                                        background: 'rgba(212, 175, 55, 0.15)', 
                                        borderLeft: '4px solid var(--military-gold)',
                                        padding: '1rem',
                                        borderRadius: '0 8px 8px 0',
                                        animation: i === 0 ? 'slideIn 0.3s ease-out' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--military-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>📡 FROM: HQ COMMAND</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>TIME: {m.timestamp}</span>
                                        </div>
                                        <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500', lineHeight: '1.4', margin: 0 }}>{m.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {route && (
                    <div className="card">
                        <div className="card-header"><h2 className="card-title">🗺️ MISSION ROUTE</h2></div>
                        <div className="card-body">
                            <p className="mb-1"><strong>{convoyInfo.start_point} → {convoyInfo.destination}</strong></p>
                            <div className="grid grid-3 mb-2">
                                <div><small>Distance</small><br/>{route.distance_km}km</div>
                                <div><small>Road Type</small><br/>{route.road_type}</div>
                                <div><small>Weather</small><br/>{route.weather}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {route.waypoints.map((w: string, i: number) => (
                                    <div key={i} className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem' }}>{i + 1}. {w}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
