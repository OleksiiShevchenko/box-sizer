UPDATE "Subscription"
SET "tier" = 'growth'
WHERE "tier" = 'pro';

UPDATE "Subscription"
SET "tier" = 'pro'
WHERE "tier" = 'business';
