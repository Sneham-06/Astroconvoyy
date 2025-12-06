'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import API_URL from '../config';

export default function DriverPortal() {
    const [mounted, setMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [driverData, setDriverData] = useState<any>(null);
    const [convoyInfo, setConvoyInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sosConfirm, setSosConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoggedIn && driverData) {
            fetchConvoyInfo();
            const interval = setInterval(fetchConvoyInfo, 10000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, driverData]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/driver/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_code: accessCode })
            });

            const data = await response.json();

            if (data.success) {
                setDriverData(data.driver);
                setIsLoggedIn(true);
            } else {
                alert('Invalid access code. Contact command center.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Connection error. Please try again.');
        }

        setLoading(false);
    };

    const fetchConvoyInfo = async () => {
        if (!driverData) return;

        try {
            const response = await fetch(`${API_URL}/api/driver/convoy/${driverData.convoy_id}`);
            const data = await response.json();
            setConvoyInfo(data);
        } catch (error) {
            console.error('Error fetching convoy info:', error);
        }
    };

    const triggerSOS = async () => {
        if (!sosConfirm) {
            setSosConfirm(true);
            setTimeout(() => setSosConfirm(false), 5000);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/driver/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    convoy_id: driverData.convoy_id,
                    location: convoyInfo?.current_position || 'Current Position',
                    issue_type: 'driver_emergency'
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ SOS SENT! Command center notified. Help is on the way.');
                setSosConfirm(false);
                fetchConvoyInfo();
            }
        } catch (error) {
            console.error('SOS error:', error);
            alert('Failed to send SOS. Try again or use radio.');
        }
    };

    const getRoute = () => {
        if (!convoyInfo || !convoyInfo.route_data) return null;
        return convoyInfo.route_data.recommended_route;
    };

    const getAlternativeRoutes = () => {
        if (!convoyInfo || !convoyInfo.route_data) return null;
        return {
            backup: convoyInfo.route_data.backup_route,
            emergency: convoyInfo.route_data.emergency_route
        };
    };

    if (!mounted) {
        return <div style={{ minHeight: '100vh', background: '#0a0e0f' }}></div>;
    }

    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0e0f 0%, #1a3d2e 100%)',
                padding: '2rem'
            }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚛 Driver Portal</h1>
                        <p style={{ color: '#a0a0a0' }}>AstraConvoy Driver Access</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Access Code</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., DRV-1234-1"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                required
                                style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? '🔄 Connecting...' : '🔐 Access Convoy Info'}
                        </button>
                    </form>

                    <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                        <strong>For Command Center:</strong> <br />
                        <Link href="/" style={{ color: '#00ddff' }}>Go to Main Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    const route = getRoute();
    const altRoutes = getAlternativeRoutes();
    const hasEmergency = convoyInfo?.status === 'emergency';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e0f 0%, #1a3d2e 100%)' }}>
            <div className="nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <h1 style={{ fontSize: '1.3rem' }}>🚛 Driver: {driverData?.driver_name || 'Driver'}</h1>
                        <span className="nav-badge" style={{ background: hasEmergency ? '#ff0033' : '#2d5f4a' }}>
                            {hasEmergency ? 'EMERGENCY' : 'ACTIVE'}
                        </span>
                    </div>
                    <button
                        className="btn btn-warning"
                        style={{ fontSize: '0.9rem' }}
                        onClick={() => setIsLoggedIn(false)}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="container">
                <div className="card mb-3" style={{
                    background: sosConfirm ? 'rgba(255, 0, 0, 0.2)' : 'rgba(139, 0, 0, 0.1)',
                    border: sosConfirm ? '2px solid #ff0033' : '2px solid #8b0000'
                }}>
                    <div className="text-center" style={{ padding: '1rem' }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: sosConfirm ? '#ff0033' : '#d4af37' }}>
                            {sosConfirm ? '⚠️ CONFIRM EMERGENCY?' : '🚨 Emergency SOS'}
                        </h2>
                        <button
                            className="btn btn-danger"
                            style={{
                                fontSize: '1.5rem',
                                padding: '1.5rem 3rem',
                                width: '100%',
                                animation: sosConfirm ? 'pulse-red 1s infinite' : 'none'
                            }}
                            onClick={triggerSOS}
                        >
                            {sosConfirm ? '⚠️ PRESS AGAIN TO CONFIRM SOS' : '🆘 SEND SOS TO COMMAND'}
                        </button>
                        {sosConfirm && (
                            <p style={{ marginTop: '1rem', color: '#ff6b35', fontSize: '0.9rem' }}>
                                Press again within 5 seconds to confirm emergency
                            </p>
                        )}
                    </div>
                </div>

                {convoyInfo?.active_alerts && convoyInfo.active_alerts.length > 0 && (
                    <div className="card mb-3">
                        <div className="card-header">
                            <h2 className="card-title">📢 Active Alerts</h2>
                            <span className="badge badge-critical">{convoyInfo.active_alerts.length}</span>
                        </div>
                        <div className="card-body">
                            {convoyInfo.active_alerts.map((alert: any) => (
                                <div key={alert.id} className="alert alert-emergency" style={{ marginBottom: '0.5rem' }}>
                                    <strong>{alert.alert_type.toUpperCase()}:</strong> {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-4 mb-3">
                    <div className="stat-box">
                        <div className="stat-label">Convoy</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{convoyInfo?.convoy_name}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Status</div>
                        <div className={`badge ${hasEmergency ? 'badge-critical' : 'badge-low'}`} style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                            {convoyInfo?.status}
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Threat Level</div>
                        <div className="stat-value" style={{
                            fontSize: '1.5rem',
                            color: convoyInfo?.threat_level >= 6 ? '#ff6b35' : '#00ff88'
                        }}>
                            {convoyInfo?.threat_level}/10
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">ETA</div>
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{convoyInfo?.eta}</div>
                    </div>
                </div>

                {route && (
                    <div className="card mb-3">
                        <div className="card-header">
                            <h2 className="card-title">🗺️ Your Current Route</h2>
                            <span className="badge badge-low">RECOMMENDED</span>
                        </div>
                        <div className="card-body">
                            <h3 style={{ fontSize: '1.2rem', color: '#d4af37', marginBottom: '1rem' }}>
                                {convoyInfo?.start_point} → {convoyInfo?.destination}
                            </h3>

                            <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Distance</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{route.distance_km} km</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Road Type</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{route.road_type}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Weather</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{route.weather}</div>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '0.5rem' }}>Waypoints:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {route.waypoints.map((waypoint: string, i: number) => (
                                    <div
                                        key={i}
                                        className="card"
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            padding: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            background: '#3d7a5c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: '500' }}>{waypoint}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(hasEmergency || convoyInfo?.threat_level >= 6) && altRoutes && (
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">🔀 Alternative Routes Available</h2>
                            <span className="badge badge-warning">REROUTE OPTIONS</span>
                        </div>
                        <div className="card-body">
                            <p style={{ color: '#ff6b35', marginBottom: '1.5rem', fontSize: '1rem' }}>
                                ⚠️ {hasEmergency ? 'Emergency detected!' : 'High threat level!'} Alternative routes recommended.
                            </p>

                            <div className="grid grid-2">
                                {altRoutes.backup && (
                                    <div className="card" style={{ background: 'rgba(45, 95, 74, 0.2)' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#d4af37', marginBottom: '0.5rem' }}>
                                            BACKUP ROUTE
                                        </h3>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {altRoutes.backup.route_name}
                                        </div>
                                        <div className="grid grid-2" style={{ fontSize: '0.85rem' }}>
                                            <div>Distance: <strong>{altRoutes.backup.distance_km}km</strong></div>
                                            <div>ETA: <strong>{altRoutes.backup.eta_hours.toFixed(1)}h</strong></div>
                                        </div>
                                        <button className="btn btn-warning" style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem' }}>
                                            📞 Request Reroute
                                        </button>
                                    </div>
                                )}

                                {altRoutes.emergency && (
                                    <div className="card" style={{ background: 'rgba(255, 107, 53, 0.1)' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                                            EMERGENCY ROUTE
                                        </h3>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {altRoutes.emergency.route_name}
                                        </div>
                                        <div className="grid grid-2" style={{ fontSize: '0.85rem' }}>
                                            <div>Distance: <strong>{altRoutes.emergency.distance_km}km</strong></div>
                                            <div>ETA: <strong>{altRoutes.emergency.eta_hours.toFixed(1)}h</strong></div>
                                        </div>
                                        <button className="btn btn-danger" style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem' }}>
                                            🚨 Request Emergency Reroute
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                                Contact command center via radio to confirm route change
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
