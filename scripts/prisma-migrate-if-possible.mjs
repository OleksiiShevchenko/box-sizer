import { execFileSync, spawnSync } from "node:child_process";
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

  const diff = spawnSync(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "diff",
      "--from-empty",
      `--to-schema-datamodel=${schemaPath}`,
      "--script",
    ],
    {
      encoding: "utf8",
      env: getMigrationEnv(),
    }
  );

  if (diff.status !== 0) {
    process.stderr.write(diff.stderr ?? "");
    throw new Error("Failed to generate bootstrap SQL for fresh database.");
  }

  runPrismaCommand(["db", "execute", "--stdin", `--url=${migrationDatabaseUrl}`], {
    input: diff.stdout,
  });

  for (const migrationName of getMigrationNames()) {
    runPrismaCommand([
      "migrate",
      "resolve",
      "--applied",
      migrationName,
      `--schema=${schemaPath}`,
    ]);
  }
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

  if (!migrationsTablePresent) {
    if (userTablePresent) {
      throw new Error(
        "Database contains app tables but has no Prisma migration history. Refusing to guess how to baseline it."
      );
    }

    bootstrapFreshDatabase();
  }

  console.log("Running prisma migrate deploy before build...");
  runPrismaCommand(["migrate", "deploy", `--schema=${schemaPath}`]);
} finally {
  await prisma.$disconnect();
}
