import axios from 'axios';

export class IgdbService {
  private static accessToken: string | null = null;
  private static tokenExpiresAt: number = 0;
  private static clientId = process.env.IGDB_CLIENT_ID;
  private static clientSecret = process.env.IGDB_CLIENT_SECRET;

  private static async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) return this.accessToken;
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`
    );
    this.accessToken = response.data.access_token;
    // expires_in viene en segundos, restamos 60s de margen
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  static async search(query: string) {
    const token = await this.getAccessToken();
    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${query}"; fields name, cover.url, first_release_date, summary, platforms.name; limit 10;`,
      {
        headers: {
          'Client-ID': this.clientId || '',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    return response.data.map((game: any) => ({
      externalId: game.id,
      name: game.name,
      releaseYear: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : 'N/A',
      coverImage: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_720p')}` : 'https://via.placeholder.com/150',
      short_description: game.summary || "No description available",
      platform: game.platforms?.[0]?.name || "PC"
    }));
  }

  static async searchById(id: number) {
    const token = await this.getAccessToken();
    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `fields name, cover.url, first_release_date, summary, platforms.name; where id = ${id};`,
      {
        headers: {
          'Client-ID': this.clientId || '',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    
    return response.data.map((game: any) => ({
      name: game.name,
      releaseYear: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : 2024,
      coverImage: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_720p')}` : 'https://via.placeholder.com/150',
      short_description: game.summary || "No description",
      platform: game.platforms?.[0]?.name || "PC"
    }));
  }
}