'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.transcribeImage = exports.transcribePdf = void 0;
const generative_ai_1 = require('@google/generative-ai');
const fs_1 = __importDefault(require('fs'));
const pdf_parse_1 = __importDefault(require('pdf-parse'));
const data_1 = require('../helpers/data');
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new generative_ai_1.GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const transcribePdf = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
      res.json({ message: 'No file uploaded' });
      return;
    }
    const pdfBuffer = fs_1.default.readFileSync(req.file.path);
    const data = yield (0, pdf_parse_1.default)(pdfBuffer);
    const text = data.text;
    fs_1.default.unlinkSync(req.file.path);
    const response = yield model.generateContent(
      data_1.extractDataPrompt + text
    );
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
  });
exports.transcribePdf = transcribePdf;
const visionModel = genAI.getGenerativeModel({
  model: 'models/gemini-1.5-pro',
});
const transcribeImage = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let filePath = null;
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      filePath = req.file.path;
      // Validate file size (max 4MB)
      const stats = fs_1.default.statSync(filePath);
      if (stats.size > 4 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 4MB');
      }
      // Validate file type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        throw new Error(
          'Invalid file type. Supported types are JPEG, PNG, and WebP'
        );
      }
      // Read and convert image
      const imageBuffer = fs_1.default.readFileSync(filePath);
      const imageBase64 = imageBuffer.toString('base64');
      console.log('Processing image:', {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: stats.size,
      });
      // Prepare request
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      };
      // Make API request with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      const apiPromise = visionModel.generateContent([
        { text: data_1.extractDataPrompt },
        imagePart,
      ]);
      const result = yield Promise.race([apiPromise, timeoutPromise]);
      const response = yield result.response;
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
        if (filePath && fs_1.default.existsSync(filePath)) {
          fs_1.default.unlinkSync(filePath);
        }
        res.json(parsedData);
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        res.status(422).json({
          message: 'Failed to parse API response',
          error:
            parseError instanceof Error
              ? parseError.message
              : 'Unknown parsing error',
          rawResponse: text,
        });
      }
    } catch (error) {
      console.error('Image processing error:', error);
      // Clean up file if it exists
      if (filePath && fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
      }
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          res.status(503).json({
            message: 'Failed to connect to AI service',
            error: 'Network error - please try again',
          });
        } else if (error.message.includes('timeout')) {
          res.status(504).json({
            message: 'Request timed out',
            error: 'The request took too long to process',
          });
        } else {
          res.status(500).json({
            message: 'Failed to process image',
            error: error.message,
          });
        }
      } else {
        res.status(500).json({
          message: 'Failed to process image',
          error: 'Unknown error occurred',
        });
      }
    }
  });
exports.transcribeImage = transcribeImage;
