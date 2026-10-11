import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { IncidentMarker } from './IncidentMarker';
import { MapLegend } from './MapLegend';
import { CreateFromMapModal } from './CreateFromMapModal';
import type { Reclamation } from '@/types';

interface Props {
  reclamations: Reclamation[];
  onCreateFromMap?: (r: Reclamation) => void;
  enableCreate?: boolean;
  zones?: string[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

/**
 * Hook interne : capture les clics sur la carte.
 */
function MapClickHandler({
  onClick,
  enabled,
}: {
  onClick: (lat: number, lng: number) => void;
  enabled: boolean;
}) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function IncidentMap({
  reclamations,
  onCreateFromMap,
  enableCreate = false,
  zones = [],
  center = [36.8065, 10.1815], // Tunis
  zoom = 12,
  height = 'h-[600px]',
}: Props) {
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Filtre les réclamations sans coordonnées
  const validReclamations = useMemo(
    () => reclamations.filter((r) => r.latitude != null && r.longitude != null),
    [reclamations]
  );

  const handleMapClick = (lat: number, lng: number) => {
    setClickCoords({ lat, lng });
  };

  const handleCreated = (r: Reclamation) => {
    onCreateFromMap?.(r);
  };

  return (
    <>
      <div className={`relative ${height} rounded-xl overflow-hidden border border-slate-200 shadow-sm`}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          {/* Fond de carte OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Contrôle de zoom personnalisé */}
          <ZoomControl position="topright" />

          {/* Capture des clics pour création */}
          <MapClickHandler
            onClick={handleMapClick}
            enabled={enableCreate}
          />

          {/* Marqueurs groupés */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {validReclamations.map((r) => (
              <IncidentMarker key={r.id} reclamation={r} />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Bandeau d'info si création activée */}
        {enableCreate && (
          <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-sky-200 bg-sky-50/95 backdrop-blur-sm px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-sky-800">
              💡 Cliquez sur la carte pour créer une réclamation
            </p>
          </div>
        )}

        {/* Légende */}
        <MapLegend />
      </div>

      {}
      {clickCoords && (
        <CreateFromMapModal
          latitude={clickCoords.lat}
          longitude={clickCoords.lng}
          zones={zones}
          onClose={() => setClickCoords(null)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}