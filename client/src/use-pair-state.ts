import { useEffect, useState } from "react";
import type { ServerMessage } from "@tonight/shared";
import { SERVER_URL } from "./config.ts";
import { connectToServer } from "./connection.ts";

/** The pair state as the server last reported it. */
type PairState = Extract<ServerMessage, { type: "pair_state" }>;

/**
 * Connects to the server for as long as the calling component is mounted.
 *
 * @returns The latest pair state, or `null` before the server has replied.
 */
export function usePairState(): PairState | null {
  const [pairState, setPairState] = useState<PairState | null>(null);

  useEffect(() => {
    const connection = connectToServer(SERVER_URL, {
      // Placeholder token until pairing issues real ones.
      onOpen: () => connection.send({ type: "hello", playerToken: "dev-token" }),
      onMessage: (message) => {
        if (message.type === "pair_state") setPairState(message);
      },
      onClose: () => setPairState(null),
    });

    return () => connection.close();
  }, []);

  return pairState;
}
