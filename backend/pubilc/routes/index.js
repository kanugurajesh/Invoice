'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const multer_1 = __importDefault(require('multer'));
const transcribe_1 = require('../controllers/transcribe');
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({ storage: storage });
// Debug middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
// Routes
router.post('/transcribe/pdf', upload.single('file'), (req, res, next) => {
  console.log('PDF route hit');
  (0, transcribe_1.transcribePdf)(req, res);
});
router.post('/transcribe/image', upload.single('file'), (req, res, next) => {
  console.log('Image route hit');
  (0, transcribe_1.transcribeImage)(req, res);
});
// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});
exports.default = router;
