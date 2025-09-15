/*
  Warnings:

  - You are about to drop the column `attachments` on the `assignment_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `assignment_submissions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED');

-- AlterTable
ALTER TABLE "public"."assignment_submissions" DROP COLUMN "attachments",
DROP COLUMN "score",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "gradedBy" TEXT,
ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "public"."assignments" ADD COLUMN     "allowedFileTypes" TEXT[];
