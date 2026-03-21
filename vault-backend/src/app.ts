import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes";
import authRoutes from "./routes/auth.routes";
import { env } from "./config/env";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/games", gameRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
