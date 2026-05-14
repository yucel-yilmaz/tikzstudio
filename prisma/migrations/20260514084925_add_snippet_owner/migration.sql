-- AlterTable
ALTER TABLE "Snippet" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Snippet_ownerId_idx" ON "Snippet"("ownerId");

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
