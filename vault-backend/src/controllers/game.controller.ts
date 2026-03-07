import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IgdbService } from "../services/igdb.service";
import { YoutubeService } from "../services/youtube.service";
import { Game } from "../models/game.model";

let gamesDB: Game[] = [];

export const searchGames = async (req: Request, res: Response) => {
  const query = req.query.query as string;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await IgdbService.search(query);
    return res.json(results);
  } catch (error) {
    console.error("❌ Error en búsqueda IGDB:", error);
    return res.status(500).json({ error: "Error searching games in IGDB" });
  }
};

export const addGame = async (req: Request, res: Response) => {
  const { externalId, addedBy } = req.body;

  if (!externalId || !addedBy) {
    return res.status(400).json({ error: "externalId and addedBy are required" });
  }

  try {
    const games = await IgdbService.searchById(Number(externalId)); // Forzamos a que sea número
    const gameData = games[0];

    if (!gameData) return res.status(404).json({ error: "Game not found in IGDB" });

    const trailerId = await YoutubeService.getTrailerId(gameData.name);

    const newGame: Game = {
      id: uuidv4(),
      name: gameData.name,
      releaseYear: gameData.releaseYear,
      coverImage: gameData.coverImage,
      description: gameData.short_description,
      platforms: [gameData.platform],
      youtubeVideoId: trailerId,
      addedBy: addedBy,
      createdAt: new Date().toISOString()
    };

    gamesDB.push(newGame);
    return res.status(201).json(newGame);
  } catch (error) {
    console.error("❌ Error adding game from IGDB:", error);
    return res.status(500).json({ error: "Failed to add game to Vault" });
  }
};

export const getGames = (req: Request, res: Response) => res.json(gamesDB);

export const deleteGame = (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = gamesDB.length;
  gamesDB = gamesDB.filter(game => game.id !== id);
  if (gamesDB.length === initialLength) return res.status(404).json({ error: "Game not found" });
  return res.status(204).send();
};