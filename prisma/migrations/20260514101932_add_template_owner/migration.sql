-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Template_ownerId_idx" ON "Template"("ownerId");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
