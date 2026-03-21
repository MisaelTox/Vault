export type GameStatus = 'Pendiente' | 'Jugando' | 'Jugado' | 'Abandonado';

export interface Game {
  id: string;
  name: string;
  releaseYear: number;
  coverImage: string;
  description: string;
  platforms: string[];
  youtubeVideoId: string;
  addedBy: string;
  status: GameStatus;
}

export interface GameSearchResponse {
  externalId: number;
  name: string;
  releaseYear: number;
  coverImage: string;
}