import "dotenv/config";

import { hashPassword, passwordValidationError } from "../lib/auth-password";
import { isOperatorEmail } from "../lib/operator-access";
import { prisma } from "../lib/prisma";

// Creates or resets an operator in the application database.
// Prefer OPERATOR_PASSWORD so the password does not appear in shell history:
// OPERATOR_PASSWORD="..." npm run create-operator -- developer@example.com
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.env.OPERATOR_PASSWORD ?? process.argv[3];
  if (!email || !password) {
    console.error(
      "Usage: set OPERATOR_PASSWORD securely, then run npm run create-operator -- <email>",
    );
    process.exitCode = 1;
    return;
  }
  if (!isOperatorEmail(email)) {
    console.error("Email must also be present in OPERATOR_EMAILS.");
    process.exitCode = 1;
    return;
  }
  const validationError = passwordValidationError(password);
  if (validationError) {
    console.error(validationError);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  const operator = await prisma.operator.upsert({
    where: { email },
    create: { email, passwordHash },
    update: {
      passwordHash,
      isActive: true,
      sessions: { deleteMany: {} },
    },
    select: { email: true },
  });
  console.log(`Operator ready: ${operator.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
