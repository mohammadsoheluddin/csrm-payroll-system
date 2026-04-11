import { Error } from "mongoose";
import { TGenericErrorResponse } from "../interface/error";

const handleCastError = (err: Error.CastError): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid ID",
    errorSources: [
      {
        path: err.path,
        message: err.message,
      },
    ],
  };
};

export default handleCastError;
