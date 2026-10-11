import { api } from '@/lib/api';
import type { Reclamation, Paginated, Statut, Gravite } from '@/types';

export interface ReclamationFilters {
  statut?: Statut | '';
  gravite?: Gravite | '';
  zone?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export const reclamationService = {
  async list(filters: ReclamationFilters = {}): Promise<Paginated<Reclamation>> {
    const { data } = await api.get<Paginated<Reclamation>>('/reclamations', {
      params: filters,
    });
    return data;
  },

  async get(id: number): Promise<Reclamation> {
    const { data } = await api.get<Reclamation>(`/reclamations/${id}`);
    return data;
  },

  async create(payload: Partial<Reclamation>): Promise<Reclamation> {
    const { data } = await api.post<Reclamation>('/reclamations', payload);
    return data;
  },

  async update(id: number, payload: Partial<Reclamation>): Promise<Reclamation> {
    const { data } = await api.put<Reclamation>(`/reclamations/${id}`, payload);
    return data;
  },

  async updateStatut(id: number, statut: Statut, commentaire?: string): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/statut`, {
      statut,
      commentaire,
    });
    return data;
  },

  async assign(id: number, technicien_id: number): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/assign`, {
      technicien_id,
    });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/reclamations/${id}`);
  },

  
  async allForMap(): Promise<Reclamation[]> {
    const { data } = await api.get<Paginated<Reclamation>>('/reclamations', {
      params: { per_page: 500 },
    });
    return data.data;
  },
};