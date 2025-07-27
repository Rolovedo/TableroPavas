import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
// import httpLogger from "./src/common/middlewares/httpLogger.middleware.js";
import { testConnection } from "./src/common/configs/db.config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
// import helmetMiddleware from "./src/common/middlewares/helmet.middleware.js";
// import defaultRateLimit from "./src/common/middlewares/rateLimit.middleware.js";
import compressionMiddleware from "./src/common/middlewares/compression.middleware.js";
import cleanRequestData from "./src/common/middlewares/cleanRequestData.middleware.js";
import errorMiddleware from "./src/common/middlewares/error.middleware.js";
import mainRoutes from "./src/modules/main.routes.js";
import morgan from "morgan";
import { loadAllJobs } from "./cron.jobs.js";
import { getIO } from "./src/common/configs/socket.manager.js";
import { init } from "./socket.js";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

testConnection();

// Middleware para log de peticiones
// app.use(httpLogger);
const httpServer = http.createServer(app);

init(httpServer);
app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" })); // Parsear JSON en el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true })); // Parsear datos codificados en URLs

app.use(cors({
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pavastecnologia.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
})); // Permite solicitudes desde otros dominios
app.use(cookieParser()); // Manejo de cookies
// app.use(helmetMiddleware); // Protección contra vulnerabilidades comunes
app.use(compressionMiddleware); // Mejora el rendimiento comprimiendo las respuestas
// app.use(defaultRateLimit); // Limita la cantidad de solicitudes por IP
app.use(cleanRequestData); // Limpia datos en `req.body`, `req.query` y `req.params`

app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);
const io = getIO();
// loadAllJobs(io);

app.use("/", express.static(path.join(__dirname, "../build")));
app.use("/api", mainRoutes);
app.use(errorMiddleware);

export { app };
