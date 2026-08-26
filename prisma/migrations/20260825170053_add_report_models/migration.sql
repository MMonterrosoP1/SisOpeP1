-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `suspension_hour_catalog` ADD COLUMN `hours` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `workforce_snapshot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workplaceId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `totalWorkers` INTEGER NOT NULL,
    `maleWorkers` INTEGER NOT NULL DEFAULT 0,
    `femaleWorkers` INTEGER NOT NULL DEFAULT 0,
    `scheduledDays` INTEGER NOT NULL DEFAULT 22,
    `observations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `workforce_snapshot_year_month_idx`(`year`, `month`),
    UNIQUE INDEX `workforce_snapshot_workplaceId_year_month_key`(`workplaceId`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey
ALTER TABLE `workforce_snapshot` ADD CONSTRAINT `workforce_snapshot_workplaceId_fkey` FOREIGN KEY (`workplaceId`) REFERENCES `workplace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
