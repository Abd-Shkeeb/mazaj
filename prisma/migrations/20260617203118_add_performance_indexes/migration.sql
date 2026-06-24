-- CreateTable
CREATE TABLE "Cafe" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "phone" TEXT,
    "addressAr" TEXT,
    "addressEn" TEXT,
    "workingHoursAr" TEXT,
    "workingHoursEn" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE_TRIAL',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Cafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "cafeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mood" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "Mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drink" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Hot',
    "caffeine" INTEGER NOT NULL DEFAULT 5,
    "energy" INTEGER NOT NULL DEFAULT 5,
    "sweetness" INTEGER NOT NULL DEFAULT 5,
    "isHot" BOOLEAN NOT NULL DEFAULT true,
    "cafeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "drinkId" TEXT NOT NULL,
    "drinkName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cafeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "moodId" TEXT,
    "drinkId" TEXT,
    "cafeId" TEXT NOT NULL,
    "userMood" TEXT NOT NULL,
    "aiResult" TEXT NOT NULL,
    "feedbackVal" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_slug_key" ON "Cafe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_cafeId_idx" ON "User"("cafeId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "Mood_nameEn_idx" ON "Mood"("nameEn");

-- CreateIndex
CREATE INDEX "Mood_nameAr_idx" ON "Mood"("nameAr");

-- CreateIndex
CREATE INDEX "Drink_cafeId_idx" ON "Drink"("cafeId");

-- CreateIndex
CREATE INDEX "Drink_cafeId_isAvailable_idx" ON "Drink"("cafeId", "isAvailable");

-- CreateIndex
CREATE INDEX "Drink_nameEn_idx" ON "Drink"("nameEn");

-- CreateIndex
CREATE INDEX "Drink_nameAr_idx" ON "Drink"("nameAr");

-- CreateIndex
CREATE INDEX "Order_cafeId_status_idx" ON "Order"("cafeId", "status");

-- CreateIndex
CREATE INDEX "Order_cafeId_createdAt_idx" ON "Order"("cafeId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_drinkId_idx" ON "Order"("drinkId");

-- CreateIndex
CREATE INDEX "Analysis_cafeId_idx" ON "Analysis"("cafeId");

-- CreateIndex
CREATE INDEX "Analysis_cafeId_createdAt_idx" ON "Analysis"("cafeId", "createdAt");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_cafeId_moodId_idx" ON "Analysis"("cafeId", "moodId");

-- CreateIndex
CREATE INDEX "Analysis_cafeId_drinkId_idx" ON "Analysis"("cafeId", "drinkId");

-- CreateIndex
CREATE INDEX "Analysis_cafeId_userId_idx" ON "Analysis"("cafeId", "userId");

-- CreateIndex
CREATE INDEX "Event_cafeId_idx" ON "Event"("cafeId");

-- CreateIndex
CREATE INDEX "Event_cafeId_createdAt_idx" ON "Event"("cafeId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_cafeId_name_idx" ON "Event"("cafeId", "name");

-- CreateIndex
CREATE INDEX "Event_name_createdAt_idx" ON "Event"("name", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drink" ADD CONSTRAINT "Drink_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "Mood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_drinkId_fkey" FOREIGN KEY ("drinkId") REFERENCES "Drink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
