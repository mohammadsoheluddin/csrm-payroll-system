export type TErrorSource = {
  path: string | number;
  message: string;
};

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
};

export type TErrorResponseBody = {
  success: false;
  message: string;
  errorSources: TErrorSource[];
  stack?: string;
};
