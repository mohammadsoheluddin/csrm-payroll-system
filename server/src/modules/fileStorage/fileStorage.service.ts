import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import AppError from "../../errors/AppError";
import type {
  TRawFileUploadInput,
  TStoredFile,
  TStoredFileReadResult,
} from "./fileStorage.interface";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

const STORAGE_ROOT_DIR = path.resolve(process.cwd(), "storage");
const MAX_SAFE_FILE_NAME_LENGTH = 180;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

const ALLOWED_FILE_EXTENSIONS = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "ppt",
  "pptx",
]);

const ALLOWED_MIME_TYPES = new Set([
  ...Object.keys(MIME_EXTENSION_MAP),
  "application/octet-stream",
]);

const getDateParts = () => {
  const date = new Date();

  return {
    year: String(date.getUTCFullYear()),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
  };
};

const sanitizePathSegment = (value: string, fallback: string) => {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SAFE_FILE_NAME_LENGTH);

  return sanitized || fallback;
};

const getExtensionFromFileName = (fileName: string) => {
  const extension = path.extname(fileName).replace(".", "").toLowerCase();

  return extension;
};

const normalizeMimeType = (mimeType?: string) => {
  const normalized = (mimeType || "application/octet-stream")
    .split(";")[0]
    .trim()
    .toLowerCase();

  return normalized || "application/octet-stream";
};

const ensureAllowedFileType = (extension: string, mimeType: string) => {
  if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Unsupported file extension: ${extension || "unknown"}`,
    );
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Unsupported file MIME type: ${mimeType}`,
    );
  }
};

const getStorageRootDir = () => STORAGE_ROOT_DIR;

const resolveStoragePath = (storagePath: string) => {
  const absolutePath = path.resolve(STORAGE_ROOT_DIR, storagePath);

  if (!absolutePath.startsWith(STORAGE_ROOT_DIR)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid storage path");
  }

  return absolutePath;
};

const saveRawFile = async (input: TRawFileUploadInput): Promise<TStoredFile> => {
  if (!Buffer.isBuffer(input.buffer) || input.buffer.length === 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Uploaded file is required");
  }

  const originalFileName = sanitizePathSegment(
    input.originalFileName || "uploaded-file",
    "uploaded-file",
  );
  const mimeType = normalizeMimeType(input.mimeType);
  const extensionFromName = getExtensionFromFileName(originalFileName);
  const extensionFromMime = MIME_EXTENSION_MAP[mimeType];
  const fileExtension = extensionFromName || extensionFromMime || "bin";

  ensureAllowedFileType(fileExtension, mimeType);

  const { year, month } = getDateParts();
  const moduleName = sanitizePathSegment(input.moduleName, "general");
  const ownerId = sanitizePathSegment(input.ownerId || "unassigned", "unassigned");
  const checksum = crypto.createHash("sha256").update(input.buffer).digest("hex");
  const baseName = sanitizePathSegment(
    path.basename(originalFileName, path.extname(originalFileName)),
    "document",
  );
  const uniqueSuffix = `${Date.now()}-${checksum.slice(0, 12)}`;
  const fileName = `${baseName}-${uniqueSuffix}.${fileExtension}`;
  const relativeDirectory = path.join(moduleName, year, month, ownerId);
  const absoluteDirectory = path.join(STORAGE_ROOT_DIR, relativeDirectory);
  const absolutePath = path.join(absoluteDirectory, fileName);
  const storagePath = path.join(relativeDirectory, fileName).replace(/\\/g, "/");

  await fs.mkdir(absoluteDirectory, { recursive: true });
  await fs.writeFile(absolutePath, input.buffer);

  return {
    provider: "local",
    originalFileName,
    fileName,
    fileExtension,
    mimeType,
    fileSize: input.buffer.length,
    checksum,
    storagePath,
    absolutePath,
  };
};

const getStoredFileForRead = async (input: {
  storagePath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}): Promise<TStoredFileReadResult> => {
  if (!input.storagePath) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Stored file path is missing");
  }

  const absolutePath = resolveStoragePath(input.storagePath);

  try {
    const stat = await fs.stat(absolutePath);

    if (!stat.isFile()) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Stored file not found");
    }

    return {
      absolutePath,
      fileName: input.fileName || path.basename(absolutePath),
      mimeType: input.mimeType || "application/octet-stream",
      fileSize: input.fileSize || stat.size,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(HTTP_STATUS.NOT_FOUND, "Stored file not found");
  }
};

export const FileStorageServices = {
  getStorageRootDir,
  saveRawFile,
  getStoredFileForRead,
};
