ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "responsivenessScore" INTEGER DEFAULT 0;
ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "solutionScore" INTEGER DEFAULT 0;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "centreId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nip" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fraksi" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jabatan" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dapil" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kabupaten" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kecamatan" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSync" BOOLEAN DEFAULT false;

-- Table for Fitur Tindak Lanjut Aspirasi & Transkrip
CREATE TABLE IF NOT EXISTS "FollowUp" (
    "id" SERIAL PRIMARY KEY,
    "scheduleId" INTEGER NOT NULL REFERENCES "Schedule"("id") ON DELETE CASCADE,
    "isShared" BOOLEAN DEFAULT false,
    "sharedTo" TEXT,
    "sharedToEmail" TEXT,
    "sharedBy" TEXT,
    "sharedAt" TIMESTAMP(3),
    "shareChannel" TEXT DEFAULT 'Disposisi Resmi',
    "shareNotes" TEXT,
    "isViewed" BOOLEAN DEFAULT false,
    "viewedBy" TEXT,
    "viewedPosition" TEXT,
    "viewedAt" TIMESTAMP(3),
    "hasComment" BOOLEAN DEFAULT false,
    "recipientComment" TEXT,
    "recipientName" TEXT,
    "recipientPosition" TEXT,
    "recipientCommentAt" TIMESTAMP(3),
    "actionCategory" TEXT,
    "status" TEXT DEFAULT 'pending',
    "isCompleted" BOOLEAN DEFAULT false,
    "actionReport" TEXT,
    "actionReportAt" TIMESTAMP(3),
    "picName" TEXT,
    "picContact" TEXT,
    "evidenceUrl" TEXT,
    "progressPercent" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
