import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`🚀 Vault Server is LIVE at http://localhost:${env.PORT}`);
  console.log(`Press CTRL+C to stop`);
});
