import { api } from '@/lib/api';
import type { Reclamation } from '@/types';

export interface KpiScalaires {
  total: number;
  resolues: number;
  en_cours: number;
  taux_resolution: number;
  temps_moyen_heures: number;
  taux_sla: number;
  critiques_actives: number;
}

export interface EvolutionPoint {
  date: string;
  label: string;
  creees: number;
  resolues: number;
}

export interface RepartitionItem {
  name: string;
  value: number;
  key?: string;
  color?: string;
}

export interface TopZone {
  name: string;
  value: number;
}

export interface Recurrence {
  total_adresses: number;
  recurrentes: number;
  taux: number;
}

export interface KpiResponse {
  periode: { jours: number; debut: string; fin: string };
  scalaires: KpiScalaires;
  evolution: EvolutionPoint[];
  par_gravite: RepartitionItem[];
  par_statut: RepartitionItem[];
  top_zones: TopZone[];
  recurrence: Recurrence;
}

export const dashboardService = {
  async getKpi(periode = 30): Promise<KpiResponse> {
    const { data } = await api.get<KpiResponse>('/dashboard/kpi', {
      params: { periode },
    });
    return data;
  },

  async getCritiquesEnCours(): Promise<{ data: Reclamation[]; total: number }> {
    const { data } = await api.get('/dashboard/critiques');
    return data;
  },

  async exportCsv(filters: Record<string, any> = {}): Promise<Blob> {
    const { data } = await api.get('/dashboard/export', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};