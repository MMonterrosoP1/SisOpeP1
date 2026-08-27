-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));
