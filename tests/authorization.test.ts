import assert from "node:assert/strict";
import test from "node:test";
import { roleAllows } from "../lib/customer-roles";

test("customer roles only allow their intended restaurant capabilities", () => {
  assert.equal(roleAllows("VIEWER", "VIEWER"), true);
  assert.equal(roleAllows("VIEWER", "EDITOR"), false);
  assert.equal(roleAllows("EDITOR", "VIEWER"), true);
  assert.equal(roleAllows("EDITOR", "EDITOR"), true);
  assert.equal(roleAllows("EDITOR", "OWNER"), false);
  assert.equal(roleAllows("OWNER", "OWNER"), true);
  assert.equal(roleAllows("OWNER", "EDITOR"), true);
});
