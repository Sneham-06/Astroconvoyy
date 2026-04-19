'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function ConflictsPage() {
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [convoys, setConvoys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [conflictsRes, convoysRes] = await Promise.all([
                fetch(`${API_URL}/api/conflicts/check`, { method: 'POST' }),
                fetch(`${API_URL}/api/convoy/list`)
            ]);

            const [conflictsData, convoysData] = await Promise.all([
                conflictsRes.json(),
                convoysRes.json()
            ]);

            setConflicts(conflictsData.conflicts || []);
            setConvoys(convoysData.convoys || []);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    return (
        <>
            <Navigation />

            <div className="container">
                <div className="flex-between mb-2">
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M3 3h6l3 9h6l3-9"/>
                                <path d="M12 12v9"/>
                                <path d="M9 21h6"/>
                            </svg>
                            Convoy Scheduling &amp; Conflict Avoidance
                        </h1>
                        <p style={{ color: '#a0a0a0' }}>
                            Detect and resolve route conflicts for optimal convoy coordination
                        </p>
                    </div>
                    <div className={`badge ${conflicts.length > 0 ? 'badge-warning' : 'badge-low'}`} style={{ fontSize: '1.2rem', padding: '1rem 1.5rem' }}>
                        {conflicts.length} {conflicts.length === 1 ? 'CONFLICT' : 'CONFLICTS'}
                    </div>
                </div>

                {/* Conflict Stats */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-box">
                        <div className="stat-label">Active Convoys</div>
                        <div className="stat-value">{convoys.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Route Conflicts</div>
                        <div className="stat-value" style={{ color: '#ff6b35' }}>{conflicts.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Resolved Today</div>
                        <div className="stat-value" style={{ color: '#00ff88' }}>12</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Efficiency</div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>94%</div>
                    </div>
                </div>

                {/* Detected Conflicts */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">⚠️ Detected Route Conflicts</h2>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner"></div>
                            </div>
                        ) : conflicts.length === 0 ? (
                            <div className="text-center" style={{ padding: '3rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                                <h3 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>No Conflicts Detected</h3>
                                <p style={{ color: '#a0a0a0' }}>
                                    All convoy routes are optimally scheduled with no overlapping critical points
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-1">
                                {conflicts.map((conflict, index) => (
                                    <div
                                        key={index}
                                        className="card"
                                        style={{
                                            borderLeft: '5px solid #ff6b35',
                                            background: 'rgba(255, 107, 53, 0.05)'
                                        }}
                                    >
                                        <div className="card-header">
                                            <h3 className="card-title" style={{ fontSize: '1rem' }}>
                                                Conflict #{index + 1}
                                            </h3>
                                            <span className={`badge ${conflict.severity === 'high' ? 'badge-critical' :
                                                conflict.severity === 'medium' ? 'badge-warning' : 'badge-low'
                                                }`}>
                                                {conflict.severity?.toUpperCase() || 'MEDIUM'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.3rem' }}>
                                                        Convoy 1
                                                    </div>
                                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                        {conflict.convoy1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.3rem' }}>
                                                        Convoy 2
                                                    </div>
                                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                        {conflict.convoy2}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-warning">
                                                <div>
                                                    <strong>Conflict Point:</strong> {conflict.conflict_point}
                                                </div>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <strong>Recommendation:</strong> {conflict.recommendation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* All Convoy Schedules */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">📅 Current Convoy Schedules</h2>
                    </div>
                    <div className="card-body">
                        {convoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No active convoys scheduled
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Convoy Name</th>
                                            <th>Route</th>
                                            <th>Mission</th>
                                            <th>Priority</th>
                                            <th>ETA</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {convoys.map((convoy) => (
                                            <tr key={convoy.id}>
                                                <td style={{ fontWeight: 600 }}>
                                                    {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                                </td>
                                                <td style={{ fontSize: '0.9rem' }}>
                                                    {convoy.start_point} → {convoy.destination}
                                                </td>
                                                <td>
                                                    <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                                                        {convoy.mission_type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${convoy.priority_score >= 9 ? 'badge-critical' :
                                                        convoy.priority_score >= 7 ? 'badge-high' :
                                                            convoy.priority_score >= 5 ? 'badge-medium' : 'badge-low'
                                                        }`} style={{ fontSize: '0.75rem' }}>
                                                        P{convoy.priority_score}
                                                    </span>
                                                </td>
                                                <td>{convoy.eta}</td>
                                                <td>
                                                    <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                                                        {convoy.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conflict Detection Algorithm */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">🧠 Conflict Detection & Resolution</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '1rem' }}>
                                    Detection Criteria
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#d0d0d0', lineHeight: '1.8' }}>
                                    <li><strong>Same Destination:</strong> Multiple convoys heading to same location</li>
                                    <li><strong>Overlapping Routes:</strong> Shared waypoints or checkpoints</li>
                                    <li><strong>Critical Chokepoints:</strong> Narrow roads, bridges, tunnels</li>
                                    <li><strong>Time Windows:</strong> ETAs within 30-minute window</li>
                                    <li><strong>Resource Constraints:</strong> Limited checkpoint capacity</li>
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '1rem' }}>
                                    Resolution Strategies
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#d0d0d0', lineHeight: '1.8' }}>
                                    <li><strong>Time Adjustment:</strong> Delay lower-priority convoy by 30+ minutes</li>
                                    <li><strong>Route Rerouting:</strong> Use backup routes for one convoy</li>
                                    <li><strong>Priority Override:</strong> Higher priority gets right of way</li>
                                    <li><strong>Speed Optimization:</strong> Adjust convoy speeds to avoid overlap</li>
                                    <li><strong>Manual Override:</strong> Command center final decision</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(61, 122, 92, 0.1)', borderRadius: '8px', border: '1px solid rgba(61, 122, 92, 0.3)' }}>
                            <h4 style={{ color: '#3d7a5c', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                📊 System Performance
                            </h4>
                            <div className="grid grid-3" style={{ marginTop: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Conflicts Prevented (Today)</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>37</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Avg Resolution Time</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ddff' }}>2.3min</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Success Rate</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d4af37' }}>98.5%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
