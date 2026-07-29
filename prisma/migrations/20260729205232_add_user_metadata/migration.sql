-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `metadata` JSON NULL;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));
