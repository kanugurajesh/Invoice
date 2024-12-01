import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import pdf from "pdf-parse";
import { extractDataPrompt } from "../helpers/data";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const transcribePdf = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.json({ message: "No file uploaded" });
    return;
  }

  const pdfBuffer = fs.readFileSync(req.file.path);

  const data = await pdf(pdfBuffer);

  const text = data.text;

  fs.unlinkSync(req.file.path);

  const response = await model.generateContent(extractDataPrompt + text);

  const extractedData = response.response.text();

  console.log(extractedData);

  const jsonString = JSON.parse(
    extractedData.slice(8, extractedData.length - 4)
  );

  if (jsonString.error) {
    res.json({ message: jsonString.error });
    return;
  }

  res.json(jsonString);

  return;
  
};

const transcribeImage = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe Image" });
};

const transcribeExcel = async (req: Request, res: Response) => {
  if (!req.file) {
    res.json({ message: "No file uploaded" });
    return;
  }

  

};

export { transcribePdf, transcribeImage, transcribeExcel };