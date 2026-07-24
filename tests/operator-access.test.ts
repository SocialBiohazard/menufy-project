import assert from "node:assert/strict";
import test from "node:test";
import { configuredOperatorEmails, isOperatorEmail } from "../lib/operator-access";

test("operator allowlist is case-insensitive and trims duplicates", () => {
  const configured = " Dev@example.com,dev@example.com, second@example.com ";
  assert.deepEqual(configuredOperatorEmails(configured), [
    "dev@example.com",
    "second@example.com",
  ]);
  assert.equal(isOperatorEmail("DEV@example.com", configured), true);
  assert.equal(isOperatorEmail("unknown@example.com", configured), false);
});

test("missing allowlist fails closed", () => {
  assert.equal(isOperatorEmail("dev@example.com", ""), false);
  assert.equal(isOperatorEmail(null, "dev@example.com"), false);
});
