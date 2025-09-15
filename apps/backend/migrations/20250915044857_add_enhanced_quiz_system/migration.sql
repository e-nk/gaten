/*
  Warnings:

  - You are about to drop the column `options` on the `quiz_questions` table. All the data in the column will be lost.
  - Added the required column `content` to the `quiz_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `quiz_questions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `correctAnswer` on the `quiz_questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."QuestionType" ADD VALUE 'MULTIPLE_SELECT';
ALTER TYPE "public"."QuestionType" ADD VALUE 'ESSAY';
ALTER TYPE "public"."QuestionType" ADD VALUE 'MATCHING';
ALTER TYPE "public"."QuestionType" ADD VALUE 'ORDERING';
ALTER TYPE "public"."QuestionType" ADD VALUE 'IMAGE_HOTSPOT';

-- AlterTable
ALTER TABLE "public"."quiz_attempts" ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "timeSpent" INTEGER,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."quiz_questions" DROP COLUMN "options",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" DROP DEFAULT,
DROP COLUMN "correctAnswer",
ADD COLUMN     "correctAnswer" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."quizzes" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableUntil" TIMESTAMP(3),
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
ADD COLUMN     "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeLimit" INTEGER;
