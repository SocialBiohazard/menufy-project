import assert from "node:assert/strict";
import test from "node:test";
import { invitationRecipientMode } from "../lib/customer-invitation-policy";

test("activation links are reserved for brand-new customer identities", () => {
  assert.equal(invitationRecipientMode(null, "inci-account"), "CREATE_USER");
  assert.equal(
    invitationRecipientMode("inci-account", "inci-account"),
    "GRANT_ACCESS",
  );
  assert.equal(
    invitationRecipientMode("other-account", "inci-account"),
    "REJECT_OTHER_WORKSPACE",
  );
});
