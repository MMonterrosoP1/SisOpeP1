-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `person` ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));
