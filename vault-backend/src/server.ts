import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Vault backend running on http://localhost:${PORT}`);
});