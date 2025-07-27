import { Server } from "socket.io";
import { setIO } from "./src/common/configs/socket.manager.js";

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://pavastecnologia.com",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  setIO(io);

  io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado");

    socket.on("disconnect", (reason) => {
      console.log(`Cliente desconectado, ID: ${socket.id}, Razón: ${reason}`);
    });
  });

  return io;
};

export { init };
