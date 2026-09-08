'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCoordsFromPin, calculateDistanceKm, Coordinates } from '@/lib/postal';
import { MapPin, Navigation, Filter, ShieldCheck, Heart, Search, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export type SitterSpot = {
  id: string;
  name: string;
  pin: string;
  services: string[];
  hourlyRate: number;
  rating: number;
  bio: string;
  verified: boolean;
  yearsExp: number;
};

export type ParentSpot = {
  id: string;
  name: string;
  pin: string;
  petsCount: number;
  registeredDate: string;
};

interface HotspotMapProps {
  userRole: 'parent' | 'sitter' | 'admin';
  userPin?: string;
  sitters: SitterSpot[];
  parents?: ParentSpot[];
  onSelectSitter?: (sitter: SitterSpot) => void;
  onRequestQuote?: (sitter: SitterSpot) => void;
}

export default function HotspotMap({
  userRole,
  userPin = '238163',
  sitters,
  parents = [],
  onRequestQuote,
}: HotspotMapProps) {
  const [radiusKm, setRadiusKm] = useState<number>(5.0);
  const [searchPin, setSearchPin] = useState<string>(userPin);
  const [activeTab, setActiveTab] = useState<'all' | 'within_radius'>('within_radius');
  const [selectedSpot, setSelectedSpot] = useState<SitterSpot | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Compute reference coordinates from live GPS or search pin or user pin
  const refCoords = useMemo(() => {
    if (isLiveTracking && liveCoords) {
      return {
        lat: liveCoords.lat,
        lng: liveCoords.lng,
        district: 'GPS Live',
        name: `Live Position (Accuracy ±${liveCoords.accuracy}m)`,
      };
    }
    return getCoordsFromPin(searchPin || userPin);
  }, [isLiveTracking, liveCoords, searchPin, userPin]);

  // Live GPS tracking listener
  useEffect(() => {
    if (!isLiveTracking) return;

    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation API is not supported in your browser.');
      setIsLiveTracking(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        console.warn('Live GPS error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isLiveTracking]);

  // Compute distances for all sitters relative to search center
  const sittersWithDist = useMemo(() => {
    return sitters.map((s) => {
      const coords = getCoordsFromPin(s.pin);
      const dist = calculateDistanceKm(refCoords.lat, refCoords.lng, coords.lat, coords.lng);
      return { ...s, coords, distance: dist, isWithin: dist <= radiusKm };
    });
  }, [sitters, refCoords, radiusKm]);

  // Compute distances for parents (for admin view)
  const parentsWithDist = useMemo(() => {
    return parents.map((p) => {
      const coords = getCoordsFromPin(p.pin);
      const dist = calculateDistanceKm(refCoords.lat, refCoords.lng, coords.lat, coords.lng);
      return { ...p, coords, distance: dist, isWithin: dist <= radiusKm };
    });
  }, [parents, refCoords, radiusKm]);

  const sittersWithin = useMemo(
    () => sittersWithDist.filter((s) => s.isWithin),
    [sittersWithDist]
  );
  const parentsWithin = useMemo(
    () => parentsWithDist.filter((p) => p.isWithin),
    [parentsWithDist]
  );

  // Leaflet map initialization
  useEffect(() => {
    let mapInstance: L.Map | null = null;
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined') return;
      const L = (await import('leaflet')).default;

      const container = document.getElementById('rara-hotspot-map-canvas');
      if (!container || !isMounted) return;

      // Clean up previous instance if any
      // @ts-ignore
      if (container._leaflet_id) {
        // @ts-ignore
        container._leaflet_id = null;
        container.innerHTML = '';
      }

      mapInstance = L.map('rara-hotspot-map-canvas', {
        center: [refCoords.lat, refCoords.lng],
        zoom: radiusKm <= 3 ? 14 : radiusKm <= 5 ? 13 : 12,
        zoomControl: true,
      });

      const map: any = mapInstance;

      // Dark theme map tiles (OpenStreetMap / CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Custom Center Marker (User PIN or Live GPS location)
      const centerIcon = L.divIcon({
        className: 'custom-center-marker',
        html: `<div style="background:${isLiveTracking ? '#2563eb' : '#00982d'};color:white;padding:6px 12px;border-radius:20px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid white;display:flex;align-items:center;gap:4px;">
                <span>${isLiveTracking ? '📡 Live GPS Position' : `📍 Center: ${searchPin || userPin}`}</span>
               </div>`,
        iconSize: [150, 36],
        iconAnchor: [75, 18],
      });

      L.marker([refCoords.lat, refCoords.lng], { icon: centerIcon })
        .addTo(map)
        .bindPopup(`<b>${isLiveTracking ? 'Live GPS Position' : `Center Postal Code: ${searchPin || userPin}`}</b><br/>${refCoords.name}`);

      // 5km Radius Circle boundary
      L.circle([refCoords.lat, refCoords.lng], {
        radius: radiusKm * 1000,
        color: isLiveTracking ? '#2563eb' : '#00982d',
        fillColor: isLiveTracking ? '#3b82f6' : '#00982d',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      // Add Sitter Markers (Green Pins)
      sittersWithDist.forEach((s) => {
        const sitterIcon = L.divIcon({
          className: 'sitter-marker',
          html: `<div style="background:${s.isWithin ? '#0e9f6e' : '#6b7280'};color:white;padding:4px 8px;border-radius:14px;font-weight:600;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;display:flex;align-items:center;gap:4px;cursor:pointer;">
                  <span>🐾 ${s.name} (${s.distance}km)</span>
                 </div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const m = L.marker([s.coords.lat, s.coords.lng], { icon: sitterIcon }).addTo(map);
        m.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;min-width:180px;">
            <div style="display:flex;align-items:center;justify-between;gap:8px;">
              <strong style="font-size:14px;color:#111;">${s.name}</strong>
              <span style="background:#e6f4ea;color:#00982d;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;">${s.distance} km</span>
            </div>
            <p style="margin:4px 0;font-size:12px;color:#4b5563;">PIN ${s.pin} · ${s.coords.name}</p>
            <p style="margin:4px 0;font-size:12px;font-weight:600;color:#111;">$${s.hourlyRate}/hr · ⭐ ${s.rating}</p>
            <p style="margin:4px 0;font-size:11px;color:#6b7280;">Services: ${s.services.slice(0, 2).join(', ')}</p>
          </div>
        `);
      });

      // Add Parent Markers (Purple Pins for Admin)
      if (userRole === 'admin' && parentsWithDist.length > 0) {
        parentsWithDist.forEach((p) => {
          const parentIcon = L.divIcon({
            className: 'parent-marker',
            html: `<div style="background:${p.isWithin ? '#7c3aed' : '#9ca3af'};color:white;padding:4px 8px;border-radius:14px;font-weight:600;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;display:flex;align-items:center;gap:4px;">
                    <span>🏠 ${p.name} (${p.distance}km)</span>
                   </div>`,
            iconSize: [120, 30],
            iconAnchor: [60, 15],
          });

          const pm = L.marker([p.coords.lat, p.coords.lng], { icon: parentIcon }).addTo(map);
          pm.bindPopup(`
            <div style="font-family:sans-serif;padding:4px;">
              <strong style="color:#7c3aed;">${p.name} (Pet Parent)</strong><br/>
              <span style="font-size:12px;">PIN ${p.pin} · ${p.distance} km from center</span><br/>
              <span style="font-size:11px;color:#6b7280;">Pets: ${p.petsCount}</span>
            </div>
          `);
        });
      }

      setMapLoaded(true);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [refCoords, radiusKm, searchPin, userPin, sittersWithDist, parentsWithDist, userRole, isLiveTracking]);

  return (
    <div className="hotspot-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search & Filter Header Bar */}
      <div className="hotspot-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--panel-bg, #fff)', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search by 6-digit Singapore Postal Code (e.g. 238163, 168732)"
            value={searchPin}
            onChange={(e) => {
              setSearchPin(e.target.value);
              setIsLiveTracking(false);
            }}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
            <Filter size={16} /> Radius:
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#fff' }}
            >
              <option value={1}>1 km (Immediate Neighbourhood)</option>
              <option value={3}>3 km (Close Proximity)</option>
              <option value={5}>5 km Radius (Standard Matching)</option>
              <option value={10}>10 km (Extended Area)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setIsLiveTracking(!isLiveTracking);
            }}
            style={{
              padding: '6px 12px',
              background: isLiveTracking ? '#2563eb' : '#f3f4f6',
              color: isLiveTracking ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
            }}
          >
            <Navigation size={14} /> {isLiveTracking ? '📡 Live Tracking ON' : 'Start Live GPS Tracking'}
          </button>
        </div>
      </div>


      {/* Main Map & Hotspot Sidebar Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', minHeight: '480px' }} className="hotspot-grid-responsive">
        {/* Leaflet Map Canvas */}
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#e5e7eb' }}>
          <div id="rara-hotspot-map-canvas" style={{ width: '100%', height: '480px' }} />
          {!mapLoaded && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#374151' }}>
              Loading interactive 5km locality map...
            </div>
          )}
        </div>

        {/* Locality Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel-bg, #fff)', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', maxHeight: '480px', overflowY: 'auto' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                {userRole === 'admin' ? 'Platform Hotspots' : `Sitters within ${radiusKm}km`}
              </h3>
              <span style={{ background: '#00982d', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                {sittersWithin.length} Sitters
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Locality: <b>{refCoords.name}</b> ({refCoords.district})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('within_radius')}
              style={{
                flex: 1,
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: activeTab === 'within_radius' ? '#e6f4ea' : 'transparent',
                color: activeTab === 'within_radius' ? '#00982d' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              Within {radiusKm}km ({sittersWithin.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: activeTab === 'all' ? '#f3f4f6' : 'transparent',
                color: activeTab === 'all' ? '#111827' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              All Sitters ({sittersWithDist.length})
            </button>
          </div>

          {/* Sitter Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(activeTab === 'within_radius' ? sittersWithin : sittersWithDist).map((sitter) => (
              <div
                key={sitter.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: selectedSpot?.id === sitter.id ? '2px solid #00982d' : '1px solid #e5e7eb',
                  background: sitter.isWithin ? '#fafafa' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedSpot(sitter)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {sitter.name} {sitter.verified && <ShieldCheck size={14} style={{ color: '#00982d' }} />}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      PIN {sitter.pin} · {sitter.coords.district}
                    </span>
                  </div>
                  <span style={{ background: sitter.isWithin ? '#00982d' : '#9ca3af', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                    {sitter.distance} km
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#00982d' }}>${sitter.hourlyRate}/hr</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>⭐ {sitter.rating} ({sitter.yearsExp}y exp)</span>
                </div>

                {onRequestQuote && userRole === 'parent' && sitter.isWithin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestQuote(sitter);
                    }}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '6px',
                      background: '#00982d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Request Quote from {sitter.name.split(' ')[0]}
                  </button>
                )}
              </div>
            ))}

            {(activeTab === 'within_radius' ? sittersWithin : sittersWithDist).length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                <MapPin size={24} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                No verified sitters found within {radiusKm}km of PIN {searchPin || userPin}.
                <br />
                Try increasing the radius to 10km!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
