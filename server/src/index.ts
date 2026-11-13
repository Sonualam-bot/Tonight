import { WebSocketServer } from "ws";
import { parseClientMessage, type ServerMessage } from "@tonight/shared";

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

server.on("connection", (socket) => {
  console.log("client connected");

  socket.on("message", (raw) => {
    const message = parseClientMessage(raw.toString());

    if (message === null) {
      const reply: ServerMessage = { type: "error", reason: "invalid_message" };
      socket.send(JSON.stringify(reply));
      return;
    }

    if (message.type === "hello") {
      // Fake state for now. Real pair lookup replaces this.
      const reply: ServerMessage = {
        type: "pair_state",
        status: "waiting_for_partner",
        partnerOnline: false,
      };
      socket.send(JSON.stringify(reply));
    }
  });

  socket.on("error", (error) => {
    // One client's error must never crash the server for everyone.
    console.warn(`client error: ${error.message}`);
  });

  socket.on("close", () => console.log("client disconnected"));
});
