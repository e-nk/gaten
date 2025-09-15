-- AlterTable
ALTER TABLE "public"."assignments" ADD COLUMN     "maxFileSize" INTEGER NOT NULL DEFAULT 10,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "instructions" DROP NOT NULL,
ALTER COLUMN "allowLateSubmission" SET DEFAULT false,
ALTER COLUMN "allowedFileTypes" SET DEFAULT ARRAY['pdf', 'doc', 'docx']::TEXT[];
