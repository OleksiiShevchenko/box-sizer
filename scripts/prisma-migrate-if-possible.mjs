import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const schemaPath = path.resolve("prisma/schema.prisma");
const migrationsDir = path.resolve("prisma/migrations");
const databaseUrl = process.env.DATABASE_URL ?? "";
const directDatabaseUrl = process.env.DIRECT_DATABASE_URL ?? "";
const migrationDatabaseUrl = directDatabaseUrl || databaseUrl;
const directConnectionPattern =
  /^(postgres|postgresql|mysql|sqlserver|cockroachdb):\/\//i;
const migrationNames = getMigrationNames();

function getMigrationEnv() {
  return {
    ...process.env,
    DATABASE_URL: migrationDatabaseUrl,
  };
}

function runPrismaCommand(args, options = {}) {
  execFileSync("pnpm", ["exec", "prisma", ...args], {
    stdio: "inherit",
    env: getMigrationEnv(),
    timeout: 60_000,
    ...options,
  });
}

function getMigrationNames() {
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function tableExists(prisma, tableName) {
  const [result] = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `;

  return Boolean(result?.exists);
}

function bootstrapFreshDatabase() {
  console.log("Bootstrapping fresh database schema from prisma/schema.prisma...");
  console.log("Pushing schema with prisma db push...");
  runPrismaCommand(["db", "push", `--schema=${schemaPath}`, "--skip-generate"]);

  for (const migrationName of migrationNames) {
    runPrismaCommand([
      "migrate",
      "resolve",
      "--applied",
      migrationName,
      `--schema=${schemaPath}`,
    ]);
  }
}

function resetMigrationHistory() {
  console.log("Resetting incomplete Prisma migration history on empty database...");
  runPrismaCommand(["db", "execute", "--stdin", `--url=${migrationDatabaseUrl}`], {
    input: 'DROP TABLE IF EXISTS "_prisma_migrations";',
  });
}

if (!directConnectionPattern.test(migrationDatabaseUrl)) {
  console.log(
    "Skipping prisma migrate deploy: no direct database connection was provided."
  );
  process.exit(0);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: migrationDatabaseUrl,
    },
  },
});

try {
  const migrationsTablePresent = await tableExists(prisma, "_prisma_migrations");
  const userTablePresent = await tableExists(prisma, "User");
  let bootstrapped = false;

  if (!userTablePresent) {
    if (migrationsTablePresent) {
      resetMigrationHistory();
    }
    bootstrapFreshDatabase();
    bootstrapped = true;
  } else if (migrationNames.length === 0) {
    console.log(
      "Skipping prisma migrate deploy: no Prisma migrations are present for this project."
    );
    process.exit(0);
  } else if (!migrationsTablePresent) {
    throw new Error(
      "Database contains app tables but has no Prisma migration history. Refusing to guess how to baseline it."
    );
  }

  if (!bootstrapped) {
    console.log("Running prisma migrate deploy before build...");
    runPrismaCommand(["migrate", "deploy", `--schema=${schemaPath}`]);
  }
} finally {
  await prisma.$disconnect();
}
