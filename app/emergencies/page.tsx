'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function EmergenciesPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [convoys, setConvoys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [alertsRes, convoysRes] = await Promise.all([
                fetch(`${API_URL}/api/alerts`),
                fetch(`${API_URL}/api/convoy/list`)
            ]);

            const [alertsData, convoysData] = await Promise.all([
                alertsRes.json(),
                convoysRes.json()
            ]);

            setAlerts(alertsData.alerts || []);
            setConvoys(convoysData.convoys || []);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const triggerEmergency = async (convoyId: number, type: string) => {
        try {
            const response = await fetch(`${API_URL}/api/emergency/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ convoy_id: convoyId, type })
            });

            const data = await response.json();

            fetchData();

            // Show detailed response
            let message = `✅ ${type.toUpperCase()} Emergency Triggered!\n\n`;
            message += `Actions Taken:\n`;
            data.actions_taken.forEach((action: string) => {
                message += `• ${action}\n`;
            });

            if (data.alternative_routes) {
                message += `\n🔀Alternative routes generated for rerouting.\n`;
                message += `Drivers have been notified via SMS.`;
            }

            alert(message);
        } catch (error) {
            console.error('Error:', error);
        }
    };



    const emergencyAlerts = alerts.filter(a => a.alert_type === 'emergency');
    const threatAlerts = alerts.filter(a => a.alert_type === 'threat');

    return (
        <>
            <Navigation />

            <div className="container">
                <div className="flex-between mb-2">
                    <div>
                        <h1>🚨 Emergency Detection & SOS</h1>
                        <p style={{ color: '#a0a0a0' }}>
                            Real-time emergency monitoring with automatic response system
                        </p>
                    </div>
                    <div className="badge badge-critical" style={{ fontSize: '1.2rem', padding: '1rem 1.5rem' }}>
                        {emergencyAlerts.length} ACTIVE
                    </div>
                </div>

                {/* Emergency Stats */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-box">
                        <div className="stat-label">Total Alerts</div>
                        <div className="stat-value">{alerts.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Emergencies</div>
                        <div className="stat-value" style={{ color: '#ff0033' }}>{emergencyAlerts.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Threat Alerts</div>
                        <div className="stat-value" style={{ color: '#ff6b35' }}>{threatAlerts.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Response Time</div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>&lt;5min</div>
                    </div>
                </div>

                {/* Active Emergency Alerts */}
                {emergencyAlerts.length > 0 && (
                    <div className="card mb-3">
                        <div className="card-header">
                            <h2 className="card-title">🚨 ACTIVE EMERGENCIES</h2>
                            <span className="badge badge-critical">CRITICAL</span>
                        </div>
                        <div className="card-body">
                            {emergencyAlerts.map((alert) => (
                                <div key={alert.id} className="alert alert-emergency" style={{ marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            🚨 {alert.convoy_name || `Convoy #${alert.convoy_id}`}
                                        </div>
                                        <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            {alert.message}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                            Triggered: {new Date(alert.created_at).toLocaleString()}
                                        </div>
                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span className="badge badge-critical">Emergency Response Team Dispatched</span>
                                            <span className="badge badge-high">Nearest Checkpoint Notified</span>
                                            <span className="badge badge-warning">Other Convoys Rerouted</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Threat Alerts */}
                {threatAlerts.length > 0 && (
                    <div className="card mb-3">
                        <div className="card-header">
                            <h2 className="card-title">⚠️ High Threat Alerts</h2>
                        </div>
                        <div className="card-body">
                            {threatAlerts.map((alert) => (
                                <div key={alert.id} className="alert alert-warning" style={{ marginBottom: '0.5rem' }}>
                                    <div>
                                        <strong>{alert.convoy_name || `Convoy #${alert.convoy_id}`}</strong>
                                        <div style={{ marginTop: '0.3rem' }}>{alert.message}</div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.7 }}>
                                            {new Date(alert.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Emergency Simulation Panel */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">🎮 Emergency Simulation Panel</h2>
                    </div>
                    <div className="card-body">
                        <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>
                            Simulate various emergency scenarios to test system response
                        </p>

                        {convoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No active convoys available for simulation
                            </div>
                        ) : (
                            <div className="grid grid-1">
                                {convoys.map((convoy) => (
                                    <div key={convoy.id} className="card">
                                        <div className="card-header">
                                            <h3 className="card-title" style={{ fontSize: '1rem' }}>
                                                {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                            </h3>
                                            <span className="badge badge-low">{convoy.status}</span>
                                        </div>
                                        <div className="card-body">
                                            <div style={{ marginBottom: '1rem', color: '#a0a0a0', fontSize: '0.9rem' }}>
                                                {convoy.start_point} → {convoy.destination}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                                    onClick={() => triggerEmergency(convoy.id, 'breakdown')}
                                                >
                                                    🔧 Vehicle Breakdown
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                                    onClick={() => triggerEmergency(convoy.id, 'accident')}
                                                >
                                                    💥 Accident Detected
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                                    onClick={() => triggerEmergency(convoy.id, 'attack')}
                                                >
                                                    ⚠️ Security Threat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Emergency Response Protocol */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📋 Automatic Emergency Response Protocol</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#ff0033', marginBottom: '0.5rem' }}>
                                    Detection Triggers
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>Convoy speed = 0 for &gt; 5 minutes</li>
                                    <li>Communication loss &gt; 10 minutes</li>
                                    <li>GPS deviation from route &gt; 2km</li>
                                    <li>Manual SOS button activation</li>
                                    <li>Sensor anomalies detected</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                                    Automatic Actions Taken
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>🚨 Alert command center immediately</li>
                                    <li>📍 Notify nearest military checkpoint</li>
                                    <li>🚁 Dispatch emergency response team</li>
                                    <li>🛣️ Reroute other convoys away from area</li>
                                    <li>📡 Activate satellite tracking</li>
                                    <li>🎥 Enable live video feed (if available)</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
                            <h4 style={{ color: '#ff0033', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                ⚡ Average Response Time: &lt;5 minutes
                            </h4>
                            <p style={{ color: '#d0d0d0', fontSize: '0.9rem', margin: 0 }}>
                                From emergency detection to first responder dispatch. System uses AI to predict optimal response routes and nearest available resources.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
