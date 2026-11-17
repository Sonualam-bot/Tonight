import { describe, expect, it } from "vitest";
import { createInMemoryPairStore } from "./in-memory-pair-store.ts";
import { createInvite, joinWithCode } from "./pairing.ts";

/** Fixed starting time, so every test sees the same clock. */
const START = new Date("2026-11-17T21:00:00Z");

/** @returns The time `minutes` after START. */
function minutesAfter(minutes: number): Date {
  return new Date(START.getTime() + minutes * 60 * 1000);
}

describe("createInvite", () => {
  it("issues a 6-character code that expires 10 minutes later", () => {
    const invite = createInvite(createInMemoryPairStore(), START);

    expect(invite.inviteCode).toMatch(/^[A-Z2-9]{6}$/);
    expect(invite.inviteCodeExpiresAt).toEqual(minutesAfter(10));
  });

  it("saves a pair that is waiting for a partner", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);

    expect(store.findPairByPlayerToken(invite.playerToken)?.status).toBe(
      "waiting_for_partner",
    );
  });
});

describe("joinWithCode", () => {
  it("pairs B with A and gives B a new token", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);

    const result = joinWithCode(store, invite.inviteCode, null, minutesAfter(1));

    expect(result.ok).toBe(true);
    const pair = store.findPairByPlayerToken(invite.playerToken);
    expect(pair?.status).toBe("paired");
    if (result.ok) expect(pair?.playerBToken).toBe(result.playerToken);
  });

  it("accepts a code typed in lowercase with spaces", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);

    const result = joinWithCode(
      store,
      ` ${invite.inviteCode.toLowerCase()} `,
      null,
      minutesAfter(1),
    );

    expect(result.ok).toBe(true);
  });

  it("refuses a code no pair has", () => {
    const store = createInMemoryPairStore();
    createInvite(store, START);

    // "000000" can never be generated: 0 is not in the alphabet.
    const result = joinWithCode(store, "000000", null, minutesAfter(1));

    expect(result).toEqual({ ok: false, reason: "code_not_found" });
  });

  it("accepts a code one second before it expires", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);
    const oneSecondBeforeExpiry = new Date(minutesAfter(10).getTime() - 1000);

    const result = joinWithCode(store, invite.inviteCode, null, oneSecondBeforeExpiry);

    expect(result.ok).toBe(true);
  });

  it("refuses a code at the exact moment it expires", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);

    const result = joinWithCode(store, invite.inviteCode, null, minutesAfter(10));

    expect(result).toEqual({ ok: false, reason: "code_expired" });
  });

  it("refuses a code that someone already used", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);
    joinWithCode(store, invite.inviteCode, null, minutesAfter(1));

    const result = joinWithCode(store, invite.inviteCode, null, minutesAfter(2));

    expect(result).toEqual({ ok: false, reason: "code_already_used" });
  });

  it("refuses when A ended the pair before anyone joined", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);
    const pair = store.findPairByPlayerToken(invite.playerToken)!;
    store.savePair({ ...pair, status: "ended", endedAt: minutesAfter(1) });

    const result = joinWithCode(store, invite.inviteCode, null, minutesAfter(2));

    expect(result).toEqual({ ok: false, reason: "invite_ended" });
  });

  it("refuses when A types their own code", () => {
    const store = createInMemoryPairStore();
    const invite = createInvite(store, START);

    const result = joinWithCode(
      store,
      invite.inviteCode,
      invite.playerToken,
      minutesAfter(1),
    );

    expect(result).toEqual({ ok: false, reason: "own_invite" });
  });

  it("refuses a player who is already in a pair", () => {
    const store = createInMemoryPairStore();
    const firstInvite = createInvite(store, START);
    const firstJoin = joinWithCode(store, firstInvite.inviteCode, null, minutesAfter(1));
    if (!firstJoin.ok) throw new Error("setup failed: first join was refused");
    const secondInvite = createInvite(store, minutesAfter(2));

    const result = joinWithCode(
      store,
      secondInvite.inviteCode,
      firstJoin.playerToken,
      minutesAfter(3),
    );

    expect(result).toEqual({ ok: false, reason: "already_paired" });
  });

  it("cancels the joiner's own unused invite", () => {
    const store = createInMemoryPairStore();
    const ownInvite = createInvite(store, START);
    const partnerInvite = createInvite(store, START);

    joinWithCode(store, partnerInvite.inviteCode, ownInvite.playerToken, minutesAfter(1));

    expect(store.findPairByPlayerToken(ownInvite.playerToken)?.status).toBe("ended");
  });
});
