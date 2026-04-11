import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./routes";
import notFound from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CSRM Payroll Backend Running 🚀",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
