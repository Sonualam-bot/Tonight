/**
 * Messages the client sends to the server.
 * These are intents: requests the server may accept or reject.
 */
export type ClientMessage = {
  type: "hello";
  /** Secret, unguessable token that identifies the player on every (re)connect. */
  playerToken: string;
};

/** Lifecycle of a pair, from invite to ending. */
export type PairStatus = "waiting_for_partner" | "paired" | "ended";

/**
 * Messages the server sends to the client.
 * These are facts: the server's view of the truth.
 */
export type ServerMessage =
  | {
      type: "pair_state";
      status: PairStatus;
      partnerOnline: boolean;
    }
  | {
      type: "error";
      reason: "invalid_message";
    };

/**
 * Turns raw socket text into a ClientMessage.
 *
 * Never throws: bad input from a client must not crash the server.
 * Builds a fresh object, so any extra fields the client sent are dropped.
 *
 * @param raw - The text received on the socket.
 * @returns The validated message, or `null` if the input is not a valid ClientMessage.
 */
export function parseClientMessage(raw: string): ClientMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) return null;
  const message = data as Record<string, unknown>;

  if (message.type === "hello" && typeof message.playerToken === "string") {
    return { type: "hello", playerToken: message.playerToken };
  }

  return null;
}
