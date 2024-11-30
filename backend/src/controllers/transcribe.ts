import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs, { read } from "fs";
import pdf from "pdf-parse";
import { extractDataPrompt } from "../helpers/data";
import multer from "multer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const transcribePdf = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.json({ message: "No file uploaded" });
    return;
  }

  const pdfBuffer = fs.readFileSync(req.file.path);

  const data = await pdf(pdfBuffer);

  const text = data.text;

  console.log(text);

  fs.unlinkSync(req.file.path);

  res.json({ message: "Transcribe PDF" });
  return;
};

const transcribeImage = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe Image" });
};

const transcribeExcel = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe Excel" });
};

export { transcribePdf, transcribeImage, transcribeExcel };
