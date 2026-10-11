import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, ArrowRight } from 'lucide-react';
import { StatutBadge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/utils';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
}

const createMarkerIcon = (gravite: Reclamation['gravite']) => {
  const emoji =
    gravite === 'critique' ? '⚠' : gravite === 'moyenne' ? '!' : '✓';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${gravite}">
        <span class="marker-pin-inner">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export function IncidentMarker({ reclamation }: Props) {
  if (reclamation.latitude == null || reclamation.longitude == null) return null;

  return (
    <Marker
      position={[reclamation.latitude, reclamation.longitude]}
      icon={createMarkerIcon(reclamation.gravite)}
    >
      <Popup>
        <div className="font-sans">
          {/* En-tête */}
          <div className="water-gradient p-3 text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">
                {reclamation.reference}
              </span>
              <GraviteBadgeInline gravite={reclamation.gravite} />
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug line-clamp-2">
              {reclamation.titre}
            </p>
          </div>

          {/* Corps */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">
                {reclamation.adresse || 'Adresse non renseignée'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{formatRelative(reclamation.created_at)}</span>
            </div>

            {reclamation.user && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{reclamation.user.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <StatutBadge statut={reclamation.statut} />
            </div>
          </div>

          {/* Pied */}
          <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
            <Link
              to={`/reclamations/${reclamation.id}`}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
            >
              Voir les détails <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function GraviteBadgeInline({ gravite }: { gravite: Reclamation['gravite'] }) {
  const colors = {
    critique: 'bg-white/20 border-white/30',
    moyenne: 'bg-white/20 border-white/30',
    faible: 'bg-white/20 border-white/30',
  };
  const labels = { critique: 'Critique', moyenne: 'Moyenne', faible: 'Faible' };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[gravite]}`}
    >
      {labels[gravite]}
    </span>
  );
}