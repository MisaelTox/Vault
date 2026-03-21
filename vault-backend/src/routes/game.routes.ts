import { Router } from "express";
import { searchGames, addGame, getGames, updateStatus, deleteGame } from "../controllers/game.controller";

const router = Router();

router.get("/search", searchGames);
router.get("/", getGames);
router.post("/", addGame);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteGame);

export default router;
