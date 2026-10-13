import { api } from '@/lib/api';
import type {
  Reclamation, Paginated, Statut, Gravite, AssignableUser,
} from '@/types';

export interface ReclamationFilters {
  statut?: Statut | '';
  gravite?: Gravite | '';
  zone?: string;
  search?: string;
  superviseur_id?: number | '';
  technicien_id?: number | '';
  is_recurrence?: boolean;
  per_page?: number;
  page?: number;
}

export const reclamationService = {
  // ==========================================
  // CRUD
  // ==========================================

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

  async remove(id: number): Promise<void> {
    await api.delete(`/reclamations/${id}`);
  },

  // ==========================================
  // Workflow
  // ==========================================

  async updateStatut(id: number, statut: Statut, commentaire?: string): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/statut`, {
      statut,
      commentaire,
    });
    return data;
  },

  async assignSupervisor(id: number, superviseurId: number): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/assign-supervisor`, {
      superviseur_id: superviseurId,
    });
    return data;
  },

  async assignTechnician(
    id: number,
    technicienId: number,
    datePrevue?: string
  ): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/assign-technician`, {
      technicien_id: technicienId,
      date_prevue: datePrevue,
    });
    return data;
  },

  async demarrer(id: number, commentaire?: string): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/demarrer`, {
      commentaire,
    });
    return data;
  },

  async resolve(
    id: number,
    payload: {
      preuve_commentaire: string;
      duree_intervention: number;
      preuve_photo_url?: string;
    }
  ): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/resolve`, payload);
    return data;
  },

  async validate(id: number, commentaire?: string): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/validate`, {
      commentaire,
    });
    return data;
  },

  async reject(id: number, commentaire: string): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/reject`, {
      commentaire,
    });
    return data;
  },

  async reopen(id: number, commentaire: string, gravite?: Gravite): Promise<Reclamation> {
    const { data } = await api.patch<Reclamation>(`/reclamations/${id}/reopen`, {
      commentaire,
      gravite,
    });
    return data;
  },

  async addComment(id: number, commentaire: string, photo_url?: string): Promise<Reclamation> {
    const { data } = await api.post(`/reclamations/${id}/comment`, {
      commentaire,
      photo_url,
    });
    return data;
  },

  // ==========================================
  // Carte & récurrences
  // ==========================================

  async allForMap(): Promise<Reclamation[]> {
    const { data } = await api.get<Paginated<Reclamation>>('/reclamations', {
      params: { per_page: 500 },
    });
    return data.data;
  },

  async recurrences(params: { zone?: string; page?: number } = {}): Promise<Paginated<Reclamation>> {
    const { data } = await api.get<Paginated<Reclamation>>('/reclamations/recurrences', {
      params,
    });
    return data;
  },

  async recurrenceGroups(): Promise<{ data: Reclamation[] }> {
    const { data } = await api.get('/reclamations/recurrence-groups');
    return data;
  },

  // ==========================================
  // Utilisateurs assignables
  // ==========================================

  async getSuperviseurs(zone?: string): Promise<AssignableUser[]> {
    const { data } = await api.get<AssignableUser[]>('/users/superviseurs', {
      params: { zone },
    });
    return data;
  },

  async getTechniciens(zone?: string): Promise<AssignableUser[]> {
    const { data } = await api.get<AssignableUser[]>('/users/techniciens', {
      params: { zone },
    });
    return data;
  },

  async getTechniciensAvecCharge(): Promise<AssignableUser[]> {
    const { data } = await api.get<AssignableUser[]>('/users/techniciens/charge');
    return data;
  },
};

export const uploadService = {
  async uploadFile(file: File, type: 'reclamation' | 'preuve' | 'commentaire' = 'preuve'): Promise<{
    url: string;
    path: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const { data } = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};