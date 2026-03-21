import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IgdbService } from "../services/igdb.service";
import { YoutubeService } from "../services/youtube.service";
import { DynamoService } from "../services/dynamo.service";
import { Game, GameStatus } from "../models/game.model";

const VALID_STATUSES: GameStatus[] = ['Pendiente', 'Jugando', 'Jugado', 'Abandonado'];

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
    const games = await IgdbService.searchById(Number(externalId));
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
      addedBy,
      createdAt: new Date().toISOString(),
      status: 'Pendiente',
    };

    await DynamoService.putGame(newGame);
    return res.status(201).json(newGame);
  } catch (error) {
    console.error("❌ Error adding game from IGDB:", error);
    return res.status(500).json({ error: "Failed to add game to Vault" });
  }
};

export const getGames = async (req: Request, res: Response) => {
  const raw = req.query.user;
  const filterByUser = typeof raw === 'string' ? raw : undefined;
  try {
    const games = await DynamoService.getAllGames(filterByUser);
    return res.json(games);
  } catch (error) {
    console.error("❌ Error fetching games:", error);
    return res.status(500).json({ error: "Failed to fetch games from Vault" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    await DynamoService.updateStatus(id, status);
    return res.json({ id, status });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

export const deleteGame = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await DynamoService.deleteGame(id);
    return res.status(204).send();
  } catch (error) {
    console.error("❌ Error deleting game:", error);
    return res.status(500).json({ error: "Failed to delete game" });
  }
};
