import { Request, Response } from "express";

const transcribePdf = async (req: Request, res: Response) => {
  res.json({ message: "Transcribe PDF" });
};

const transcribeImage = async (req: Request, res: Response) => {
    res.json({ message: "Transcribe Image" });
    }

const transcribeExcel = async(req: Request, res: Response) => {
    res.json({ message: "Transcribe Excel" })
}

export { transcribePdf, transcribeImage, transcribeExcel }