import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
const KEY_LENGTH = 64;
const COST = 32_768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAX_MEMORY = 64 * 1024 * 1024;

export function passwordValidationError(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters";
  if (password.length > 128) return "Password must be at most 128 characters";
  return null;
}

async function derive(password: string, salt: Buffer, cost = COST) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: cost,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: MAX_MEMORY,
      },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const validationError = passwordValidationError(password);
  if (validationError) throw new Error(validationError);

  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const [algorithm, costRaw, blockRaw, parallelRaw, saltRaw, keyRaw] =
    encoded.split("$");
  if (
    algorithm !== "scrypt" ||
    !costRaw ||
    !blockRaw ||
    !parallelRaw ||
    !saltRaw ||
    !keyRaw
  ) {
    return false;
  }

  const cost = Number(costRaw);
  const blockSize = Number(blockRaw);
  const parallelization = Number(parallelRaw);
  if (
    cost !== COST ||
    blockSize !== BLOCK_SIZE ||
    parallelization !== PARALLELIZATION
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(keyRaw, "base64url");
    const actual = await derive(password, Buffer.from(saltRaw, "base64url"), cost);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
