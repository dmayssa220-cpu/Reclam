import { api } from '@/lib/api';
import type { User, Paginated } from '@/types';

export const userService = {
  async list(params: { role?: string; zone?: string; search?: string; page?: number } = {}): Promise<Paginated<User>> {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async create(payload: Record<string, any>): Promise<User> {
    const { data } = await api.post('/admin/users', payload);
    return data;
  },

  async update(id: number, payload: Record<string, any>): Promise<User> {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async toggleActive(id: number): Promise<User> {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`);
    return data;
  },
};