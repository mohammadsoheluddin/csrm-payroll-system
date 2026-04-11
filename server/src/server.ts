import app from "./app";
import config from "./app/config";
import { connectDB } from "./config/db";

const bootstrap = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
  }
};

bootstrap();
