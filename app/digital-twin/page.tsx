'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import API_URL from '../config';

export default function DigitalTwinPage() {
    const [convoys, setConvoys] = useState<any[]>([]);
    const [selectedConvoy, setSelectedConvoy] = useState<any>(null);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConvoys();
    }, []);

    useEffect(() => {
        if (isSimulating && simulationProgress < 100) {
            const interval = setInterval(() => {
                setSimulationProgress(prev => {
                    if (prev >= 100) {
                        setIsSimulating(false);
                        return 100;
                    }
                    return prev + 1;
                });

                // Generate random events
                if (Math.random() > 0.7 && simulationProgress % 10 === 0) {
                    const eventTypes = [
                        'Checkpoint passed successfully',
                        'Traffic detected - adjusting speed',
                        'Weather condition: Clear',
                        'Terrain: Navigating hilly section',
                        'Communication check: All systems operational',
                        'Fuel level: Optimal',
                        'Speed optimized for efficiency'
                    ];

                    const newEvent = {
                        time: `${Math.floor(simulationProgress / 4)}:${(simulationProgress % 4) * 15}`,
                        message: eventTypes[Math.floor(Math.random() * eventTypes.length)]
                    };

                    setEvents(prev => [newEvent, ...prev].slice(0, 10));
                }
            }, 300);

            return () => clearInterval(interval);
        }
    }, [isSimulating, simulationProgress]);

    const fetchConvoys = async () => {
        try {
            const response = await fetch(`${API_URL}/api/convoy/list`);
            const data = await response.json();
            setConvoys(data.convoys || []);
            if (data.convoys && data.convoys.length > 0) {
                setSelectedConvoy(data.convoys[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const startSimulation = () => {
        setSimulationProgress(0);
        setIsSimulating(true);
        setEvents([]);
    };

    const getRouteData = () => {
        if (!selectedConvoy || !selectedConvoy.route_data) return null;
        try {
            const routeData = JSON.parse(selectedConvoy.route_data);
            return routeData.recommended_route;
        } catch {
            return null;
        }
    };

    const route = getRouteData();

    return (
        <>
            <Navigation />

            <div className="container">
                <h1>🎮 Digital Twin Simulation</h1>
                <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
                    Visualize convoy movement with real-time threat detection and rerouting
                </p>

                {/* Convoy Selector */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h2 className="card-title">Select Convoy for Simulation</h2>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner"></div>
                            </div>
                        ) : convoys.length === 0 ? (
                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                No convoys available. Create a convoy first.
                            </div>
                        ) : (
                            <div className="grid grid-3">
                                {convoys.map((convoy) => (
                                    <div
                                        key={convoy.id}
                                        className={`card ${selectedConvoy?.id === convoy.id ? 'card' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedConvoy?.id === convoy.id ? '2px solid #3d7a5c' : '1px solid rgba(61, 122, 92, 0.3)',
                                            background: selectedConvoy?.id === convoy.id ? 'rgba(61, 122, 92, 0.2)' : 'rgba(0,0,0,0.2)'
                                        }}
                                        onClick={() => {
                                            setSelectedConvoy(convoy);
                                            setSimulationProgress(0);
                                            setIsSimulating(false);
                                            setEvents([]);
                                        }}
                                    >
                                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            {convoy.convoy_name || `CONVOY-${convoy.id}`}
                                        </h3>
                                        <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                            {convoy.start_point} → {convoy.destination}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                            <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                                                {convoy.mission_type}
                                            </span>
                                            <span className={`badge ${convoy.threat_level >= 6 ? 'badge-high' : 'badge-low'}`} style={{ fontSize: '0.7rem' }}>
                                                Threat: {convoy.threat_level}/10
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedConvoy && (
                    <>
                        {/* Simulation Control Panel */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h2 className="card-title">🎛️ Simulation Control</h2>
                                <span className={`badge ${isSimulating ? 'badge-warning' : 'badge-low'}`}>
                                    {isSimulating ? '🔄 SIMULATING' : '⏸️ READY'}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', color: '#3d7a5c', marginBottom: '0.5rem' }}>
                                            Convoy: {selectedConvoy.convoy_name || `CONVOY-${selectedConvoy.id}`}
                                        </h3>
                                        <div style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                                            Route: {selectedConvoy.start_point} → {selectedConvoy.destination}
                                        </div>
                                    </div>
                                    <div className="flex-center">
                                        <button
                                            className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
                                            onClick={() => isSimulating ? setIsSimulating(false) : startSimulation()}
                                            disabled={!selectedConvoy}
                                            style={{ width: '200px' }}
                                        >
                                            {isSimulating ? '⏸️ Pause Simulation' : '▶️ Start Simulation'}
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Journey Progress</span>
                                        <span>{simulationProgress}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '30px' }}>
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${simulationProgress}%`,
                                                background: simulationProgress === 100 ? 'linear-gradient(90deg, #00ff88, #00dd66)' : 'linear-gradient(90deg, #2d5f4a, #3d7a5c)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingLeft: '1rem',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {simulationProgress > 10 && `${simulationProgress}%`}
                                        </div>
                                    </div>

                                    {simulationProgress === 100 && (
                                        <div className="alert alert-info" style={{ marginTop: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderColor: '#00ff88' }}>
                                            ✅ Convoy reached destination successfully!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-2">
                            {/* Visual Simulation */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">🗺️ Route Visualization</h2>
                                </div>
                                <div className="card-body">
                                    {route && (
                                        <div>
                                            {/* Simulated Map */}
                                            <div
                                                style={{
                                                    background: 'linear-gradient(135deg, #0a0e0f 0%, #1a3d2e 100%)',
                                                    padding: '2rem',
                                                    borderRadius: '10px',
                                                    border: '2px solid rgba(61, 122, 92, 0.3)',
                                                    position: 'relative',
                                                    minHeight: '400px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Route Path */}
                                                <div style={{ position: 'relative', height: '100%' }}>
                                                    {route.waypoints.map((waypoint: string, index: number) => {
                                                        const progress = (index / (route.waypoints.length - 1)) * 100;
                                                        const isPassed = simulationProgress >= progress;

                                                        return (
                                                            <div
                                                                key={index}
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: `${10 + (index * 75 / route.waypoints.length)}%`,
                                                                    top: `${20 + Math.sin(index) * 30}%`,
                                                                    animation: isPassed ? 'fadeIn 0.5s ease' : 'none'
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        borderRadius: '50%',
                                                                        background: isPassed ? '#00ff88' : '#3d7a5c',
                                                                        border: `3px solid ${isPassed ? '#00ff88' : '#3d7a5c'}`,
                                                                        boxShadow: isPassed ? '0 0 20px rgba(0, 255, 136, 0.6)' : 'none',
                                                                        marginBottom: '0.5rem',
                                                                        transition: 'all 0.5s ease'
                                                                    }}
                                                                />
                                                                <div
                                                                    style={{
                                                                        fontSize: '0.5rem',
                                                                        color: isPassed ? '#00ff88' : '#888',
                                                                        whiteSpace: 'nowrap',
                                                                        fontWeight: isPassed ? 'bold' : 'normal',
                                                                        maxWidth: '60px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    {waypoint}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Convoy Icon - Flipped to face opposite */}
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${10 + (simulationProgress * 0.75)}%`,
                                                            top: `${20 + Math.sin(simulationProgress / 30) * 30}%`,
                                                            fontSize: '2rem',
                                                            transition: 'all 0.3s ease',
                                                            animation: isSimulating ? 'pulse-red 1s infinite' : 'none',
                                                            transform: 'scaleX(-1)'
                                                        }}
                                                    >
                                                        🚛
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Route Info */}
                                            <div className="grid grid-3" style={{ marginTop: '1rem' }}>
                                                <div className="stat-box">
                                                    <div className="stat-label">Distance</div>
                                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{route.distance_km}km</div>
                                                </div>
                                                <div className="stat-box">
                                                    <div className="stat-label">ETA</div>
                                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{route.eta_hours.toFixed(1)}h</div>
                                                </div>
                                                <div className="stat-box">
                                                    <div className="stat-label">Threat</div>
                                                    <div className="stat-value" style={{ fontSize: '1.5rem', color: selectedConvoy.threat_level >= 6 ? '#ff6b35' : '#00ff88' }}>
                                                        {selectedConvoy.threat_level}/10
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Event Log */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">📜 Event Log</h2>
                                    <span className="badge badge-low">{events.length} Events</span>
                                </div>
                                <div className="card-body">
                                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {events.length === 0 ? (
                                            <div className="text-center" style={{ padding: '2rem', color: '#a0a0a0' }}>
                                                Start simulation to see events
                                            </div>
                                        ) : (
                                            events.map((event, index) => (
                                                <div
                                                    key={index}
                                                    className="alert alert-info"
                                                    style={{
                                                        marginBottom: '0.5rem',
                                                        animation: 'slideIn 0.3s ease'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>{event.message}</span>
                                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{event.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Environmental Conditions */}
                        {route && (
                            <div className="card mt-3">
                                <div className="card-header">
                                    <h2 className="card-title">🌍 Live Environmental Conditions</h2>
                                </div>
                                <div className="card-body">
                                    <div className="grid grid-4">
                                        <div className="card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏔️</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Terrain</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{route.terrain}</div>
                                        </div>
                                        <div className="card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌤️</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Weather</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{route.weather}</div>
                                        </div>
                                        <div className="card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚗</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Traffic</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{route.traffic}</div>
                                        </div>
                                        <div className="card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛣️</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Road Type</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{route.road_type}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
