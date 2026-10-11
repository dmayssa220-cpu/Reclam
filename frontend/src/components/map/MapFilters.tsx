import { Filter, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Gravite, Statut } from '@/types';

export interface MapFilterState {
  gravite: Gravite | '';
  statut: Statut | '';
  zone: string;
  search: string;
}

interface Props {
  filters: MapFilterState;
  onChange: (filters: MapFilterState) => void;
  zones: string[];
  totalCount: number;
  filteredCount: number;
}

const GRAVITES: { value: Gravite | ''; label: string; color: string }[] = [
  { value: '',         label: 'Toutes',   color: 'bg-slate-400' },
  { value: 'critique', label: 'Critique', color: 'bg-red-500' },
  { value: 'moyenne',  label: 'Moyenne',  color: 'bg-amber-500' },
  { value: 'faible',   label: 'Faible',   color: 'bg-emerald-500' },
];

const STATUTS: { value: Statut | ''; label: string }[] = [
  { value: '',         label: 'Tous' },
  { value: 'NOUVEAU',  label: 'Nouveau' },
  { value: 'ASSIGNE',  label: 'Assigné' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'RESOLU',   label: 'Résolu' },
  { value: 'CLOTURE',  label: 'Clôturé' },
];

export function MapFilters({ filters, onChange, zones, totalCount, filteredCount }: Props) {
  const hasActiveFilters =
    filters.gravite !== '' ||
    filters.statut !== '' ||
    filters.zone !== '' ||
    filters.search !== '';

  const reset = () => {
    onChange({ gravite: '', statut: '', zone: '', search: '' });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-slate-800">Filtres</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filteredCount}</span> / {totalCount}
          </span>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-3 w-3" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Recherche */}
      <Input
        placeholder="Rechercher par référence, titre, adresse…"
        icon={<Search className="h-4 w-4" />}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      {/* Gravité */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gravité</p>
        <div className="flex flex-wrap gap-1.5">
          {GRAVITES.map((g) => (
            <button
              key={g.value}
              onClick={() => onChange({ ...filters, gravite: g.value })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                filters.gravite === g.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', g.color)} />
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statut */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</p>
        <select
          value={filters.statut}
          onChange={(e) => onChange({ ...filters, statut: e.target.value as Statut | '' })}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Zone */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Zone</p>
        <select
          value={filters.zone}
          onChange={(e) => onChange({ ...filters, zone: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Toutes les zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>
    </div>
  );
}