import axios from "axios";

export class RawgService {
  // Ahora usamos FreeToGame para no depender de Keys rotas
  private static BASE_URL = "https://www.freetogame.com/api";

  static async search(query: string) {
    try {
      // Esta API devuelve todos los juegos, así que filtramos por nombre
      const response = await axios.get(`${this.BASE_URL}/games`);
      
      const filtered = response.data
        .filter((g: any) => g.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // Solo los primeros 5 resultados

      return filtered.map((game: any) => ({
        externalId: game.id,
        name: game.title,
        releaseYear: parseInt(game.release_date?.split("-")[0]) || 2024,
        coverImage: game.thumbnail
      }));
    } catch (error) {
      console.error("❌ Error en FreeToGame Service:", error);
      throw error;
    }
  }

  static async getDetails(id: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/game`, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo detalles:", error);
      throw error;
    }
  }
}