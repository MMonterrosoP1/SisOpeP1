-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `session` ADD COLUMN `practitionerId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));
