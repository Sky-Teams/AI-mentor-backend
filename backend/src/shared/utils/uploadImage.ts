import multer from "multer";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
mkdirSync(uploadDirectory, { recursive: true });

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = file.mimetype.split("/")[1] || "bin";
      callback(null, `${crypto.randomUUID()}.${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(
      null,
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
    );
  },
});

export const removeUploadedFile = (filePath: string) =>
  unlink(filePath).catch(() => undefined);
