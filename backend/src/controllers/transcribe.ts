import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import pdf from "pdf-parse";
import { extractDataPrompt } from "../helpers/data";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

const visionModel = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

const transcribeImage = async (req: Request, res: Response): Promise<void> => {
  let filePath: string | null = null;
  
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    filePath = req.file.path;

    // Validate file size (max 4MB)
    const stats = fs.statSync(filePath);
    if (stats.size > 4 * 1024 * 1024) {
      throw new Error('File size too large. Maximum size is 4MB');
    }

    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      throw new Error('Invalid file type. Supported types are JPEG, PNG, and WebP');
    }

    // Read and convert image
    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');

    console.log('Processing image:', {
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: stats.size
    });

    // Prepare request
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: req.file.mimetype
      }
    };

    // Make API request with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    const apiPromise = visionModel.generateContent([
      { text: extractDataPrompt },
      imagePart
    ]);

    const result = await Promise.race([apiPromise, timeoutPromise]);
    const response = await (result as any).response;
    const text = response.text();

    console.log('Received response from Gemini API');

    // Parse response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid data structure in response');
      }

      // Clean up and send response
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      res.status(422).json({
        message: 'Failed to parse API response',
        error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        rawResponse: text
      });
    }

  } catch (error) {
    console.error('Image processing error:', error);

    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        res.status(503).json({
          message: 'Failed to connect to AI service',
          error: 'Network error - please try again'
        });
      } else if (error.message.includes('timeout')) {
        res.status(504).json({
          message: 'Request timed out',
          error: 'The request took too long to process'
        });
      } else {
        res.status(500).json({
          message: 'Failed to process image',
          error: error.message
        });
      }
    } else {
      res.status(500).json({
        message: 'Failed to process image',
        error: 'Unknown error occurred'
      });
    }
  }
};

export { transcribePdf, transcribeImage };