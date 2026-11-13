import { WebSocketServer } from "ws";
import { handleConnection } from "./connection.ts";

/** Port to listen on. Hosting platforms set `PORT`; defaults to 3000 locally. */
const PORT = Number(process.env.PORT ?? 3000);

/**
 * Largest message a client may send, in bytes.
 * Bigger messages close that client's connection with code 1009.
 */
const MAX_MESSAGE_BYTES = 4096;

const server = new WebSocketServer({ port: PORT, maxPayload: MAX_MESSAGE_BYTES });

server.on("listening", () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error(`Server failed to start: ${error.message}`);
  process.exit(1);
});

server.on("connection", handleConnection);
