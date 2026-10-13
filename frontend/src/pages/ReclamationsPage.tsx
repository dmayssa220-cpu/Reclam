import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Search, Filter, X, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, ListFilter,
} from 'lucide-react';

import { reclamationService, type ReclamationFilters } from '@/services/reclamationService';
import { ReclamationRow } from '@/components/reclamations/ReclamationRow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import type { Reclamation, Statut, Gravite } from '@/types';
import { cn } from '@/lib/utils';

const STATUTS: { value: Statut | ''; label: string }[] = [
  { value: '',          label: 'Tous statuts' },
  { value: 'NOUVEAU',   label: 'Nouveau' },
  { value: 'ASSIGNE',   label: 'Assigné' },
  { value: 'EN_COURS',  label: 'En cours' },
  { value: 'A_VALIDER', label: 'À valider' },
  { value: 'CLOTURE',   label: 'Clôturé' },
  { value: 'REJETE',    label: 'Rejeté' },
];

const GRAVITES: { value: Gravite | ''; label: string; color: string }[] = [
  { value: '',         label: 'Toutes',   color: 'bg-slate-400' },
  { value: 'critique', label: 'Critique', color: 'bg-red-500' },
  { value: 'moyenne',  label: 'Moyenne',  color: 'bg-amber-500' },
  { value: 'faible',   label: 'Faible',   color: 'bg-emerald-500' },
];

export function ReclamationsPage() {
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuthStore();

  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filtres initiaux depuis URL
  const [filters, setFilters] = useState<ReclamationFilters>({
    statut:         (searchParams.get('statut') as Statut) || '',
    gravite:        (searchParams.get('gravite') as Gravite) || '',
    zone:           searchParams.get('zone') || '',
    search:         searchParams.get('search') || '',
    is_recurrence:  searchParams.get('is_recurrence') === 'true' ? true : undefined,
    per_page:       15,
    page:           1,
  });

  const zones = useMemo(() => {
    const set = new Set<string>();
    reclamations.forEach((r) => r.zone && set.add(r.zone));
    return Array.from(set).sort();
  }, [reclamations]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reclamationService.list({ ...filters, page });
      setReclamations(res.data);
      setTotal(res.total);
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.statut, filters.gravite, filters.zone, filters.is_recurrence]);

  // Debounce sur la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      if (filters.search !== (searchParams.get('search') || '')) {
        fetchData(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const hasActiveFilters =
    filters.statut !== '' ||
    filters.gravite !== '' ||
    filters.zone !== '' ||
    filters.search !== '' ||
    filters.is_recurrence === true;

  const resetFilters = () => {
    setFilters({
      statut: '', gravite: '', zone: '', search: '',
      is_recurrence: undefined, per_page: 15, page: 1,
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réclamations</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} réclamation{total > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(currentPage)}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualiser
          </Button>

          {hasPermission('create-reclamation') && (
            <Link to="/carte">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nouvelle
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Barre de recherche + toggle filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Rechercher par référence, titre, adresse…"
            icon={<Search className="h-4 w-4" />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Gravité */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gravité</p>
              <div className="flex flex-wrap gap-1.5">
                {GRAVITES.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setFilters({ ...filters, gravite: g.value })}
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

            {/* Statut + Zone + Récurrence */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({ ...filters, statut: e.target.value as Statut | '' })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Zone
                </label>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Toutes</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </label>
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      is_recurrence: filters.is_recurrence ? undefined : true,
                    })
                  }
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                    filters.is_recurrence
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  🔁 Récurrences uniquement
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {/* En-tête du tableau (desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-4">Réclamation</div>
            <div className="col-span-2">Zone / Gravité</div>
            <div className="col-span-2">Assignations</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-2 text-right">Créée</div>
          </div>

          {/* Corps */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reclamations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ListFilter className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">Aucune réclamation</p>
              <p className="text-xs text-slate-500 mt-1">
                {hasActiveFilters ? 'Essayez de modifier les filtres.' : 'Commencez par en créer une.'}
              </p>
            </div>
          ) : (
            <div>
              {reclamations.map((r) => (
                <ReclamationRow key={r.id} reclamation={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} sur {lastPage} — {total} résultat{total > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => fetchData(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= lastPage || loading}
              onClick={() => fetchData(currentPage + 1)}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}