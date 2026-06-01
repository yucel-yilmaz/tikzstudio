-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "engine" "LatexEngine" NOT NULL DEFAULT 'TECTONIC',
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TemplateFile" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isBinary" BOOLEAN NOT NULL DEFAULT false,
    "binaryContent" BYTEA,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateFile_templateId_idx" ON "TemplateFile"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateFile_templateId_path_key" ON "TemplateFile"("templateId", "path");

-- AddForeignKey
ALTER TABLE "TemplateFile" ADD CONSTRAINT "TemplateFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
