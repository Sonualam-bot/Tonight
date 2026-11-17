import { randomInt } from "node:crypto";

/** Characters used in invite codes. Leaves out lookalikes: 0, O, 1, I, L. */
const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Number of characters in an invite code. */
const INVITE_CODE_LENGTH = 6;

/**
 * Generates a random invite code using a cryptographically secure source,
 * so codes cannot be predicted from earlier ones.
 */
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Cleans up a code typed by a person: trims spaces and uppercases it,
 * so "k7p2qx " matches "K7P2QX".
 */
export function normalizeInviteCode(input: string): string {
  return input.trim().toUpperCase();
}
