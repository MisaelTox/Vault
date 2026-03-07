import express from "express";
import cors from "cors"; // 1. Importa esto
import gameRoutes from "./routes/game.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors()); // 2. ¡ESTA LÍNEA ES LA SOLUCIÓN! (Habilita el acceso desde cualquier origen)
app.use(express.json());

app.use("/games", gameRoutes);

export default app;
