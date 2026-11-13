import type { Pair } from "./pair.ts";

/**
 * What pairing logic needs from storage.
 * Implemented in memory today and by SQLite later; callers never know which.
 */
export type PairStore = {
  /** Saves a new pair, or replaces the stored version of an existing one. */
  savePair(pair: Pair): void;

  /** @returns The pair with this invite code, or `undefined` if none. */
  findPairByInviteCode(code: string): Pair | undefined;

  /** @returns The pair this player belongs to, or `undefined` if none. */
  findPairByPlayerToken(token: string): Pair | undefined;
};
