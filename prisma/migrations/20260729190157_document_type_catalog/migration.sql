/*
  Warnings:

  - You are about to drop the `medical_certificate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `medical_certificate` DROP FOREIGN KEY `medical_certificate_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_certificate` DROP FOREIGN KEY `medical_certificate_issuedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_certificate` DROP FOREIGN KEY `medical_certificate_patientId_fkey`;

-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- DropTable
DROP TABLE `medical_certificate`;

-- CreateTable
CREATE TABLE `document_type_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `document_type_catalog_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `documentTypeId` INTEGER NOT NULL,
    `issuedByUserId` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pdfUrl` TEXT NULL,

    INDEX `document_patientId_idx`(`patientId`),
    INDEX `document_documentTypeId_idx`(`documentTypeId`),
    UNIQUE INDEX `document_encounterId_documentTypeId_key`(`encounterId`, `documentTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_type_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_issuedByUserId_fkey` FOREIGN KEY (`issuedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
