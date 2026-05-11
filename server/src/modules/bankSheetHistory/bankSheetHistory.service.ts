import BankSheetHistory from "./bankSheetHistory.model";

import { createFinancialRecordSoftDeleteHandlers } from "../../common/financialRecordSoftDelete";
const getAllBankSheetHistoryFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.payrollMonth) {
    filter.payrollMonth = query.payrollMonth;
  }

  if (query.exportType) {
    filter.exportType = query.exportType;
  }

  const result = await BankSheetHistory.find(filter)
    .populate("company")
    .populate("generatedBy")
    .populate("sourceAccount")
    .sort({ createdAt: -1 });

  const meta = {
    total: result.length,
  };

  return {
    meta,
    result,
  };
};


const {
  getDeletedRecordsFromDB: getDeletedBankSheetHistoryFromDB,
  softDeleteRecordFromDB: softDeleteBankSheetHistoryFromDB,
  restoreRecordIntoDB: restoreBankSheetHistoryIntoDB,
} = createFinancialRecordSoftDeleteHandlers({
  model: BankSheetHistory,
  recordName: "Bank Sheet History",
  queryFields: ['company', 'payrollMonth', 'exportType'],
  restoreUniqueFields: ['company', 'payrollMonth', 'exportType', 'fileName'],
});

export const BankSheetHistoryServices = {
  getAllBankSheetHistoryFromDB,

  getDeletedBankSheetHistoryFromDB,
  softDeleteBankSheetHistoryFromDB,
  restoreBankSheetHistoryIntoDB,
};
