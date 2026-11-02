import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password.
 * bcrypt.hash is NOT deterministic, so we can't compare hashes across runs —
 * idempotency is handled at the record level (email lookup), not the hash level.
 */
export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);
