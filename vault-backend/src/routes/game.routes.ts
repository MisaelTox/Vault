import { Router } from "express";
import { searchGames, addGame, getGames, deleteGame } from "../controllers/game.controller";

const router = Router();

router.get("/search", searchGames); // Buscar en RAWG
router.get("/", getGames);          // Ver mi lista (Vault)
router.post("/", addGame);          // Guardar en mi lista
router.delete("/:id", deleteGame);  // Borrar de mi lista

export default router;