import assert from "node:assert/strict";
import test from "node:test";
import {
  hashPassword,
  passwordValidationError,
  verifyPassword,
} from "../lib/auth-password";

test("password hashing verifies the original without storing it", async () => {
  const password = "A sufficiently long password!";
  const encoded = await hashPassword(password);

  assert.match(encoded, /^scrypt\$/);
  assert.equal(encoded.includes(password), false);
  assert.equal(await verifyPassword(password, encoded), true);
  assert.equal(await verifyPassword("not the password", encoded), false);
});

test("password policy rejects short and oversized values", () => {
  assert.match(passwordValidationError("short") ?? "", /at least 12/);
  assert.match(passwordValidationError("x".repeat(129)) ?? "", /at most 128/);
  assert.equal(passwordValidationError("long enough password"), null);
});
