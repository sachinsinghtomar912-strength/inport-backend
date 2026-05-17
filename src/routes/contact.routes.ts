import express from "express";
import multer from "multer";
import { sendContactRequest } from "../controllers/contact.controller";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post("/contact", upload.single("attachment"), sendContactRequest);

export default router;