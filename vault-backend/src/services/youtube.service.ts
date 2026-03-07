import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

export class YoutubeService {
  /**
   * Busca el ID del trailer oficial en YouTube
   * @param gameName Nombre del juego
   * @returns string con el ID del video (ej: dQw4w9WgXcQ)
   */
  static async getTrailerId(gameName: string): Promise<string> {
    try {
      // Si no hay API Key, devolvemos un video genérico para que el proyecto siga funcionando
      if (!YOUTUBE_API_KEY) {
        console.warn("⚠️ YouTube API Key no configurada. Usando video por defecto.");
        return "dQw4w9WgXcQ"; 
      }

      const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
        params: {
          key: YOUTUBE_API_KEY,
          q: `${gameName} official trailer`,
          part: "id",
          maxResults: 1,
          type: "video"
        }
      });

      // Extraemos el videoId del primer resultado
      const videoId = response.data.items[0]?.id?.videoId;

      if (!videoId) {
        console.log(`🔎 No se encontró trailer para: ${gameName}`);
        return "dQw4w9WgXcQ";
      }

      return videoId;
    } catch (error: any) {
      console.error("❌ Error en YouTube Service:", error.response?.data || error.message);
      // Devolvemos el video por defecto en caso de error de cuota o red
      return "dQw4w9WgXcQ"; 
    }
  }
}