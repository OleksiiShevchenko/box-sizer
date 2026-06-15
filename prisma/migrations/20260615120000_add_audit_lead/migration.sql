CREATE TABLE "AuditLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "monthlyShipments" INTEGER NOT NULL,
    "segment" TEXT NOT NULL,
    "intlShare" TEXT NOT NULL,
    "effectivePremiumPct" DOUBLE PRECISION NOT NULL,
    "monthlyLeakUsd" INTEGER NOT NULL,
    "annualLeakUsd" INTEGER NOT NULL,
    "lowExposure" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLead_createdAt_idx" ON "AuditLead"("createdAt");

CREATE INDEX "AuditLead_email_idx" ON "AuditLead"("email");
