import type { WebSocket } from "ws";
import type { ServerMessage } from "@tonight/shared";

/**
 * Sends a message to one client.
 * The only place that turns a ServerMessage into text, so every message
 * leaving the server is type-checked against the shared contract.
 *
 * @param socket - The client's connection.
 * @param message - The fact to send.
 */
export function sendMessage(socket: WebSocket, message: ServerMessage): void {
  socket.send(JSON.stringify(message));
}
