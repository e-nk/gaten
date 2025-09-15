-- CreateEnum
CREATE TYPE "public"."InteractiveType" AS ENUM ('DRAG_DROP', 'HOTSPOT', 'SEQUENCE', 'MATCHING', 'TIMELINE', 'SIMULATION', 'WIDGET', 'H5P');

-- CreateTable
CREATE TABLE "public"."interactive_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."InteractiveType" NOT NULL,
    "config" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "passingScore" DOUBLE PRECISION,
    "showFeedback" BOOLEAN NOT NULL DEFAULT true,
    "allowReplay" BOOLEAN NOT NULL DEFAULT true,
    "timeLimit" INTEGER,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interactive_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interactive_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "interactive_attempts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."interactive_contents" ADD CONSTRAINT "interactive_contents_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interactive_attempts" ADD CONSTRAINT "interactive_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interactive_attempts" ADD CONSTRAINT "interactive_attempts_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."interactive_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
