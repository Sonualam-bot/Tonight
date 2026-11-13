import type { ClientMessage, ServerMessage } from "@tonight/shared";

/** Callbacks the connection uses to report what happens. */
export type ConnectionHandlers = {
  onOpen(): void;
  onMessage(message: ServerMessage): void;
  onClose(): void;
};

/** An open link to the server. */
export type Connection = {
  send(message: ClientMessage): void;
  close(): void;
};

/**
 * Opens a WebSocket to the server and reports events through `handlers`.
 *
 * @param url - The server's WebSocket address.
 * @param handlers - Called on open, on each message, and on close.
 * @returns A connection to send messages on and close when done.
 */
export function connectToServer(url: string, handlers: ConnectionHandlers): Connection {
  const socket = new WebSocket(url);

  socket.addEventListener("open", () => handlers.onOpen());
  socket.addEventListener("close", () => handlers.onClose());
  socket.addEventListener("message", (event) => {
    // The server is ours and only sends ServerMessage, so a cast is acceptable here.
    handlers.onMessage(JSON.parse(event.data) as ServerMessage);
  });

  return {
    send: (message) => socket.send(JSON.stringify(message)),
    close: () => socket.close(),
  };
}
