import { randomUUID } from "node:crypto";
import type { Pair } from "./pair.ts";
import type { PairStore } from "./pair-store.ts";
import { generateInviteCode } from "./invite-code.ts";

/** How long an invite code stays valid. */
const INVITE_CODE_LIFETIME_MS = 10 * 60 * 1000;

/** What Partner A's phone receives after creating an invite. */
export type CreatedInvite = {
  playerToken: string;
  inviteCode: string;
  inviteCodeExpiresAt: Date;
};

/**
 * Starts a new pair for Partner A and issues an invite code for Partner B.
 *
 * @param store - Where pairs are kept.
 * @param now - The current time, passed in so tests can control it.
 * @returns A's secret token and the invite code to share.
 */
export function createInvite(store: PairStore, now: Date): CreatedInvite {
  const pair: Pair = {
    id: randomUUID(),
    inviteCode: generateUniqueInviteCode(store),
    inviteCodeExpiresAt: new Date(now.getTime() + INVITE_CODE_LIFETIME_MS),
    status: "waiting_for_partner",
    playerAToken: randomUUID(),
    playerBToken: null,
    createdAt: now,
    endedAt: null,
  };

  store.savePair(pair);

  return {
    playerToken: pair.playerAToken,
    inviteCode: pair.inviteCode,
    inviteCodeExpiresAt: pair.inviteCodeExpiresAt,
  };
}

/** Generates invite codes until one is not used by any pair, past or present. */
function generateUniqueInviteCode(store: PairStore): string {
  let code = generateInviteCode();
  while (store.findPairByInviteCode(code) !== undefined) {
    code = generateInviteCode();
  }
  return code;
}
