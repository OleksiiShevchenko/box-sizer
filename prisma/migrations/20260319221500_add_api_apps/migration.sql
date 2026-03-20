-- CreateTable
CREATE TABLE "ApiApp" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiApp_publicId_key" ON "ApiApp"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiApp_clientId_key" ON "ApiApp"("clientId");

-- CreateIndex
CREATE INDEX "ApiApp_userId_idx" ON "ApiApp"("userId");

-- CreateIndex
CREATE INDEX "ApiApp_clientId_idx" ON "ApiApp"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_tokenHash_idx" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_appId_idx" ON "ApiToken"("appId");

-- AddForeignKey
ALTER TABLE "ApiApp" ADD CONSTRAINT "ApiApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_appId_fkey" FOREIGN KEY ("appId") REFERENCES "ApiApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
