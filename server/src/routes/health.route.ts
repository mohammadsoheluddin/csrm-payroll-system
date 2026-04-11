import { Router } from "express";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

const router = Router();

router.get(
  "/health",
  catchAsync(async (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Server is healthy",
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

export default router;
