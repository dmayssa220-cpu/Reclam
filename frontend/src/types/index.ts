export type Role = 'ADMIN' | 'SUPERVISEUR' | 'TECHNICIEN' | 'CITOYEN' | 'ANALYSTE';

export type Gravite = 'faible' | 'moyenne' | 'critique';

export type Statut =
  | 'NOUVEAU'
  | 'QUALIFIE'
  | 'ASSIGNE'
  | 'EN_COURS'
  | 'RESOLU'
  | 'A_VALIDER'
  | 'CLOTURE'
  | 'REJETE'
  | 'DOUBLON';

export interface User {
  id: number;
  name: string;
  email: string;
  zone?: string | null;
  telephone?: string | null;
  is_active?: boolean;
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
  photo_url: string | null;
  created_at: string;
  user?: Pick<User, 'id' | 'name'>;
}

export interface Reclamation {
  id: number;
  reference: string;
  user_id: number;
  superviseur_id: number | null;
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
  preuve_photo_url: string | null;
  preuve_commentaire: string | null;
  duree_intervention: number | null;
  valide_par: number | null;
  valide_at: string | null;
  parent_id: number | null;
  is_recurrence: boolean;
  date_prevue: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  user?: Pick<User, 'id' | 'name' | 'email'>;
  superviseur?: Pick<User, 'id' | 'name' | 'email' | 'zone'>;
  technicien?: Pick<User, 'id' | 'name' | 'email' | 'zone'>;
  validePar?: Pick<User, 'id' | 'name'>;
  parent?: Pick<Reclamation, 'id' | 'reference' | 'titre'>;
  recurrences?: Reclamation[];
  updates?: ReclamationUpdate[];

  // Accesseurs Laravel
  age_heures?: number;
  duree_resolution_heures?: number;
  etape_workflow?: string;
  est_cloturable?: boolean;
  recurrences_count?: number;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  unread_count?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
  zone: string | null;
  en_cours?: number;
}