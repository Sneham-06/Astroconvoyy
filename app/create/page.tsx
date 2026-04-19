'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';
import { useRouter } from 'next/navigation';

export default function CreateConvoy() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (!role) {
            router.push('/login');
        }
    }, []);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        convoy_name: '',
        start_point: '',
        destination: '',
        mission_type: 'supplies',
        load_weight: '',
        num_vehicles: '',
        urgency: 'normal',
        is_night: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/convoy/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    load_weight: parseFloat(formData.load_weight),
                    num_vehicles: parseInt(formData.num_vehicles)
                })
            });

            const data = await response.json();
            setResult(data);
            setLoading(false);
        } catch (error) {
            console.error('Error creating convoy:', error);
            setLoading(false);
            alert('Error creating convoy. Make sure the backend is running.');
        }
    };

    const getThreatBadgeClass = (score: number) => {
        if (score >= 8) return 'badge-critical';
        if (score >= 6) return 'badge-high';
        if (score >= 4) return 'badge-medium';
        if (score >= 2) return 'badge-low';
        return 'badge-minimal';
    };

    const getThreatLevel = (score: number) => {
        if (score >= 8) return 'CRITICAL';
        if (score >= 6) return 'HIGH';
        if (score >= 4) return 'MODERATE';
        if (score >= 2) return 'LOW';
        return 'MINIMAL';
    };

    return (
        <>
            <Navigation />

            <div className="container">
                <h1>🚀 Create New Convoy</h1>
                <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
                    Initialize a new convoy with AI-powered route optimization and threat analysis
                </p>

                <div className="grid grid-2">
                    {/* Form Section */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Convoy Details</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Convoy Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., CONVOY-ALPHA-001"
                                        value={formData.convoy_name}
                                        onChange={(e) => setFormData({ ...formData, convoy_name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Start Point</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Delhi Cantonment"
                                        value={formData.start_point}
                                        onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Destination</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Ladakh Base"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mission Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.mission_type}
                                        onChange={(e) => setFormData({ ...formData, mission_type: e.target.value })}
                                    >
                                        <option value="medical">Medical (Priority: 10)</option>
                                        <option value="ammunition">Ammunition (Priority: 9)</option>
                                        <option value="fuel">Fuel (Priority: 8)</option>
                                        <option value="personnel">Personnel (Priority: 7)</option>
                                        <option value="supplies">Supplies (Priority: 6)</option>
                                        <option value="equipment">Equipment (Priority: 5)</option>
                                        <option value="routine">Routine (Priority: 4)</option>
                                    </select>
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Load Weight (tons)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g., 25"
                                            step="0.1"
                                            value={formData.load_weight}
                                            onChange={(e) => setFormData({ ...formData, load_weight: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Number of Vehicles</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g., 5"
                                            value={formData.num_vehicles}
                                            onChange={(e) => setFormData({ ...formData, num_vehicles: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Urgency Level</label>
                                    <select
                                        className="form-select"
                                        value={formData.urgency}
                                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                    >
                                        <option value="critical">Critical (1.5x Priority)</option>
                                        <option value="high">High (1.2x Priority)</option>
                                        <option value="normal">Normal (1.0x Priority)</option>
                                        <option value="low">Low (0.8x Priority)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_night}
                                            onChange={(e) => setFormData({ ...formData, is_night: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span className="form-label" style={{ margin: 0 }}>Night Movement (+2 Threat Points)</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    disabled={loading}
                                >
                                    {loading ? '🔄 Processing...' : '🚀 Create Convoy & Analyze'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div>
                        {loading && (
                            <div className="card text-center">
                                <div className="spinner"></div>
                                <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>
                                    Running AI Analysis...<br />
                                    Optimizing Routes • Calculating Threats • Analyzing Climate Impact
                                </p>
                            </div>
                        )}

                        {result && (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                {/* Threat Analysis */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">⚠️ Threat Analysis</h3>
                                        <span className={`badge ${getThreatBadgeClass(result.threat_analysis.threat_score)}`}>
                                            {getThreatLevel(result.threat_analysis.threat_score)}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="threat-indicator" style={{
                                            justifyContent: 'center',
                                            background: result.threat_analysis.threat_score >= 6 ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                                            marginBottom: '1rem',
                                            padding: '1.5rem'
                                        }}>
                                            <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
                                                {result.threat_analysis.threat_score}/10
                                            </div>
                                        </div>
                                        <div className={`alert ${result.threat_analysis.threat_score >= 6 ? 'alert-emergency' : 'alert-info'}`}>
                                            {result.threat_analysis.recommendation}
                                        </div>

                                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#3d7a5c' }}>Risk Factors:</h4>
                                        <div className="grid grid-2" style={{ fontSize: '0.9rem' }}>
                                            <div>Terrain: <strong>{result.threat_analysis.factors.terrain_risk}</strong></div>
                                            <div>Weather: <strong>{result.threat_analysis.factors.weather_severity}</strong></div>
                                            <div>Isolation: <strong>{result.threat_analysis.factors.isolation_level}</strong></div>
                                            <div>Road Risk: <strong>{result.threat_analysis.factors.road_risk}</strong></div>
                                            {result.threat_analysis.factors.night_risk > 0 && (
                                                <div>Night Risk: <strong>{result.threat_analysis.factors.night_risk}</strong></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Route Optimization */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">🎯 Recommended Route</h3>
                                        <span className="badge badge-low">ETA: {result.eta}</span>
                                    </div>
                                    <div className="card-body">
                                        <h4 style={{ color: '#d4af37', marginBottom: '0.5rem' }}>
                                            {result.route_optimization.recommended_route.route_name}
                                        </h4>
                                        <div className="grid grid-2" style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                                            <div>📏 Distance: <strong>{result.route_optimization.recommended_route.distance_km} km</strong></div>
                                            <div>⏱️ ETA: <strong>{result.route_optimization.recommended_route.eta_hours.toFixed(1)} hours</strong></div>
                                            <div>🏔️ Terrain: <strong>{result.route_optimization.recommended_route.terrain}</strong></div>
                                            <div>🌤️ Weather: <strong>{result.route_optimization.recommended_route.weather}</strong></div>
                                            <div>🚗 Traffic: <strong>{result.route_optimization.recommended_route.traffic}</strong></div>
                                            <div>🛣️ Road Type: <strong>{result.route_optimization.recommended_route.road_type}</strong></div>
                                        </div>

                                        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#3d7a5c' }}>Waypoints:</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {result.route_optimization.recommended_route.waypoints.map((wp: string, i: number) => (
                                                <span key={i} className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                                                    {i + 1}. {wp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Priority & Fleet */}
                                <div className="grid grid-2">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">⭐ Priority</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="text-center">
                                                <div className="stat-value" style={{ fontSize: '2rem' }}>
                                                    {result.priority.priority_score}/10
                                                </div>
                                                <div className="badge badge-medium" style={{ marginTop: '0.5rem' }}>
                                                    {result.priority.priority_level}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">🚛 Fleet</h3>
                                        </div>
                                        <div className="card-body">
                                            <div>Optimal Vehicles: <strong>{result.fleet_optimization.optimal_vehicles}</strong></div>
                                            <div>Fuel Needed: <strong>{result.fleet_optimization.estimated_fuel_liters}L</strong></div>
                                            <div>Avg Utilization: <strong>{result.fleet_optimization.average_utilization_percent}%</strong></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Climate Impact */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">🌍 Climate Impact (SDG12)</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="grid grid-2">
                                            <div>CO2 Emissions: <strong>{result.climate_impact.co2_emissions_kg} kg</strong></div>
                                            <div>Fuel Consumption: <strong>{result.climate_impact.fuel_consumption_liters}L</strong></div>
                                            <div>Optimal Speed: <strong>{result.climate_impact.optimal_speed_kmh} km/h</strong></div>
                                            <div>Potential Savings: <strong>{result.climate_impact.potential_fuel_savings_liters}L</strong></div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={() => router.push('/dashboard')}
                                >
                                    📊 View in Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
