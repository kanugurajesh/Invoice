import { Router } from "express";
import multer from "multer";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
} from "express";
import {
  transcribePdf,
  transcribeImage,
  transcribeExcel,
} from "../controllers/transcribe";

// Initialize express router
const router = Router();

// initialize multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Adding file filter to multer to only allow PDF, JPEG, and Excel files
const fileFilter = (
  req: ExpressRequest,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPEG, and Excel files are allowed."
      )
    );
  }
};

// Initialize multer with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

// routes with multer middleware
// @ts-ignore
router.post("/pdf", upload.single("file"), transcribePdf);
router.post("/excel", upload.single("file"), transcribeExcel);
router.post("/image", upload.single("file"), transcribeImage);

// Multer error handling middleware
router.use(
  (
    err: any,
    req: ExpressRequest,
    res: ExpressResponse,
    next: ExpressNextFunction
  ): void => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
    }
    next();
  }
);

export default router;
