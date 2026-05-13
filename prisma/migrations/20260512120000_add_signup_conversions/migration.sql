CREATE TABLE "SignupConversion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupConversion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SignupConversion_userId_conversion_key" ON "SignupConversion"("userId", "conversion");

CREATE INDEX "SignupConversion_conversion_createdAt_idx" ON "SignupConversion"("conversion", "createdAt");

ALTER TABLE "SignupConversion" ADD CONSTRAINT "SignupConversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
