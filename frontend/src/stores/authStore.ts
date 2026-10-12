import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Role, User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  init: () => {
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw), initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post<AuthResponse>('/login', { email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password, password_confirmation) => {
    set({ loading: true });
    try {
      const { data } = await api.post<AuthResponse>('/register', {
        name, email, password, password_confirmation,
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } finally {
      set({ loading: false });
    }
  },

 logout: async () => {
  try {
    await api.post('/logout');
  } catch {
    
  }
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  set({ user: null, token: null });

  
  const { useNotificationStore } = await import('./notificationStore');
  useNotificationStore.getState().reset();
},

  fetchMe: async () => {
    const { data } = await api.get<User>('/me');
    localStorage.setItem('auth_user', JSON.stringify(data));
    set({ user: data });
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    const userRoles = user.roles.map((r) => r.name);
    const target = Array.isArray(roles) ? roles : [roles];
    return target.some((role) => userRoles.includes(role));
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    return user.permissions.some((p) => p.name === permission);
  },
}));