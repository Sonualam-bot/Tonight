import { randomUUID } from "node:crypto";
import type { Pair } from "./pair.ts";
import type { PairStore } from "./pair-store.ts";
import { generateInviteCode, normalizeInviteCode } from "./invite-code.ts";

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

/** Why a join was refused. Each one maps to its own message on B's screen. */
export type JoinRefusal =
  | "code_not_found"
  | "code_expired"
  | "code_already_used"
  | "invite_ended"
  | "own_invite"
  | "already_paired";

/** Outcome of trying to join with a code. */
export type JoinResult =
  | { ok: true; playerToken: string }
  | { ok: false; reason: JoinRefusal };

/**
 * Lets Partner B join a pair using A's invite code.
 * Issues B a fresh token: each token belongs to exactly one pair, forever.
 *
 * @param store - Where pairs are kept.
 * @param typedCode - The code as B typed it.
 * @param existingToken - B's current token, or `null` if B has never paired.
 * @param now - The current time, passed in so tests can control it.
 * @returns B's new token, or the reason the join was refused.
 */
export function joinWithCode(
  store: PairStore,
  typedCode: string,
  existingToken: string | null,
  now: Date,
): JoinResult {
  const pair = store.findPairByInviteCode(normalizeInviteCode(typedCode));
  if (pair === undefined) return { ok: false, reason: "code_not_found" };

  const refusal = findJoinRefusal(store, pair, existingToken, now);
  if (refusal !== null) return { ok: false, reason: refusal };

  cancelOwnPendingInvite(store, existingToken, now);

  const playerToken = randomUUID();
  store.savePair({ ...pair, playerBToken: playerToken, status: "paired" });
  return { ok: true, playerToken };
}

/** @returns Why this player may not join this pair, or `null` if they may. */
function findJoinRefusal(
  store: PairStore,
  pair: Pair,
  existingToken: string | null,
  now: Date,
): JoinRefusal | null {
  if (pair.status === "ended") return "invite_ended";
  if (pair.status === "paired") return "code_already_used";
  if (now >= pair.inviteCodeExpiresAt) return "code_expired";
  if (existingToken === pair.playerAToken) return "own_invite";

  const currentPair =
    existingToken === null ? undefined : store.findPairByPlayerToken(existingToken);
  if (currentPair?.status === "paired") return "already_paired";

  return null;
}

/**
 * Ends the joining player's own unused invite, if they have one.
 * Safe to do automatically: no other person is in that pair.
 */
function cancelOwnPendingInvite(
  store: PairStore,
  existingToken: string | null,
  now: Date,
): void {
  if (existingToken === null) return;

  const ownPair = store.findPairByPlayerToken(existingToken);
  if (ownPair?.status !== "waiting_for_partner") return;

  store.savePair({ ...ownPair, status: "ended", endedAt: now });
}

/** Generates invite codes until one is not used by any pair, past or present. */
function generateUniqueInviteCode(store: PairStore): string {
  let code = generateInviteCode();
  while (store.findPairByInviteCode(code) !== undefined) {
    code = generateInviteCode();
  }
  return code;
}
