import axios from 'axios';
import type { Game, GameSearchResponse } from '../types/game'; // Añadimos la palabra 'type'

const api = axios.create({
  baseURL: 'http://192.168.0.21:3000',
});

export const vaultApi = {
  searchGames: (query: string) => api.get<GameSearchResponse[]>(`/games/search?query=${query}`),
  getVault: () => api.get<Game[]>(`/games`),
  addToVault: (externalId: number, addedBy: string) => 
    api.post<Game>('/games', { externalId, addedBy }),
  deleteGame: (id: string) => api.delete(`/games/${id}`),
};