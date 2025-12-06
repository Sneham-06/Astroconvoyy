'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function Dashboard() {
    const [convoys, setConvoys] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [v2vMessages, setV2vMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [convoysRes, alertsRes, statsRes, v2vRes] = await Promise.all([
                fetch(`${API_URL}/api/convoy/list`),
                fetch(`${API_URL}/api/alerts`),
                fetch(`${API_URL}/api/analytics/dashboard`),
                fetch(`${API_URL}/api/v2v/messages`)
            ]);

            const [convoysData, alertsData, statsData, v2vData] = await Promise.all([
                convoysRes.json(),
                alertsRes.json(),
                statsRes.json(),
                v2vRes.json()
            ]);

            setConvoys(convoysData.convoys || []);
            setAlerts(alertsData.alerts || []);
            setStats(statsData);
            setV2vMessages(v2vData.messages || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const getThreatBadge = (level: number) => {
        if (level >= 8) return <span className="badge badge-critical">CRITICAL</span>;
        if (level >= 6) return <span className="badge badge-high">HIGH</span>;
        if (level >= 4) return <span className="badge badge-medium">MODERATE</span>;
        if (level >= 2) return <span className="badge badge-low">LOW</span>;
        return <span className="badge badge-minimal">MINIMAL</span>;
    };

    const getPriorityBadge = (score: number) => {
        if (score >= 9) return <span className="badge badge-critical">CRITICAL</span>;
        if (score >= 7) return <span className="badge badge-high">HIGH</span>;
        if (score >= 5) return <span className="badge badge-medium">MEDIUM</span>;
        return <span className="badge badge-low">LOW</span>;
    };

    const triggerEmergency = async (convoyId: number, type: string) => {
        if (!confirm(`Trigger ${type} emergency for convoy ${convoyId}?`)) return;

        try {
            await fetch(`${API_URL}/api/emergency/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ convoy_id: convoyId, type })
            });

            fetchData(); // Refresh data
            alert(`Emergency SOS triggered for convoy ${convoyId}`);
        } catch (error) {
            console.error('Error triggering emergency:', error);
        }
    };

    const sendV2VMessage = async (fromId: number) => {
        const message = prompt('Enter V2V message:');
        if (!message) return;

        try {
            await fetch(`${API_URL}/api/v2v/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from_convoy_id: fromId,
                    to_convoy_id: null,
                    message
                })
            });

            fetchData();
            alert('V2V message broadcast sent');
        } catch (error) {
            console.error('Error sending V2V message:', error);
        }
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
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
                        <h1>📊 Real-Time Monitoring Dashboard</h1>
                        <p style={{ color: '#a0a0a0' }}>Live convoy tracking and threat intelligence</p>
                    </div>
                    <div className="badge badge-low" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }}>
                        🟢 {stats.system_status?.toUpperCase() || 'OPERATIONAL'}
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-box">
                        <div className="stat-label">Active Convoys</div>
                        <div className="stat-value">{stats.total_active_convoys || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">High Threat</div>
                        <div className="stat-value" style={{ color: '#ff6b35' }}>
                            {stats.high_threat_convoys || 0}
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Active Emergencies</div>
                        <div className="stat-value" style={{ color: '#ff0033' }}>
                            {stats.active_emergencies || 0}
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Avg Threat Level</div>
                        <div className="stat-value">{stats.average_threat_level || 0}/10</div>
                    </div>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="card mb-3">
                        <div className="card-header">
                            <h2 className="card-title">🚨 Active Alerts</h2>
                            <span className="badge badge-critical">{alerts.length} ALERT{alerts.length > 1 ? 'S' : ''}</span>
                        </div>
                        <div className="card-body">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`alert ${alert.severity === 'critical' ? 'alert-emergency' : 'alert-warning'}`}
                                >
                                    <div>
                                        <strong>{alert.convoy_name || `Convoy #${alert.convoy_id}`}</strong> - {alert.alert_type.toUpperCase()}
                                        <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', opacity: 0.9 }}>
                                            {alert.message}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.7 }}>
                                            {new Date(alert.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Convoys List */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">🚛 Active Convoys</h2>
                    </div>
                    <div className="card-body">
                        {convoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No active convoys. Create one to get started!
                            </div>
                        ) : (
                            <div className="grid grid-1">
                                {convoys.map((convoy) => (
                                    <div key={convoy.id} className="card" style={{ marginBottom: '1rem' }}>
                                        <div className="card-header">
                                            <div>
                                                <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                                                    {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                                </h3>
                                                <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                                    {convoy.start_point} → {convoy.destination}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {getThreatBadge(convoy.threat_level)}
                                                {getPriorityBadge(convoy.priority_score)}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Mission</div>
                                                    <div style={{ fontWeight: 600 }}>{convoy.mission_type}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Vehicles</div>
                                                    <div style={{ fontWeight: 600 }}>{convoy.num_vehicles}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Load</div>
                                                    <div style={{ fontWeight: 600 }}>{convoy.load_weight}T</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>ETA</div>
                                                    <div style={{ fontWeight: 600 }}>{convoy.eta}</div>
                                                </div>
                                            </div>

                                            {/* Threat Level Indicator */}
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>
                                                    Threat Level: {convoy.threat_level}/10
                                                </div>
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${convoy.threat_level * 10}%`,
                                                            background: convoy.threat_level >= 6
                                                                ? 'linear-gradient(90deg, #ff0000, #ff6b35)'
                                                                : 'linear-gradient(90deg, #2d5f4a, #3d7a5c)'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                    onClick={() => triggerEmergency(convoy.id, 'breakdown')}
                                                >
                                                    🚨 Emergency SOS
                                                </button>
                                                <button
                                                    className="btn btn-warning"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                    onClick={() => sendV2VMessage(convoy.id)}
                                                >
                                                    📡 Send V2V Message
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                    onClick={() => window.location.href = `/convoy/${convoy.id}`}
                                                >
                                                    📍 Track Live
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* V2V Messages */}
                {v2vMessages.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📡 V2V Communication Feed</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {v2vMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="alert alert-info"
                                        style={{ marginBottom: '0.5rem', animation: 'slideIn 0.3s ease' }}
                                    >
                                        <div>
                                            <strong>{msg.from_convoy_name}</strong>
                                            {msg.to_convoy_name ? ` → ${msg.to_convoy_name}` : ' (Broadcast)'}
                                            <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                "{msg.message}"
                                            </div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', opacity: 0.7 }}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
