'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function ThreatsPage() {
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

    const sortedConvoys = [...convoys].sort((a, b) => b.threat_level - a.threat_level);

    const getThreatColor = (level: number) => {
        if (level >= 8) return '#ff0000';
        if (level >= 6) return '#ff6b35';
        if (level >= 4) return '#ffa500';
        if (level >= 2) return '#90ee90';
        return '#00ff00';
    };

    const getThreatRecommendation = (level: number) => {
        if (level >= 8) return 'CRITICAL: High danger. Immediate reroute recommended. Request armed escort.';
        if (level >= 6) return 'HIGH: Significant risk detected. Consider alternative route or delay.';
        if (level >= 4) return 'MODERATE: Monitor closely. Prepare contingency plans.';
        if (level >= 2) return 'LOW: Normal precautions advised. Proceed as planned.';
        return 'MINIMAL: Safe to proceed. Routine monitoring sufficient.';
    };

    return (
        <>
            <Navigation />

            <div className="container">
                <h1>⚠️ AI Threat & Vulnerability Analysis</h1>
                <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
                    Real-time threat prediction system with multi-factor risk assessment
                </p>

                {/* Threat Distribution */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">Threat Level Distribution</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-5">
                            {[
                                { level: 'Critical (8-10)', count: convoys.filter(c => c.threat_level >= 8).length, color: '#ff0000' },
                                { level: 'High (6-8)', count: convoys.filter(c => c.threat_level >= 6 && c.threat_level < 8).length, color: '#ff6b35' },
                                { level: 'Moderate (4-6)', count: convoys.filter(c => c.threat_level >= 4 && c.threat_level < 6).length, color: '#ffa500' },
                                { level: 'Low (2-4)', count: convoys.filter(c => c.threat_level >= 2 && c.threat_level < 4).length, color: '#90ee90' },
                                { level: 'Minimal (0-2)', count: convoys.filter(c => c.threat_level < 2).length, color: '#00ff00' },
                            ].map((item, i) => (
                                <div key={i} className="stat-box">
                                    <div className="stat-label">{item.level}</div>
                                    <div className="stat-value" style={{ color: item.color }}>{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Threat Analysis Matrix */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">Threat Assessment Matrix</h2>
                    </div>
                    <div className="card-body">
                        <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>
                            AI analyzes multiple risk factors: Terrain, Weather, Isolation, Road Condition, Historical Data, and Time of Day
                        </p>

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner"></div>
                            </div>
                        ) : sortedConvoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No convoys to analyze
                            </div>
                        ) : (
                            <div className="grid grid-1">
                                {sortedConvoys.map((convoy) => {
                                    const routeData = convoy.route_data ? JSON.parse(convoy.route_data) : null;
                                    const recommended = routeData?.recommended_route;

                                    return (
                                        <div
                                            key={convoy.id}
                                            className="card"
                                            style={{
                                                borderLeft: `5px solid ${getThreatColor(convoy.threat_level)}`,
                                                marginBottom: '1rem'
                                            }}
                                        >
                                            <div className="card-header">
                                                <div>
                                                    <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                                                        {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                                    </h3>
                                                    <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                                        {convoy.start_point} → {convoy.destination}
                                                    </div>
                                                </div>
                                                <div className="threat-indicator" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                                    <div className="threat-dot" style={{ background: getThreatColor(convoy.threat_level) }}></div>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
                                                        {convoy.threat_level}/10
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className={`alert ${convoy.threat_level >= 6 ? 'alert-emergency' : 'alert-info'}`}>
                                                    {getThreatRecommendation(convoy.threat_level)}
                                                </div>

                                                {recommended && (
                                                    <>
                                                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#3d7a5c' }}>
                                                            Risk Factors Analysis:
                                                        </h4>
                                                        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Terrain</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.terrain}
                                                                </div>
                                                            </div>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Weather</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.weather}
                                                                </div>
                                                            </div>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Traffic</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.traffic}
                                                                </div>
                                                            </div>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Road Type</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.road_type}
                                                                </div>
                                                            </div>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Distance</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.distance_km} km
                                                                </div>
                                                            </div>
                                                            <div className="card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>ETA</div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {recommended.eta_hours.toFixed(1)}h
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Threat Level Bar */}
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <div style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
                                                                Threat Intensity
                                                            </div>
                                                            <div className="progress" style={{ height: '20px' }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        width: `${convoy.threat_level * 10}%`,
                                                                        background: `linear-gradient(90deg, ${getThreatColor(convoy.threat_level)}, ${getThreatColor(convoy.threat_level)}aa)`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    {convoy.threat_level * 10}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Threat Mitigation Guide */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">🛡️ Threat Mitigation Guidelines</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div>
                                <h3 style={{ color: '#ff0000', fontSize: '1rem' }}>Critical Threats (8-10)</h3>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>Immediate reroute required</li>
                                    <li>Request armed military escort</li>
                                    <li>Delay movement until conditions improve</li>
                                    <li>24/7 satellite monitoring</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ color: '#ff6b35', fontSize: '1rem' }}>High Threats (6-8)</h3>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>Consider alternative route</li>
                                    <li>Enhanced security presence</li>
                                    <li>Frequent checkpoint updates</li>
                                    <li>Emergency response on standby</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ color: '#ffa500', fontSize: '1rem' }}>Moderate Threats (4-6)</h3>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>Standard security protocols</li>
                                    <li>Regular position reporting</li>
                                    <li>Contingency plan ready</li>
                                    <li>Weather monitoring</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ color: '#90ee90', fontSize: '1rem' }}>Low Threats (0-4)</h3>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#d0d0d0' }}>
                                    <li>Routine security measures</li>
                                    <li>Normal communication frequency</li>
                                    <li>Standard speed and procedures</li>
                                    <li>Continue as planned</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
