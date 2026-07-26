import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.join(
  projectRoot,
  ".local",
  "postgresql",
  "bin",
  process.platform === "win32" ? "pg_ctl.exe" : "pg_ctl",
);
const dataDirectory = path.join(projectRoot, ".local", "postgresql-data");
const logFile = path.join(projectRoot, ".local", "postgresql.log");
const command = process.argv[2] ?? "status";

if (!["start", "stop", "status"].includes(command)) {
  console.error("Usage: node scripts/local-postgres.mjs <start|stop|status>");
  process.exit(2);
}

if (!existsSync(executable) || !existsSync(dataDirectory)) {
  console.error(
    "The project-local PostgreSQL runtime is not installed. Use Railway PostgreSQL or initialize .local/postgresql first.",
  );
  process.exit(1);
}

function run(args, options = {}) {
  return spawnSync(executable, args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.quiet ? "ignore" : "inherit",
  });
}

const status = run(["-D", dataDirectory, "status"], { quiet: command !== "status" });

if (command === "status") {
  process.exit(status.status ?? 1);
}

if (command === "start") {
  if (status.status === 0) {
    console.log("Local PostgreSQL is already running.");
    process.exit(0);
  }
  const result = run([
    "-D",
    dataDirectory,
    "-l",
    logFile,
    "-o",
    "-p 5432 -h 127.0.0.1",
    "start",
  ]);
  process.exit(result.status ?? 1);
}

if (status.status !== 0) {
  console.log("Local PostgreSQL is already stopped.");
  process.exit(0);
}

const result = run(["-D", dataDirectory, "-m", "fast", "stop"]);
process.exit(result.status ?? 1);
