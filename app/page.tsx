'use client';

import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import API_URL from './config';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    total_active_convoys: 0,
    high_threat_convoys: 0,
    active_emergencies: 0,
    average_threat_level: 0,
    system_status: 'operational'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
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
        {/* Hero Section */}
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'fadeIn 1s ease' }}>
            🛡️ AstraConvoy
          </h1>
          <h2 style={{ fontSize: '1.5rem', color: '#3d7a5c', marginBottom: '1rem' }}>
            AI Defence Transport & Threat Intelligence System
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#a0a0a0', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Advanced AI-powered convoy management system for the Indian Army.
            Optimize routes, predict threats, ensure safety, and reduce delays with real-time intelligence.
          </p>
          <div className="flex-center gap-2">
            <Link href="/create">
              <button className="btn btn-primary">
                🚀 Create New Convoy
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn btn-warning">
                📊 View Dashboard
              </button>
            </Link>
            <Link href="/driver">
              <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)' }}>
                🚛 Driver Portal
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-4 mb-3">
          <div className="stat-box">
            <div className="stat-label">Active Convoys</div>
            <div className="stat-value">{stats.total_active_convoys}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">High Threat</div>
            <div className="stat-value" style={{ color: '#ff6b35' }}>{stats.high_threat_convoys}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Emergencies</div>
            <div className="stat-value" style={{ color: '#ff0033' }}>{stats.active_emergencies}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Avg Threat Level</div>
            <div className="stat-value">{stats.average_threat_level}/10</div>
          </div>
        </div>

        {/* System Features */}
        <div className="card">
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

        {/* Call to Action */}
        <div
          className="card text-center mt-3"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 61, 46, 0.6), rgba(45, 95, 74, 0.6))',
            padding: '3rem'
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Ready to Optimize Your Convoy Operations?</h2>
          <p style={{ fontSize: '1.1rem', color: '#d0d0d0', marginBottom: '2rem' }}>
            Experience the future of military logistics with AI-driven route planning,
            threat intelligence, and real-time convoy management.
          </p>
          <Link href="/create">
            <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              🚀 Deploy Your First Convoy
            </button>
          </Link>
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
