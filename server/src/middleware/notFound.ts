import { NextFunction, Request, Response } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
    errorSources: [
      {
        path: req.originalUrl,
        message: "Route not found",
      },
    ],
  });
};

export default notFound;
