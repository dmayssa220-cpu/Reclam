import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AppNotification {
  id: string;
  type: string;
  data: {
    type: string;
    message: string;
    url?: string;
    reference?: string;
    reclamation_id?: number;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  currentPage: number;
  lastPage: number;
  total: number;

  fetchNotifications: (page?: number, filtre?: 'all' | 'unread' | 'read') => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  currentPage: 1,
  lastPage: 1,
  total: 0,

  fetchNotifications: async (page = 1, filtre = 'all') => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications', {
        params: { page, filtre, per_page: 20 },
      });
      set({
        notifications: data.data,
        currentPage: data.current_page,
        lastPage: data.last_page,
        total: data.total,
        unreadCount: data.unread_count,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.count });
    } catch {
      // silent fail (token expiré géré par l'intercepteur Axios)
    }
  },

  markAsRead: async (id) => {
    try {
      const { data } = await api.post(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: data.unread_count,
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      const { data } = await api.post('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
        unreadCount: data.unread_count,
      }));
    } catch {
      // silent
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        total: Math.max(0, state.total - 1),
      }));
      await get().fetchUnreadCount();
    } catch {
      // silent
    }
  },

  reset: () => set({
    notifications: [],
    unreadCount: 0,
    currentPage: 1,
    lastPage: 1,
    total: 0,
  }),
}));