import dns from "node:dns";
import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

dns.setServers(["8.8.8.8"]);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`KhataX API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();