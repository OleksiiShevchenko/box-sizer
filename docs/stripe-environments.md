# Stripe Sandbox And Production Setup

This app keeps the plan catalog in code and uses environment variables to map each paid tier to the correct Stripe Price for the current deployment.

## Source Of Truth

- App code defines plan names, displayed prices, quotas, and feature flags in `src/lib/subscription-plans.ts`.
- Stripe defines the account-specific billing objects:
  - secret key
  - webhook secret
  - price IDs

Each deployment should talk to exactly one Stripe account.

## Required Environment Variables

Set these in every environment:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_GROWTH_MONTHLY_PRICE_ID=
STRIPE_GROWTH_ANNUAL_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
```

## Sandbox Setup

1. Open the Stripe test account.
2. Create or verify the `Growth` monthly and annual prices.
3. Create or verify the `Pro` monthly and annual prices.
4. Copy the test-mode price IDs into the sandbox environment variables.
5. Copy the test-mode API secret into `STRIPE_SECRET_KEY`.
6. Configure the webhook endpoint for the sandbox app URL and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

## Production Setup

1. Open the Stripe live account.
2. Create matching live-mode prices for `Growth` and `Pro`.
3. Copy the live-mode price IDs into the production environment variables.
4. Copy the live-mode API secret into `STRIPE_SECRET_KEY`.
5. Configure the production webhook endpoint and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

## Important Rules

- Do not reuse test price IDs in production.
- Do not reuse live price IDs in sandbox.
- Keep the plan tiers stable in code: `starter`, `growth`, `pro`.
- If you change the displayed price in `src/lib/subscription-plans.ts`, create matching Stripe prices in both Stripe accounts and update the corresponding env vars.
- If you archive and replace a Stripe price, update the env var. The app resolves checkout and webhook mapping through those values.

## Typical Deployment Mapping

- Local development: Stripe test account credentials and test price IDs
- Preview or staging: Stripe test account credentials and test price IDs
- Production: Stripe live account credentials and live price IDs

## Validation Checklist

- Checkout for Pro monthly starts a Stripe session with the expected account price.
- Checkout for Pro annual starts a Stripe session with the expected account price.
- Webhook events from that environment resolve the incoming Stripe price ID back to the correct internal tier.
- The homepage and `/pricing` show the same plan names and displayed prices.
