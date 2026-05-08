import BankSheetHistory from "./bankSheetHistory.model";

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

export const BankSheetHistoryServices = {
  getAllBankSheetHistoryFromDB,
};
