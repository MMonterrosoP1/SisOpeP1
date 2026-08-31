-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- CreateTable
CREATE TABLE `affected_system` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `affected_system_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encounter_affected_system` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `affectedSystemId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    UNIQUE INDEX `encounter_affected_system_encounterId_affectedSystemId_key`(`encounterId`, `affectedSystemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey
ALTER TABLE `encounter_affected_system` ADD CONSTRAINT `encounter_affected_system_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter_affected_system` ADD CONSTRAINT `encounter_affected_system_affectedSystemId_fkey` FOREIGN KEY (`affectedSystemId`) REFERENCES `affected_system`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
