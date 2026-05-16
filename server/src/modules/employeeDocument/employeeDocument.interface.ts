import { Types } from "mongoose";
import type { TSoftDeleteFields, TSoftDeleteObjectId } from "../../common/softDelete";

export type TEmployeeDocumentCategory =
  | "nid"
  | "birth_certificate"
  | "passport"
  | "photo"
  | "cv"
  | "educational_certificate"
  | "experience_certificate"
  | "appointment_letter"
  | "joining_letter"
  | "confirmation_letter"
  | "increment_letter"
  | "promotion_letter"
  | "transfer_letter"
  | "warning_letter"
  | "show_cause_letter"
  | "termination_letter"
  | "resignation_letter"
  | "clearance"
  | "salary_certificate"
  | "training_certificate"
  | "medical_certificate"
  | "bank_document"
  | "nominee_document"
  | "other";

export type TEmployeeDocumentStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired"
  | "archived";

export type TEmployeeDocumentConfidentiality =
  | "internal"
  | "confidential"
  | "highly_confidential";

export type TEmployeeDocumentStorageProvider =
  | "local"
  | "url"
  | "external"
  | "pending";

export interface TEmployeeDocument extends TSoftDeleteFields {
  employee: Types.ObjectId;
  company: Types.ObjectId;

  category: TEmployeeDocumentCategory;
  title: string;
  documentNo?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;

  fileName: string;
  originalFileName?: string;
  fileExtension?: string;
  mimeType?: string;
  fileSize?: number;
  fileUrl?: string;
  storageProvider: TEmployeeDocumentStorageProvider;
  storagePath?: string;
  checksum?: string;

  confidentiality: TEmployeeDocumentConfidentiality;
  status: TEmployeeDocumentStatus;

  verifiedAt?: Date | null;
  verifiedBy?: TSoftDeleteObjectId;
  verificationRemarks?: string | null;

  rejectedAt?: Date | null;
  rejectedBy?: TSoftDeleteObjectId;
  rejectionReason?: string | null;

  uploadedBy?: TSoftDeleteObjectId;
  remarks?: string;
  tags?: string[];
}

export type TEmployeeDocumentQuery = {
  employee?: string;
  company?: string;
  category?: TEmployeeDocumentCategory;
  status?: TEmployeeDocumentStatus;
  confidentiality?: TEmployeeDocumentConfidentiality;
  storageProvider?: TEmployeeDocumentStorageProvider;
  expiryStatus?: "expired" | "expiring_soon" | "valid" | "no_expiry";
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
};

export type TEmployeeDocumentRawUploadMetadata = {
  employee: string;
  company: string;
  category: TEmployeeDocumentCategory;
  title: string;
  documentNo?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  confidentiality?: TEmployeeDocumentConfidentiality;
  status?: Extract<TEmployeeDocumentStatus, "pending" | "archived">;
  remarks?: string;
  tags?: string[];
};

export type TEmployeeDocumentRawUploadInput = {
  fileBuffer: Buffer;
  originalFileName: string;
  mimeType?: string;
  metadata: TEmployeeDocumentRawUploadMetadata;
};
