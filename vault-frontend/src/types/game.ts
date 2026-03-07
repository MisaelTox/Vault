export interface Game {
  id: string;
  name: string;
  releaseYear: number;
  coverImage: string;
  description: string;
  platforms: string[];
  youtubeVideoId: string;
  addedBy: string;
}

export interface GameSearchResponse {
  externalId: number;
  name: string;
  releaseYear: number;
  coverImage: string;
}