import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractDataPrompt } from "../helpers/data";
import multer from "multer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const transcribePdf = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe PDF" });
};

const transcribeImage = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe Image" });
};

const transcribeExcel = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe Excel" });
};

export { transcribePdf, transcribeImage, transcribeExcel };
