import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { Activity, AlertTriangle, Shield, Zap, Target, MapPin, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguMyAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjggMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiNmZjAwZmYiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNS41IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguMyAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjggMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiNmZjAwZmYiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNS41IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  shadowUrl: '',
});

interface Threat {
  id: string | number;
  ip: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface Attack {
  id: number;
  source: { lat: number; lon: number; country: string; city: string };
  target: { lat: number; lon: number; country: string; city: string };
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  ip: string;
  active: boolean;
}

// Auto center map on attacks
function MapController({ attacks }: { attacks: Attack[] }) {
  const map = useMap();

  useEffect(() => {
    if (attacks.length > 0 && attacks[0]) {
      // Don't re-center every time, just on first attack
    }
  }, [attacks, map]);

  return null;
}

const WorldMap: React.FC = () => {
  const [realThreats, setRealThreats] = useState<Threat[]>([]);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    ddos: 0,
    malware: 0,
    portscan: 0,
    sqli: 0,
    bruteforce: 0,
  });
  const [statsCollapsed, setStatsCollapsed] = useState(false);

  // Fetch real GeoIP threats
  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${backendUrl}/api/geoip/threats`);
        const data = await response.json();
        if (data.success && data.threats) {
          setRealThreats(data.threats);
        }
      } catch (error) {
        console.error('Failed to fetch threats:', error);
      }
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate attacks from real threat data
  useEffect(() => {
    if (realThreats.length < 2) return;

    const interval = setInterval(() => {
      const sourceThreat = realThreats[Math.floor(Math.random() * realThreats.length)];
      let targetThreat = realThreats[Math.floor(Math.random() * realThreats.length)];

      while (targetThreat.id === sourceThreat.id && realThreats.length > 1) {
        targetThreat = realThreats[Math.floor(Math.random() * realThreats.length)];
      }

      const newAttack: Attack = {
        id: Date.now() + Math.random(),
        source: {
          lat: sourceThreat.lat,
          lon: sourceThreat.lon,
          country: sourceThreat.country,
          city: sourceThreat.city
        },
        target: {
          lat: targetThreat.lat,
          lon: targetThreat.lon,
          country: targetThreat.country,
          city: targetThreat.city
        },
        type: sourceThreat.type,
        severity: sourceThreat.severity,
        timestamp: new Date(),
        ip: sourceThreat.ip,
        active: true
      };

      setAttacks(prev => [...prev, newAttack].slice(-15));

      setStats(s => ({
        total: s.total + 1,
        ddos: sourceThreat.type === 'DDoS' ? s.ddos + 1 : s.ddos,
        malware: sourceThreat.type === 'Malware' ? s.malware + 1 : s.malware,
        portscan: sourceThreat.type === 'Port Scan' ? s.portscan + 1 : s.portscan,
        sqli: sourceThreat.type === 'SQL Injection' ? s.sqli + 1 : s.sqli,
        bruteforce: sourceThreat.type === 'Brute Force' ? s.bruteforce + 1 : s.bruteforce,
      }));

      // Auto-remove attack after 5 seconds
      setTimeout(() => {
        setAttacks(prev => prev.filter(a => a.id !== newAttack.id));
      }, 5000);
    }, 2000);

    return () => clearInterval(interval);
  }, [realThreats]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffaa00';
      default: return '#00ff00';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-black gap-3 p-3">
      {/* Map Area */}
      <div className="flex-1 flex flex-col bg-black border border-green-900/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-green-900/50 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-green-500" />
              <div>
                <h2 className="font-orbitron font-bold text-white text-base">GLOBAL THREAT MAP</h2>
                <p className="text-[10px] text-green-600">Real Geographic Visualization with Leaflet.js</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStatsCollapsed(!statsCollapsed)}
                className="px-2 py-1 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 rounded text-green-400 text-xs font-mono flex items-center gap-1"
                title={statsCollapsed ? "Show Statistics" : "Hide Statistics"}
              >
                {statsCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                {statsCollapsed ? 'Stats' : 'Hide'}
              </button>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded px-2 py-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-mono font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="flex-1 relative">
          <MapContainer
            {...{
              center: [20, 0] as [number, number],
              zoom: 2,
              style: { height: '100%', width: '100%', background: '#0a0a0a' },
              className: 'z-0',
              zoomControl: true,
              minZoom: 2,
              maxZoom: 6
            } as any}
          >
            {/* Dark tile layer - CartoDB Dark Matter */}
            <TileLayer
              {...{ url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' } as any}
            />


            <MapController attacks={attacks} />

            {/* Threat Location Markers */}
            {realThreats.slice(0, 50).map((threat) => (
              <CircleMarker
                key={threat.id}
                center={[threat.lat, threat.lon] as [number, number]}
                radius={5}
                pathOptions={{
                  color: '#ff00ff',
                  fillColor: '#ff00ff',
                  fillOpacity: 0.6,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold text-pink-600">{threat.ip}</div>
                    <div className="text-gray-700">{threat.city}, {threat.country}</div>
                    <div className="text-gray-600 text-[10px]">{threat.type}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Attack Paths */}
            {attacks.map((attack) => (
              <Polyline
                key={attack.id}
                positions={[
                  [attack.source.lat, attack.source.lon],
                  [attack.target.lat, attack.target.lon]
                ]}
                pathOptions={{
                  color: getSeverityColor(attack.severity),
                  weight: 2,
                  opacity: 0.7,
                  dashArray: '5, 10'
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold">{attack.type}</div>
                    <div className="text-gray-600">{attack.source.city} → {attack.target.city}</div>
                    <div className="text-pink-600 text-[10px]">{attack.ip}</div>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-black/90 border border-green-900/50 rounded px-3 py-2 text-[10px] backdrop-blur-sm z-[1000]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 bg-pink-500 rounded-full border border-pink-300"></div>
              <span className="text-gray-300">Threat Origins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500"></div>
              <span className="text-gray-300">Active Attacks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel - Collapsible */}
      {!statsCollapsed && (
        <div className="w-full lg:w-72 flex flex-col bg-black border border-green-900/50 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-green-900/50 bg-black/80">
            <h3 className="font-orbitron font-bold text-white text-sm flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              ATTACK STATISTICS
            </h3>
            <p className="text-[9px] text-green-700 mt-0.5">Real-Time GeoIP Data</p>
          </div>

          <div className="p-3 space-y-2 border-b border-green-900/50">
            <StatCard label="Total Attacks" value={stats.total} color="green" />
            <StatCard label="DDoS Attacks" value={stats.ddos} color="red" />
            <StatCard label="Malware" value={stats.malware} color="orange" />
            <StatCard label="Port Scans" value={stats.portscan} color="yellow" />
            <StatCard label="SQL Injection" value={stats.sqli} color="blue" />
            <StatCard label="Brute Force" value={stats.bruteforce} color="purple" />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="font-bold text-white text-xs mb-2 flex items-center gap-1.5">
              <MapPin size={12} className="text-pink-500" />
              RECENT ATTACKS
            </h3>
            <div className="space-y-1.5 max-h-96">
              {attacks.slice().reverse().map(attack => (
                <div
                  key={attack.id}
                  className="p-2 rounded bg-gray-900/40 border border-gray-800/50 text-[10px] hover:border-pink-900/50 transition-all animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[11px]">{attack.type}</span>
                    <span className={`font-mono text-[9px] ${getSeverityTextColor(attack.severity)}`}>
                      {attack.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-500 font-mono text-[9px] leading-tight">
                    <div className="text-pink-400 mb-0.5">{attack.ip}</div>
                    <div>{attack.source.city}, {attack.source.country} → {attack.target.city}, {attack.target.country}</div>
                    <div className="text-gray-600 text-[8px] mt-0.5">
                      {attack.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-container {
          font-family: 'Orbitron', monospace;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(0, 255, 100, 0.3) !important;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'border-green-900/50 bg-green-900/10 text-green-400',
    red: 'border-red-900/50 bg-red-900/10 text-red-400',
    orange: 'border-orange-900/50 bg-orange-900/10 text-orange-400',
    yellow: 'border-yellow-900/50 bg-yellow-900/10 text-yellow-400',
    blue: 'border-blue-900/50 bg-blue-900/10 text-blue-400',
    purple: 'border-purple-900/50 bg-purple-900/10 text-purple-400',
  };

  return (
    <div className={`p-2 rounded border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold">{label}</span>
        <span className="text-xl font-orbitron font-bold">{value}</span>
      </div>
    </div>
  );
};

export default WorldMap;
