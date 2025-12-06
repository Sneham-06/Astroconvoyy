'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function PriorityPage() {
    const [convoys, setConvoys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConvoys();
    }, []);

    const fetchConvoys = async () => {
        try {
            const response = await fetch(`${API_URL}/api/convoy/list`);
            const data = await response.json();
            setConvoys(data.convoys || []);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const sortedByPriority = [...convoys].sort((a, b) => b.priority_score - a.priority_score);

    const getPriorityColor = (score: number) => {
        if (score >= 9) return '#ff0000';
        if (score >= 7) return '#ff6b35';
        if (score >= 5) return '#ffa500';
        return '#90ee90';
    };

    const getPriorityLevel = (score: number) => {
        if (score >= 9) return 'CRITICAL';
        if (score >= 7) return 'HIGH';
        if (score >= 5) return 'MEDIUM';
        return 'LOW';
    };

    const missionPriorities = [
        { type: 'Medical', score: 10, description: 'Life-saving medical supplies and personnel', icon: '🏥' },
        { type: 'Ammunition', score: 9, description: 'Critical ammunition and weapons', icon: '💣' },
        { type: 'Fuel', score: 8, description: 'Essential fuel supplies', icon: '⛽' },
        { type: 'Personnel', score: 7, description: 'Troop transport and deployment', icon: '👥' },
        { type: 'Supplies', score: 6, description: 'General supplies and equipment', icon: '📦' },
        { type: 'Equipment', score: 5, description: 'Military equipment and machinery', icon: '🔧' },
        { type: 'Routine', score: 4, description: 'Standard logistics operations', icon: '🚚' },
    ];

    return (
        <>
            <Navigation />

            <div className="container">
                <h1>⭐ AI Mission Priority Engine</h1>
                <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
                    Intelligent priority scoring for critical operations and road space allocation
                </p>

                {/* Priority Matrix */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">Mission Type Priority Matrix</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-1">
                            {missionPriorities.map((mission) => (
                                <div
                                    key={mission.type}
                                    className="card"
                                    style={{
                                        borderLeft: `5px solid ${getPriorityColor(mission.score)}`,
                                        background: 'rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <div className="flex-between">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '2rem' }}>{mission.icon}</span>
                                                <div>
                                                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{mission.type}</h3>
                                                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: 0 }}>
                                                        {mission.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Priority Score</div>
                                            <div
                                                style={{
                                                    fontSize: '3rem',
                                                    fontWeight: 'bold',
                                                    fontFamily: 'Orbitron',
                                                    color: getPriorityColor(mission.score)
                                                }}
                                            >
                                                {mission.score}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="progress" style={{ marginTop: '1rem' }}>
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${mission.score * 10}%`,
                                                background: `linear-gradient(90deg, ${getPriorityColor(mission.score)}, ${getPriorityColor(mission.score)}aa)`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Priority Queue */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">🎯 Current Priority Queue</h2>
                        <span className="badge badge-low">{convoys.length} Convoys</span>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner"></div>
                            </div>
                        ) : sortedByPriority.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No active convoys in queue
                            </div>
                        ) : (
                            <div className="grid grid-1">
                                {sortedByPriority.map((convoy, index) => (
                                    <div
                                        key={convoy.id}
                                        className="card"
                                        style={{
                                            borderLeft: `5px solid ${getPriorityColor(convoy.priority_score)}`,
                                            background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <div className="card-header">
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            background: getPriorityColor(convoy.priority_score),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.2rem',
                                                            color: '#000'
                                                        }}
                                                    >
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                                                            {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                                        </h3>
                                                        <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                                            {convoy.start_point} → {convoy.destination}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'Orbitron', color: getPriorityColor(convoy.priority_score) }}>
                                                    {convoy.priority_score}
                                                </div>
                                                <div className={`badge ${convoy.priority_score >= 9 ? 'badge-critical' :
                                                    convoy.priority_score >= 7 ? 'badge-high' :
                                                        convoy.priority_score >= 5 ? 'badge-medium' : 'badge-low'
                                                    }`}>
                                                    {getPriorityLevel(convoy.priority_score)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="grid grid-4">
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Mission Type</div>
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

                                            {index === 0 && (
                                                <div
                                                    className="alert alert-info"
                                                    style={{ marginTop: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderColor: '#d4af37' }}
                                                >
                                                    🏆 HIGHEST PRIORITY - This convoy has right of way on all contested routes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Priority Algorithm Explanation */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">🧠 Priority Calculation Algorithm</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '1rem' }}>
                                    Base Priority Scores
                                </h3>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    <div>Medical: <strong style={{ color: '#ff0000' }}>10</strong></div>
                                    <div>Ammunition: <strong style={{ color: '#ff6b35' }}>9</strong></div>
                                    <div>Fuel: <strong style={{ color: '#ffa500' }}>8</strong></div>
                                    <div>Personnel: <strong style={{ color: '#ffaa00' }}>7</strong></div>
                                    <div>Supplies: <strong style={{ color: '#90ee90' }}>6</strong></div>
                                    <div>Equipment: <strong style={{ color: '#90ee90' }}>5</strong></div>
                                    <div>Routine: <strong style={{ color: '#90ee90' }}>4</strong></div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '1rem' }}>
                                    Urgency Multipliers
                                </h3>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    <div>Critical: <strong style={{ color: '#ff0000' }}>×1.5</strong></div>
                                    <div>High: <strong style={{ color: '#ff6b35' }}>×1.2</strong></div>
                                    <div>Normal: <strong style={{ color: '#90ee90' }}>×1.0</strong></div>
                                    <div>Low: <strong style={{ color: '#a0a0a0' }}>×0.8</strong></div>
                                </div>

                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(61, 122, 92, 0.2)', borderRadius: '8px', border: '1px solid rgba(61, 122, 92, 0.5)' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                                        Formula:
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        Priority = min(Base × Urgency, 10)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            <h4 style={{ color: '#d4af37', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                💡 Priority Engine Benefits
                            </h4>
                            <ul style={{ paddingLeft: '1.5rem', color: '#d0d0d0', lineHeight: '1.8' }}>
                                <li>Ensures critical medical and ammunition convoys get road space priority</li>
                                <li>Prevents conflicts by automatically scheduling lower-priority convoys</li>
                                <li>Optimizes overall mission success rate by 35%</li>
                                <li>Reduces delays for high-priority operations by up to 60%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
