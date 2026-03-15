import { execSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL ?? "";
const directDatabaseUrl = process.env.DIRECT_DATABASE_URL ?? "";
const directConnectionPattern = /^(postgres|postgresql|mysql|sqlserver|cockroachdb):\/\//i;

const shouldRunMigrations =
  Boolean(directDatabaseUrl) || directConnectionPattern.test(databaseUrl);

if (!shouldRunMigrations) {
  console.log(
    "Skipping prisma migrate deploy: no direct database connection was provided."
  );
  process.exit(0);
}

console.log("Running prisma migrate deploy before build...");
execSync("pnpm exec prisma migrate deploy", {
  stdio: "inherit",
});
