import dotenv from "dotenv";
dotenv.config(); // 👈 ¡ESTA ES LA MAGIA QUE CARGA TU API KEY!

import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Vault Server is LIVE at http://localhost:${PORT}`);
  console.log(`Press CTRL+C to stop`);
});