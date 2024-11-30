import { Router } from "express";
import {
  transcribePdf,
  transcribeImage,
  transcribeExcel,
} from "../controllers/transcribe";
const router = Router();
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

import { Request as ExpressRequest } from "express";

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
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/pdf", upload.single("file"), transcribePdf);

router.post("/excel", transcribeExcel);

router.post("/image", transcribeImage);

export default router;
