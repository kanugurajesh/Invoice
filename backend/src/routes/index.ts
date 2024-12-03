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
    cb(
      null,
      Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        '-' +
        file.originalname
    );
  },
});

const upload = multer({ storage: storage });

// Debug middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
router.post('/transcribe/pdf', upload.single('file'), (req, res, next) => {
  console.log('PDF route hit');
  transcribePdf(req, res);
});

router.post('/transcribe/image', upload.single('file'), (req, res, next) => {
  console.log('Image route hit');
  transcribeImage(req, res);
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

export default router;
