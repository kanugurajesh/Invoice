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

const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

const transcribeImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    
    const imageBase64 = imageBuffer.toString('base64');

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: req.file.mimetype
      }
    };

    const result = await visionModel.generateContent([
      extractDataPrompt,
      imagePart
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(req.file.path);

    try {
      const jsonString = JSON.parse(
        text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
      );

      if (jsonString.error) {
        res.status(400).json({ message: jsonString.error });
        return;
      }

      res.json(jsonString);
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      console.log("Raw response:", text);
      res.status(500).json({ 
        message: "Failed to parse response data",
        rawResponse: text 
      });
    }

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ 
      message: "Failed to process image",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export { transcribePdf, transcribeImage };