import express from 'express';
import multer from 'multer';
import { transcribePdf, transcribeImage } from '../controllers/transcribe';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/transcribe/pdf', upload.single('file'), transcribePdf);
router.post('/transcribe/image', upload.single('file'), transcribeImage);

export default router;
