import { Router } from 'express';
import { transcribePdf, transcribeImage, transcribeExcel } from '../controllers/transcribe';
const router = Router();

router.post("/pdf", transcribePdf)

router.post("/excel", transcribeExcel)

router.post("/image", transcribeImage)

export default router;