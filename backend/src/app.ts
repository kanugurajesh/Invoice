import express, { Request, Response } from "express";
import router from "./routes";

const app = express();
const port = 3000;

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
