import { Router } from "express";
import { login, getUsers } from "../controllers/auth.controller";

const router = Router();

router.get("/users", getUsers);   // lista de usuarios disponibles
router.post("/login", login);     // validar PIN

export default router;
