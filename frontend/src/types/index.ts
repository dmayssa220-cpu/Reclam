export type Role = 'ADMIN' | 'SUPERVISEUR' | 'TECHNICIEN' | 'CITOYEN' | 'ANALYSTE';

export type Gravite = 'faible' | 'moyenne' | 'critique';

export type Statut =
  | 'NOUVEAU'
  | 'QUALIFIE'
  | 'ASSIGNE'
  | 'EN_COURS'
  | 'RESOLU'
  | 'CLOTURE'
  | 'REJETE'
  | 'DOUBLON';

export interface User {
  id: number;
  name: string;
  email: string;
  zone?: string | null;
  roles: { id: number; name: Role }[];
  permissions: { id: number; name: string }[];
}

export interface ReclamationUpdate {
  id: number;
  reclamation_id: number;
  user_id: number;
  ancien_statut: Statut | null;
  nouveau_statut: Statut | null;
  commentaire: string | null;
  created_at: string;
  user?: Pick<User, 'id' | 'name'>;
}

export interface Reclamation {
  id: number;
  reference: string;
  user_id: number;
  technicien_id: number | null;
  titre: string;
  description: string;
  adresse: string | null;
  latitude: number | null;
  longitude: number | null;
  zone: string | null;
  gravite: Gravite;
  statut: Statut;
  ia_score: number | null;
  ia_resume: string | null;
  photo_url: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  technicien?: Pick<User, 'id' | 'name' | 'email'>;
  updates?: ReclamationUpdate[];
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}