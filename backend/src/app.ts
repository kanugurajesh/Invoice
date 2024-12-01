import express, { Request, Response } from "express";
import router from "./routes";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use("/transcribe", router);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});