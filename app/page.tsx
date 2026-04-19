'use client';

import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import API_URL from './config';
import Link from 'next/link';
import VoiceCommand from './components/VoiceCommand';

export default function Home() {
  const [stats, setStats] = useState({
    total_active_convoys: 0,
    high_threat_convoys: 0,
    active_emergencies: 0,
    average_threat_level: 0,
    system_status: 'operational'
  });

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    // Use a listener to detect storage changes (logout from other tabs)
    const checkRole = () => setUserRole(localStorage.getItem('userRole'));
    checkRole();
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🎯',
      title: 'Route Optimization',
      description: 'AI-powered route selection with real-time traffic, terrain, and weather analysis',
      color: '#3d7a5c'
    },
    {
      icon: '⚠️',
      title: 'Threat Prediction',
      description: '10-point threat scoring system analyzing multiple risk factors for convoy safety',
      color: '#ff6b35'
    },
    {
      icon: '🚨',
      title: 'Emergency Detection',
      description: 'Automatic SOS triggering with nearest checkpoint notification and rerouting',
      color: '#ff0033'
    },
    {
      icon: '⭐',
      title: 'Priority Engine',
      description: 'Mission-based priority scoring for critical operations (Medical: 10, Ammunition: 9)',
      color: '#d4af37'
    },
    {
      icon: '🛣️',
      title: 'Conflict Avoidance',
      description: 'Detects route conflicts and suggests optimal timing adjustments',
      color: '#00ddff'
    },
    {
      icon: '📊',
      title: 'Fleet Optimization',
      description: 'Load distribution and fuel efficiency calculations for convoy planning',
      color: '#90ee90'
    },
    {
      icon: '🌍',
      title: 'Climate Impact',
      description: 'Carbon footprint tracking and efficiency recommendations (SDG12)',
      color: '#2d5f4a'
    },
    {
      icon: '📡',
      title: 'V2V Communication',
      description: 'Real-time convoy-to-convoy messaging for traffic and terrain updates',
      color: '#ffa500'
    },
    {
      icon: '🚛',
      title: 'Driver Portal',
      description: 'Dedicated driver interface with route display, SOS button, and real-time alerts',
      color: '#d4af37'
    }
  ];

  return (
    <>
      <Navigation />

      <div className="container">
        {/* Hero Section with Radar */}
        <div className="grid grid-2 mb-3" style={{ alignItems: 'center' }}>
          <div className="hud-scan card glass-premium" style={{ padding: '3rem' }}>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}>
              🛡️ AstraConvoy
            </h1>
            <h2 style={{ fontSize: '1.2rem', color: '#3d7a5c', marginBottom: '1.5rem', letterSpacing: '3px' }}>
              SECURE LOGISTICS | PREDICTIVE THREAT INTEL
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#d0d0d0', marginBottom: '2rem', lineHeight: '1.8' }}>
              The future of Indian Army convoy management. AI-driven route optimization, 
              real-time threat scoring, and mission-critical prioritization. 
              <strong> ACCESS AUTHORIZATION REQUIRED.</strong>
            </p>
            <div className="flex gap-2">
              <Link href={userRole ? (userRole === 'driver' ? '/driver' : '/dashboard') : '/login'}>
                <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {userRole ? '📊 OPEN COMMAND DASHBOARD' : '🔑 ENTER COMMAND SYSTEM'}
                </button>
              </Link>
            </div>
            
            <div className="mt-3" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>SYSTEM STATUS</div>
              <div className="flex-between">
                <div style={{ color: '#00ff88', fontSize: '0.9rem' }}>● AI ENGINE ONLINE</div>
                <div style={{ color: '#00ff88', fontSize: '0.9rem' }}>● SAT-LINK ACTIVE</div>
                <div style={{ color: '#00ff88', fontSize: '0.9rem' }}>● V2V ENCRYPTED</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="radar-container">
              <div className="radar-grid"></div>
              <div className="radar-sweep"></div>
              {/* Simulated blips */}
              <div style={{ position: 'absolute', top: '30%', left: '40%', width: '8px', height: '8px', background: '#ff0033', borderRadius: '50%', boxShadow: '0 0 10px #ff0033', animation: 'pulse-red 1s infinite' }}></div>
              <div style={{ position: 'absolute', top: '60%', left: '70%', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></div>
              <div style={{ position: 'absolute', top: '20%', left: '20%', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></div>
            </div>
            <div className="mt-2">
              <span className="badge badge-high">SCANNING FOR THREATS...</span>
            </div>
          </div>
        </div>

        {/* Real-time Feed & Stats */}
        <div className="grid grid-4 mb-3">
          <div className="stat-box glow-border">
            <div className="stat-label">ACTIVE MISSIONS</div>
            <div className="stat-value">{stats.total_active_convoys}</div>
          </div>
          <div className="stat-box glow-border" style={{ borderColor: 'var(--threat-high)' }}>
            <div className="stat-label">HIGH RISK ZONES</div>
            <div className="stat-value" style={{ color: '#ff6b35' }}>{stats.high_threat_convoys}</div>
          </div>
          <div className="stat-box glow-border" style={{ borderColor: 'var(--status-emergency)' }}>
            <div className="stat-label">S.O.S ALERTS</div>
            <div className="stat-value" style={{ color: '#ff0033' }}>{stats.active_emergencies}</div>
          </div>
          <div className="stat-box glow-border">
            <div className="stat-label">SYSTEM HEALTH</div>
            <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#00ff88' }}>OPERATIONAL</div>
          </div>
        </div>

        {/* Mission Intelligence Feed */}
        <div className="grid grid-2 mt-3">
          <div className="card glow-border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', color: 'var(--military-gold)' }}>📡 LIVE INTELLIGENCE FEED</h3>
              <span className="badge badge-minimal">REAL-TIME</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00ff88' }}>
              <div className="mb-1">[10:42:01] SAT-LINK: ESTABLISHED. ENCRYPTION LEVEL 4.</div>
              <div className="mb-1">[10:42:05] INTEL: WEATHER IN LADAKH SECTOR DETERIORATING.</div>
              <div className="mb-1">[10:42:10] MISSION: CONVOY-ALPHA-09 REACHED CHECKPOINT 4.</div>
              <div className="mb-1" style={{ color: 'var(--military-orange)' }}>[10:42:15] WARNING: UNUSUAL ACTIVITY DETECTED NEAR ROUTE 12.</div>
              <div className="mb-1">[10:42:20] SYSTEM: AI THREAT ENGINE SCAN COMPLETED.</div>
              <div className="mb-1">[10:42:25] SOS: NO ACTIVE EMERGENCY SIGNALS.</div>
              <div className="mb-1">[10:42:30] DATA: V2V SIGNAL STRENGTH OPTIMAL.</div>
            </div>
          </div>
          <VoiceCommand />
        </div>

        {/* System Features */}
        <div className="card mt-3">
          <div className="card-header">
            <h2>System Capabilities</h2>
          </div>
          <div className="grid grid-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card"
                style={{
                  borderLeft: `4px solid ${feature.color}`,
                  animation: `fadeIn ${0.5 + index * 0.1}s ease`
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#a0a0a0', lineHeight: '1.4' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="grid grid-3 mt-3">
          <div className="card">
            <h3>🤖 AI-Powered Intelligence</h3>
            <p style={{ color: '#a0a0a0', marginTop: '0.5rem' }}>
              Rule-based threat prediction engine analyzing terrain, weather, traffic density,
              isolation levels, and historical accident data to generate 1-10 threat scores.
            </p>
          </div>
          <div className="card">
            <h3>🎯 Mission-Critical Prioritization</h3>
            <p style={{ color: '#a0a0a0', marginTop: '0.5rem' }}>
              Intelligent priority scoring: Medical (10), Ammunition (9), Fuel (8), Supplies (6),
              ensuring critical operations get road space priority.
            </p>
          </div>
          <div className="card">
            <h3>🌐 Real-Time Monitoring</h3>
            <p style={{ color: '#a0a0a0', marginTop: '0.5rem' }}>
              Live convoy tracking, route conflict detection, emergency alerts, and
              V2V communication for comprehensive situational awareness.
            </p>
          </div>
        </div>

        {/* System Monitoring Footer Notice */}
        <div className="card text-center mt-3" style={{ background: 'rgba(26, 61, 46, 0.3)', padding: '2rem' }}>
          <p style={{ color: 'var(--military-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            📡 ALL ACTIVE CONVOYS ARE REGISTERED BY GROUND UNITS VIA THE DRIVER PORTAL.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
        borderTop: '1px solid rgba(61, 122, 92, 0.3)',
        marginTop: '3rem'
      }}>
        <p>🛡️ AstraConvoy v1.0 | AI Defence Transport & Threat Intelligence System</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Developed for Indian Army | Defence-Grade Technology
        </p>
      </div>
    </>
  );
}
