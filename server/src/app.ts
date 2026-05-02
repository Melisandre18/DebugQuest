import "dotenv/config"; // must be first — loads .env before Prisma reads DATABASE_URL
import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "DebugQuest API running" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Run: netstat -ano | findstr ":${PORT}" then taskkill /PID <pid> /F`);
    process.exit(1);
  } else {
    throw err;
  }
});
