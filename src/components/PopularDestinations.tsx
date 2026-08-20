import React from 'react';
import { MapPin, ArrowRight, Building2, Sparkles, Compass } from 'lucide-react';
import { UniversityHub } from '../types';
import { UNIVERSITY_HUBS } from '../data/mockData';

interface PopularDestinationsProps {
  selectedHub: UniversityHub;
  onSelectHub: (hub: UniversityHub) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  selectedHub,
  onSelectHub,
}) => {
  // Curated showcase hubs representing major student zones
  const featuredHubs = [
    {
      hub: UNIVERSITY_HUBS.find(h => h.id === 'univ-hp-01') || UNIVERSITY_HUBS[0],
      tag: 'Hilltop Campus Hub',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
      tagline: 'Scenic mountain PGs with heating & chef meals',
    },
    {
      hub: UNIVERSITY_HUBS.find(h => h.id === 'univ-pb-01') || UNIVERSITY_HUBS[4] || UNIVERSITY_HUBS[1],
      tag: 'North Education Zone',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
      tagline: 'High-speed fiber co-living steps from gate',
    },
    {
      hub: UNIVERSITY_HUBS.find(h => h.id === 'univ-ch-01') || UNIVERSITY_HUBS[6] || UNIVERSITY_HUBS[2],
      tag: 'City Tech Corridor',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
      tagline: 'Modern studios with gym, library & shuttle',
    },
    {
      hub: UNIVERSITY_HUBS.find(h => h.id === 'univ-dl-01') || UNIVERSITY_HUBS[8] || UNIVERSITY_HUBS[3],
      tag: 'Metro Campus Belt',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80',
      tagline: 'Prime student residences near North Campus',
    },
  ];

  return (
    <section className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Campus Exploration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-0.5">
            Popular Student Destinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Select your university hub to find verified stays within walking distance of class
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold self-start sm:self-auto">
          {UNIVERSITY_HUBS.length} Universities Active
        </span>
      </div>

      {/* Hub Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredHubs.map(({ hub, tag, badgeColor, image, tagline }) => {
          if (!hub) return null;
          const isCurrent = selectedHub.id === hub.id;
          return (
            <div
              key={hub.id}
              onClick={() => onSelectHub(hub)}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 min-h-[170px] ${
                isCurrent
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 -translate-y-1'
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 bg-white'
              }`}
            >
              {/* Background Image with Dark Vignette */}
              <div className="absolute inset-0 z-0">
                <img
                  src={image}
                  alt={hub.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
              </div>

              {/* Top Tag & Active Indicator */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${badgeColor}`}>
                  {tag}
                </span>

                {isCurrent && (
                  <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Current Hub
                  </span>
                )}
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 space-y-1 text-white mt-8">
                <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-semibold">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>{hub.city}</span>
                </div>

                <h3 className="text-sm font-black text-white font-['Outfit',sans-serif] line-clamp-1 group-hover:text-indigo-200 transition-colors">
                  {hub.shortName}
                </h3>

                <p className="text-[11px] text-slate-300 line-clamp-1 font-normal">
                  {tagline}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
                  <span>Avg from ₹{hub.avgRentRange.min.toLocaleString('en-IN')}/mo</span>
                  <span className="text-indigo-300 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
