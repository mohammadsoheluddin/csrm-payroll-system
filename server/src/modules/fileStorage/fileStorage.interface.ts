export type TFileStorageProvider = "local";

export type TStoredFile = {
  provider: TFileStorageProvider;
  originalFileName: string;
  fileName: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  storagePath: string;
  absolutePath: string;
};

export type TRawFileUploadInput = {
  buffer: Buffer;
  originalFileName: string;
  mimeType?: string;
  moduleName: string;
  ownerId?: string;
};

export type TStoredFileReadResult = {
  absolutePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};
