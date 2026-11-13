import type { Pair } from "./pair.ts";
import type { PairStore } from "./pair-store.ts";

/**
 * Creates an empty pair store that keeps pairs in memory.
 * Each call gets its own Map, so tests never share data.
 * Everything is lost when the server restarts.
 */
export function createInMemoryPairStore(): PairStore {
  const pairsById = new Map<string, Pair>();

  return {
    savePair(pair) {
      pairsById.set(pair.id, pair);
    },

    findPairByInviteCode(code) {
      for (const pair of pairsById.values()) {
        if (pair.inviteCode === code) return pair;
      }
      return undefined;
    },

    findPairByPlayerToken(token) {
      for (const pair of pairsById.values()) {
        if (pair.playerAToken === token || pair.playerBToken === token)
          return pair;
      }
      return undefined;
    },
  };
}
