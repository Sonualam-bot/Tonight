import { WebSocketServer } from "ws";
import type { ClientMessage, ServerMessage } from "@tonight/shared";

const PORT = 3000;
const server = new WebSocketServer({ port: PORT });

server.on("connection", (socket) => {
  console.log("client connected");

  socket.on("message", (raw) => {
    // Temporary: trusts the client. Runtime validation comes next.
    const message = JSON.parse(raw.toString()) as ClientMessage;

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

  socket.on("close", () => console.log("client disconnected"));
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
