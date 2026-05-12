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

app.use(express.json());
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
