import type { ClientMessage, ServerMessage } from "@tonight/shared";

/**
 * Decides the server's reply to a valid client message.
 * Pure logic: no sockets, so it can be tested with plain function calls.
 *
 * @param message - A message that already passed validation.
 * @returns The fact to send back to the client.
 */
export function handleMessage(message: ClientMessage): ServerMessage {
  switch (message.type) {
    case "hello":
      // Fake state for now. Real pair lookup replaces this.
      return {
        type: "pair_state",
        status: "waiting_for_partner",
        partnerOnline: false,
      };
  }
}
