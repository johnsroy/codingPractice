-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "VerificationDocKind" AS ENUM ('government_id', 'retirement_proof', 'teaching_credential', 'professional_membership', 'address_proof', 'other');

-- CreateEnum
CREATE TYPE "VerificationDocStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationProvider" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "verificationReviewedAt" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "VerificationDocKind" NOT NULL DEFAULT 'other',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "status" "VerificationDocStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationDocument_userId_idx" ON "VerificationDocument"("userId");

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
