import type { PairStatus } from "@tonight/shared";

/**
 * A couple's pairing, from invite to ending.
 * Server-only: contains secret player tokens that must never be sent to a client.
 */
export type Pair = {
  id: string;
  /** Code Partner A shares so Partner B can join. */
  inviteCode: string;
  status: PairStatus;
  /** Token of the player who created the invite. */
  playerAToken: string;
  /** Token of the player who joined, or `null` until someone joins. */
  playerBToken: string | null;
  createdAt: Date;
  /** When the pair ended, or `null` while it is still active. */
  endedAt: Date | null;
};
