import assert from "node:assert/strict";
import test from "node:test";
import {
  membershipsAllowRestaurantAccess,
  restaurantAccessRole,
  roleAllows,
} from "../lib/customer-roles";

test("customer roles only allow their intended restaurant capabilities", () => {
  assert.equal(roleAllows("VIEWER", "VIEWER"), true);
  assert.equal(roleAllows("VIEWER", "EDITOR"), false);
  assert.equal(roleAllows("EDITOR", "VIEWER"), true);
  assert.equal(roleAllows("EDITOR", "EDITOR"), true);
  assert.equal(roleAllows("EDITOR", "OWNER"), false);
  assert.equal(roleAllows("OWNER", "OWNER"), true);
  assert.equal(roleAllows("OWNER", "EDITOR"), true);
});

test("restaurant memberships cannot cross tenant boundaries", () => {
  const memberships = [
    { restaurantId: "inci", role: "OWNER" as const },
    { restaurantId: "second-location", role: "VIEWER" as const },
  ];

  assert.equal(restaurantAccessRole(memberships, "inci"), "OWNER");
  assert.equal(membershipsAllowRestaurantAccess(memberships, "inci", "EDITOR"), true);
  assert.equal(
    membershipsAllowRestaurantAccess(memberships, "second-location", "EDITOR"),
    false,
  );
  assert.equal(membershipsAllowRestaurantAccess(memberships, "other-customer", "VIEWER"), false);
});
