import type { WebSocket } from "ws";
import { parseClientMessage } from "@tonight/shared";
import { handleMessage } from "./handle-message.ts";
import { sendMessage } from "./send.ts";

/**
 * Wires up the events for one client connection.
 *
 * @param socket - The newly connected client.
 */
export function handleConnection(socket: WebSocket): void {
  console.log("client connected");

  socket.on("message", (raw) => {
    const message = parseClientMessage(raw.toString());

    if (message === null) {
      sendMessage(socket, { type: "error", reason: "invalid_message" });
      return;
    }

    sendMessage(socket, handleMessage(message));
  });

  socket.on("error", (error) => {
    // One client's error must never crash the server for everyone.
    console.warn(`client error: ${error.message}`);
  });

  socket.on("close", () => console.log("client disconnected"));
}
