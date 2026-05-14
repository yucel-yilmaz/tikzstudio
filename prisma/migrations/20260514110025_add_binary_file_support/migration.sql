-- AlterTable
ALTER TABLE "ProjectFile" ADD COLUMN     "binaryContent" BYTEA,
ADD COLUMN     "isBinary" BOOLEAN NOT NULL DEFAULT false;
