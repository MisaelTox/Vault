import axios from 'axios';
import type { Game, GameSearchResponse } from '../types/game';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const vaultApi = {
  // Auth
  login: (username: string, pin: string) =>
    api.post<{ username: string }>('/auth/login', { username, pin }),

  // Juegos
  searchGames: (query: string) =>
    api.get<GameSearchResponse[]>(`/games/search?query=${query}`),
  getVault: (filterByUser?: string) =>
    api.get<Game[]>(`/games${filterByUser ? `?user=${filterByUser}` : ''}`),
  addToVault: (externalId: number, addedBy: string) =>
    api.post<Game>('/games', { externalId, addedBy }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/games/${id}/status`, { status }),
  deleteGame: (id: string) =>
    api.delete(`/games/${id}`),
};
