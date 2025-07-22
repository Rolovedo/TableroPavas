let io = null;

export const setIO = (socketInstance) => {
  io = socketInstance;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO no inicializado.");
  }
  return io;
};
