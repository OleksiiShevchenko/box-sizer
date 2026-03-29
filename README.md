This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Local Development

This app uses Prisma with PostgreSQL. For local development, run PostgreSQL in
Docker and point `DATABASE_URL` at that container instead of Prisma Accelerate.

Start the database:

```bash
docker compose up -d postgres
```

Use a direct Postgres URL in `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/box_sizer?schema=public"
```

Bootstrap the schema:

```bash
pnpm db:push
```

The `db:*` scripts load `DATABASE_URL` from `.env.local`, so you do not need a
separate `.env` file for Prisma locally.

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

For deployed environments, keep `DATABASE_URL` pointed at the runtime
connection string and set `DIRECT_DATABASE_URL` to the direct Postgres
connection used for Prisma schema management. The build now bootstraps a fresh
database schema if needed, but it will fail the deployment if Prisma cannot
apply or baseline the schema safely.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
