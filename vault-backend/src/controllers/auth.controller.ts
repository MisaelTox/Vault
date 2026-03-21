import { Request, Response } from "express";
import { env } from "../config/env";

const USERS: Record<string, string> = {
  Tox: env.PIN_TOX,
  Jedis: env.PIN_JEDIS,
  Chango: env.PIN_CHANGO,
};

export const login = (req: Request, res: Response) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: "username and pin are required" });
  }

  const expectedPin = USERS[username];
  if (!expectedPin || pin !== expectedPin) {
    return res.status(401).json({ error: "Invalid username or PIN" });
  }

  return res.json({ username });
};

export const getUsers = (_req: Request, res: Response) => {
  return res.json(Object.keys(USERS));
};
