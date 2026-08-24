export type InvitationRecipientMode =
  | "CREATE_USER"
  | "GRANT_ACCESS"
  | "REJECT_OTHER_WORKSPACE";

export function invitationRecipientMode(
  existingAccountId: string | null | undefined,
  invitedAccountId: string,
): InvitationRecipientMode {
  if (!existingAccountId) return "CREATE_USER";
  return existingAccountId === invitedAccountId
    ? "GRANT_ACCESS"
    : "REJECT_OTHER_WORKSPACE";
}
