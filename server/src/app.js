import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "DebugQuest API running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
