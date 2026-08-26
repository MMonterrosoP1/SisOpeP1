-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- RenameIndex
ALTER TABLE `encounter` RENAME INDEX `encounter_practitionerId_fkey` TO `encounter_practitionerId_idx`;
