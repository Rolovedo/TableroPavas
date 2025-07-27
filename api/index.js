import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import compressionMiddleware from "../server/src/common/middlewares/compression.middleware.js";
import cleanRequestData from "../server/src/common/middlewares/cleanRequestData.middleware.js";
import errorMiddleware from "../server/src/common/middlewares/error.middleware.js";
import mainRoutes from "../server/src/modules/main.routes.js";
import morgan from "morgan";
import { testConnection } from "../server/src/common/configs/db.postgres.config.js";

dotenv.config();

const app = express();

// Test database connection
testConnection();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pavastecnologia.com",
    "https://tablero-pavas.vercel.app",
    "https://*.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(cookieParser());
app.use(compressionMiddleware);
app.use(cleanRequestData);

app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);

// Routes
app.use("/api", mainRoutes);
app.use(errorMiddleware);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente", timestamp: new Date().toISOString() });
});

export default app;
