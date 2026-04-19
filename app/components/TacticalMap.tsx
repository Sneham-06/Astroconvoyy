'use client';

import { useEffect, useRef, useState } from 'react';

interface TacticalMapProps {
    startPoint: string;
    destination: string;
    currentPosition?: string;
    height?: string;
}

export default function TacticalMap({ startPoint, destination, currentPosition, height = "300px" }: TacticalMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const [isLeafletReady, setIsLeafletReady] = useState(false);

    // Expanded coordinate database for major Indian strategic points
    const getCoords = (city: string) => {
        if (!city) return [28.6139, 77.2090]; // Default to Delhi
        const c = city.trim().toLowerCase();
        const cities: any = {
            'delhi': [28.6139, 77.2090],
            'new delhi': [28.6139, 77.2090],
            'srinagar': [34.0837, 74.7973],
            'ladakh': [34.1526, 77.5771],
            'leh': [34.1642, 77.5846],
            'mumbai': [19.0760, 72.8777],
            'kolkata': [22.5726, 88.3639],
            'jammu': [32.7266, 74.8570],
            'pathankot': [32.2746, 75.6521],
            'guwahati': [26.1445, 91.7362],
            'bangalore': [12.9716, 77.5946],
            'chennai': [13.0827, 80.2707],
            'hyderabad': [17.3850, 78.4867],
            'pune': [18.5204, 73.8567],
            'ahmedabad': [23.0225, 72.5714],
            'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462],
            'amritsar': [31.6340, 74.8723],
            'katra': [32.9918, 74.9320],
            'shimla': [31.1048, 77.1734],
            'hp': [31.1048, 77.1734],
            'blr': [12.9716, 77.5946],
            'bengaluru': [12.9716, 77.5946],
            'del': [28.6139, 77.2090],
            'bom': [19.0760, 72.8777],
            'maa': [13.0827, 80.2707],
            'hyd': [17.3850, 78.4867],
            'jk': [34.0837, 74.7973]
        };
        
        if (cities[c]) return cities[c];
        
        const hash = c.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return [20 + (hash % 10), 75 + (hash % 15)]; 
    };

    useEffect(() => {
        const checkLeaflet = () => {
            if ((window as any).L) {
                setIsLeafletReady(true);
            } else {
                setTimeout(checkLeaflet, 100);
            }
        };
        checkLeaflet();
    }, []);

    useEffect(() => {
        if (!isLeafletReady || !mapRef.current) return;

        const L = (window as any).L;
        const start = getCoords(startPoint);
        const end = getCoords(destination);

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(start, 13);

            // Using Dark Theme tiles for military aesthetic
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
            
            // Fix for the "white-map glitch" - ensure layout is correct
            setTimeout(() => {
                if (mapInstance.current) mapInstance.current.invalidateSize();
            }, 200);
        }

        const map = mapInstance.current;
        
        // Move map to current start point if it changed
        map.setView(start);

        // Clean existing layers except tiles
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        // Add Route (Vivid Red Path)
        const polyline = L.polyline([start, end], {
            color: '#ff0000',
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 10'
        }).addTo(map);

        // Add Waypoints (Blue dots)
        const waypoints = [
            [start[0] + (end[0] - start[0]) * 0.25, start[1] + (end[1] - start[1]) * 0.3],
            [start[0] + (end[0] - start[0]) * 0.75, start[1] + (end[1] - start[1]) * 0.7]
        ];

        waypoints.forEach(wp => {
            L.circleMarker(wp as any, {
                radius: 4,
                fillColor: '#3b82f6',
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            }).addTo(map);
        });

        // Specialized Markers
        const startIcon = L.divIcon({ 
            html: `
                <div style="position:relative; width:30px; height:30px;">
                    <div style="width:30px; height:30px; background:#1e3a8a; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid #fff;"></div>
                    <div style="position:absolute; top:7px; left:7px; width:12px; height:12px; background:#facc15; border-radius:50%;"></div>
                </div>
            `,
            className: 'custom-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        const endIcon = L.divIcon({ 
            html: `
                <div style="position:relative; width:24px; height:24px; border:2px solid #ff0000; border-radius:50%; display:flex; align-items:center; justify-content:center; background: rgba(255,0,0,0.1);">
                    <div style="width:100%; height:1px; background:#ff0000; position:absolute;"></div>
                    <div style="width:1px; height:100%; background:#ff0000; position:absolute;"></div>
                    <div style="width:6px; height:6px; background:#ff0000; border-radius:50%;"></div>
                </div>
            `,
            className: 'custom-target',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        L.marker(start, { icon: startIcon }).addTo(map);
        L.marker(end, { icon: endIcon }).addTo(map);

        // LIVE MOVEMENT SIMULATION
        const truckIcon = L.divIcon({
            html: `<div style="font-size: 24px; filter: drop-shadow(0 0 5px #00ffff);">🚛</div>`,
            className: 'truck-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const truckMarker = L.marker(start, { icon: truckIcon }).addTo(map);

        let progress = 0;
        const moveInterval = setInterval(() => {
            progress += 0.005;
            if (progress > 1) progress = 0;

            const lat = start[0] + (end[0] - start[0]) * progress;
            const lng = start[1] + (end[1] - start[1]) * progress;
            truckMarker.setLatLng([lat, lng]);
        }, 100);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

        return () => {
            clearInterval(moveInterval);
        };
    }, [isLeafletReady, startPoint, destination]);

    return (
        <div style={{ position: 'relative', width: '100%', height }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .leaflet-container {
                    background: #0a0c0f !important;
                    border: 1px solid #3d7a5c;
                    border-radius: 8px;
                }
                .leaflet-tile {
                    filter: brightness(0.8) contrast(1.2) !important;
                }
                .custom-pin { filter: drop-shadow(0 0 5px rgba(30, 58, 138, 0.5)); }
                .truck-marker { transition: all 0.1s linear; }
            `}} />
            <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
            
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                background: 'rgba(10, 12, 15, 0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #3d7a5c',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                color: '#3d7a5c',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: 'monospace'
            }}>
                🛰️ UNIT SATELLITE LINK: ACTIVE
            </div>
            
            <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                left: '10px', 
                zIndex: 1000, 
                color: 'rgba(255,255,255,0.5)', 
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.4)',
                padding: '2px 6px',
                borderRadius: '2px',
                fontFamily: 'monospace'
            }}>
                LOC: {getCoords(startPoint)[0].toFixed(4)}, {getCoords(startPoint)[1].toFixed(4)}
            </div>
        </div>
    );
}
