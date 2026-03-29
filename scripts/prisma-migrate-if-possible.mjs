import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
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
    timeout: 30_000,
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
  const tempDir = mkdtempSync(path.join(tmpdir(), "box-sizer-prisma-"));
  const bootstrapSqlPath = path.join(tempDir, "bootstrap.sql");

  try {
    console.log(`Writing bootstrap SQL to ${bootstrapSqlPath}...`);
    runPrismaCommand([
      "migrate",
      "diff",
      "--from-empty",
      `--to-schema-datamodel=${schemaPath}`,
      "--script",
      `--output=${bootstrapSqlPath}`,
    ]);

    const bootstrapSql = readFileSync(bootstrapSqlPath, "utf8");
    if (!bootstrapSql.trim()) {
      throw new Error("Bootstrap SQL was empty.");
    }

    console.log("Applying bootstrap SQL...");
    runPrismaCommand(["db", "execute", "--stdin", `--url=${migrationDatabaseUrl}`], {
      input: bootstrapSql,
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

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
