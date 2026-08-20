import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Footprints, 
  Building2, 
  Train, 
  BookOpen, 
  Utensils, 
  Zap, 
  Star, 
  ExternalLink,
  ShieldCheck,
  Filter,
  X
} from 'lucide-react';
import { Property, UniversityHub, CurrencyCode, NearbyService } from '../types';
import { formatPrice } from '../utils/currency';
import { calculateSafetyScore } from '../utils/matchingAndSafety';
import { handleImageError, FALLBACK_IMAGE } from '../utils/propertyImages';

interface MapExplorerProps {
  hub: UniversityHub;
  properties: Property[];
  currency: CurrencyCode;
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({
  hub,
  properties,
  currency,
  selectedProperty,
  onSelectProperty,
}) => {
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [hoveredService, setHoveredService] = useState<NearbyService | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = all, 1 = 1km, 2 = 2km, 5 = 5km

  // SVG coordinate transformation centered around hub
  // Map dimensions: 800 x 500
  const centerLat = hub.coordinates[0];
  const centerLng = hub.coordinates[1];

  const scaleLat = 18000;
  const scaleLng = 22000;

  const projectPoint = (lat: number, lng: number) => {
    const x = 400 + (lng - centerLng) * scaleLng;
    const y = 250 - (lat - centerLat) * scaleLat;
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(460, y)) };
  };

  // Collect all nearby services across properties
  const allServices = useMemo(() => {
    const map = new Map<string, NearbyService>();
    properties.forEach(p => {
      p.nearbyServices?.forEach(s => {
        if (!map.has(s.id)) {
          map.set(s.id, s);
        }
      });
    });
    return Array.from(map.values());
  }, [properties]);

  // Filter properties by radius if set
  const filteredProperties = useMemo(() => {
    if (radiusFilter === 0) return properties;
    return properties.filter(p => {
      const dist = p.commuteOptions[0]?.distanceKm || 0;
      return dist <= radiusFilter;
    });
  }, [properties, radiusFilter]);

  // Filter services by category and radius
  const filteredServices = useMemo(() => {
    return allServices.filter(s => {
      const matchCat = serviceFilter === 'all' || s.category === serviceFilter;
      const matchRadius = radiusFilter === 0 || s.distanceKm <= radiusFilter;
      return matchCat && matchRadius;
    });
  }, [allServices, serviceFilter, radiusFilter]);

  const activeCard = hoveredProperty || selectedProperty;

  return (
    <div className="relative w-full h-[580px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      
      {/* Map Header Controls Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Hub Badge */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white">{hub.name} Campus Zone</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30">
            {filteredProperties.length} Stays Available
          </span>
        </div>

        {/* Filter Controls: Category & Radius */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          
          {/* Category Filter */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2 py-1 rounded-xl flex items-center gap-1 shadow-lg overflow-x-auto max-w-[280px] sm:max-w-none">
            {[
              { id: 'all', label: 'All Places' },
              { id: 'transit', label: 'Transit 🚌' },
              { id: 'healthcare', label: 'Medical 🏥' },
              { id: 'food', label: 'Food 🍽️' },
              { id: 'grocery', label: 'Grocery 🛒' },
              { id: 'safety', label: 'Safety 🛡️' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setServiceFilter(cat.id)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                  serviceFilter === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Radius Filter */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2 py-1 rounded-xl flex items-center gap-1 shadow-lg text-[10px] text-slate-300 font-bold">
            <span className="text-slate-400">Radius:</span>
            {[
              { val: 0, label: 'All' },
              { val: 1, label: '<1 km' },
              { val: 2, label: '<2 km' },
              { val: 5, label: '<5 km' },
            ].map(r => (
              <button
                key={r.val}
                onClick={() => setRadiusFilter(r.val)}
                className={`px-1.5 py-0.5 rounded-md transition-colors ${
                  radiusFilter === r.val
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <svg 
          viewBox="0 0 800 500" 
          className="w-full h-full select-none"
          style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Walking Distance Radius Rings around Campus Center */}
          <circle cx="400" cy="250" r="80" fill="rgba(99, 102, 241, 0.05)" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <text x="400" y="165" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600" opacity="0.7">500m (5 MIN WALK)</text>

          <circle cx="400" cy="250" r="160" fill="rgba(99, 102, 241, 0.02)" stroke="#6366f1" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
          <text x="400" y="85" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600" opacity="0.5">1 km (10-12 MIN WALK)</text>

          {/* Road / Transit Pathways (Stylized) */}
          <path d="M 50 250 L 750 250" stroke="#334155" strokeWidth="3" strokeOpacity="0.5" />
          <path d="M 400 30 L 400 470" stroke="#334155" strokeWidth="3" strokeOpacity="0.5" />
          <path d="M 150 100 Q 400 250 650 400" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" strokeOpacity="0.4" />
          <path d="M 120 400 Q 400 250 680 100" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" strokeOpacity="0.4" />

          {/* Campus Center Landmark Hub */}
          <g transform="translate(400, 250)">
            <circle r="22" fill="#4f46e5" fillOpacity="0.2" className="animate-ping" />
            <circle r="14" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" filter="url(#glow)" />
            <Building2 x="-7" y="-7" width="14" height="14" color="#ffffff" />
            <text y="28" textAnchor="middle" fill="#e0e7ff" fontSize="11" fontWeight="800">
              CAMPUS CENTER
            </text>
          </g>

          {/* University Landmarks */}
          {hub.landmarks.map((lm, idx) => {
            const pos = projectPoint(lm.lat, lm.lng);
            return (
              <g key={idx} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-pointer">
                <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                {lm.type === 'library' && <BookOpen x="-4" y="-4" width="8" height="8" color="#ffffff" />}
                {lm.type === 'metro' && <Train x="-4" y="-4" width="8" height="8" color="#ffffff" />}
                {lm.type === 'cafeteria' && <Utensils x="-4" y="-4" width="8" height="8" color="#ffffff" />}
                {lm.type === 'engineering' && <Zap x="-4" y="-4" width="8" height="8" color="#ffffff" />}
                <text y="-12" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="700" className="drop-shadow-md">
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* Nearby Services Markers */}
          {filteredServices.map((svc) => {
            const pos = projectPoint(svc.latitude, svc.longitude);
            const isHovered = hoveredService?.id === svc.id;

            return (
              <g 
                key={svc.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredService(svc)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <circle 
                  r={isHovered ? "10" : "7"} 
                  fill={svc.category === 'healthcare' ? '#ef4444' : svc.category === 'transit' ? '#0ea5e9' : svc.category === 'grocery' ? '#10b981' : svc.category === 'safety' ? '#6366f1' : '#f59e0b'} 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                />
                <text y="-10" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="700" className="drop-shadow-md">
                  {svc.name.slice(0, 14)}
                </text>
              </g>
            );
          })}

          {/* Property Pins */}
          {filteredProperties.map((prop) => {
            const pos = projectPoint(prop.latitude, prop.longitude);
            const isSelected = selectedProperty?.id === prop.id;
            const isHovered = hoveredProperty?.id === prop.id;
            const minRent = Math.min(...prop.roomOptions.map(r => r.nominalMonthlyRent));
            const safety = calculateSafetyScore(prop);

            return (
              <g
                key={prop.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectProperty(prop)}
                onMouseEnter={() => setHoveredProperty(prop)}
                onMouseLeave={() => setHoveredProperty(null)}
                style={{ transform: isHovered || isSelected ? `translate(${pos.x}px, ${pos.y}px) scale(1.15)` : undefined }}
              >
                {/* Pin Shadow */}
                <ellipse cx="0" cy="18" rx="8" ry="3" fill="#000000" opacity="0.4" />

                {/* Pin Bubble */}
                <rect
                  x="-38"
                  y="-16"
                  width="76"
                  height="26"
                  rx="13"
                  fill={isSelected || isHovered ? '#6366f1' : '#1e293b'}
                  stroke={isSelected || isHovered ? '#ffffff' : '#475569'}
                  strokeWidth={isSelected || isHovered ? '2' : '1'}
                  className="shadow-lg"
                />

                {/* Small pin pointer triangle */}
                <polygon
                  points="-4,10 4,10 0,16"
                  fill={isSelected || isHovered ? '#6366f1' : '#1e293b'}
                />

                {/* Price text on pin */}
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {formatPrice(minRent, currency)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Service Tooltip */}
        {hoveredService && !activeCard && (
          <div className="absolute top-16 left-4 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl p-2.5 shadow-2xl text-xs text-white">
            <div className="flex items-center gap-1.5 font-bold">
              <span>
                {hoveredService.category === 'transit' ? '🚌' :
                 hoveredService.category === 'healthcare' ? '🏥' :
                 hoveredService.category === 'grocery' ? '🛒' :
                 hoveredService.category === 'safety' ? '🛡️' : '📍'}
              </span>
              <span>{hoveredService.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span>{hoveredService.distanceKm} km away</span>
              <span>•</span>
              <span>~{hoveredService.walkTimeMin} min walk</span>
            </div>
          </div>
        )}

        {/* Floating Quick Property Card Preview */}
        {activeCard && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start gap-3">
              <img
                src={activeCard.coverImage || FALLBACK_IMAGE}
                alt={activeCard.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-sm">
                      {activeCard.category}
                    </span>
                    {(activeCard.verified || activeCard.verificationStatus === 'verified') && (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded-sm border border-emerald-500/30">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{activeCard.rating}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white truncate mt-0.5">
                  {activeCard.name}
                </h4>

                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Footprints className="w-3 h-3" />
                  <span>{activeCard.commuteOptions[0]?.durationMin} min walk to campus</span>
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-extrabold text-white">
                      {formatPrice(Math.min(...activeCard.roomOptions.map(r => r.nominalMonthlyRent)), currency)}
                      <span className="text-[10px] font-normal text-slate-400">/mo</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProperty(activeCard)}
                    className="flex items-center gap-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <span>View Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
