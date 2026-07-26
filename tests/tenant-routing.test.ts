import assert from "node:assert/strict";
import test from "node:test";
import {
  isTenantPassthroughPath,
  isTenantRestrictedPath,
} from "../lib/tenant-routing";

test("tenant hosts reject operator and system routes", () => {
  assert.equal(isTenantRestrictedPath("/dashboard"), true);
  assert.equal(isTenantRestrictedPath("/dashboard/restaurants/123"), true);
  assert.equal(isTenantRestrictedPath("/login"), true);
  assert.equal(isTenantRestrictedPath("/portal"), true);
  assert.equal(isTenantRestrictedPath("/portal/account"), true);
  assert.equal(isTenantRestrictedPath("/activate/example-token"), true);
  assert.equal(isTenantRestrictedPath("/api/health"), true);
});

test("tenant hosts pass managed media through to the delivery route", () => {
  assert.equal(isTenantPassthroughPath("/media/inci/logo/image.webp"), true);
  assert.equal(isTenantPassthroughPath("/media"), false);
  assert.equal(isTenantPassthroughPath("/media-library"), false);
});

test("tenant hosts allow the public menu root and harmless paths", () => {
  assert.equal(isTenantRestrictedPath("/"), false);
  assert.equal(isTenantRestrictedPath("/menu"), false);
  assert.equal(isTenantRestrictedPath("/about"), false);
  assert.equal(isTenantRestrictedPath("/dashboard-menu"), false);
});
