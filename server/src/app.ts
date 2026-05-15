import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import notFound from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

/**
 * Helps Express read original client IP correctly behind proxy/load balancer.
 */
app.set("trust proxy", true);

/**
 * Frontend integration CORS configuration.
 *
 * Important:
 * The frontend uses withCredentials: true because refreshToken is stored as an
 * HTTP-only cookie. For credentialed browser requests, CORS cannot use
 * Access-Control-Allow-Origin: *.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * Legacy salary Excel parsing sends the selected .xlsx file as a base64 JSON
 * payload. Express defaults JSON payloads to 100kb, which is too small for
 * real CSRM/TSL salary sheets and causes: "request entity too large".
 *
 * Keep this limit reasonable so normal Excel salary/time-bill files can be
 * parsed while still avoiding unlimited request bodies.
 */
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CSRM Payroll Backend Running ",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
