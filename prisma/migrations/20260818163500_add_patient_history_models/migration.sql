-- DropForeignKey
ALTER TABLE `allergy` DROP FOREIGN KEY `allergy_allergenCatalogId_fkey`;

-- DropForeignKey
ALTER TABLE `allergy` DROP FOREIGN KEY `allergy_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `exercise` DROP FOREIGN KEY `exercise_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `family_history_entry` DROP FOREIGN KEY `family_history_entry_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `family_history_entry` DROP FOREIGN KEY `family_history_entry_icd10CodeId_fkey`;

-- DropForeignKey
ALTER TABLE `habit` DROP FOREIGN KEY `habit_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `habit` DROP FOREIGN KEY `habit_habitCatalogId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_history_entry` DROP FOREIGN KEY `medical_history_entry_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `medical_history_entry` DROP FOREIGN KEY `medical_history_entry_icd10CodeId_fkey`;

-- DropForeignKey
ALTER TABLE `patient` DROP FOREIGN KEY `patient_workAreaId_fkey`;

-- DropForeignKey
ALTER TABLE `surgical_history_entry` DROP FOREIGN KEY `surgical_history_entry_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `surgical_history_entry` DROP FOREIGN KEY `surgical_history_entry_surgicalProcedureId_fkey`;

-- DropForeignKey
ALTER TABLE `trauma_history_entry` DROP FOREIGN KEY `trauma_history_entry_encounterId_fkey`;

-- DropForeignKey
ALTER TABLE `trauma_history_entry` DROP FOREIGN KEY `trauma_history_entry_icd10CodeId_fkey`;

-- DropIndex
DROP INDEX `encounter_date_idx` ON `encounter`;

-- DropIndex
DROP INDEX `patient_familyNames_givenNames_idx` ON `patient`;

-- DropIndex
DROP INDEX `patient_identityDocument_idx` ON `patient`;

-- DropIndex
DROP INDEX `patient_identityDocument_key` ON `patient`;

-- DropIndex
DROP INDEX `patient_workAreaId_fkey` ON `patient`;

-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `allergen_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `allergy_category` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `anthropometry` DROP COLUMN `recordedAt`;

-- AlterTable
ALTER TABLE `blood_type_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `company` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `disease_type_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `document_type_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `encounter` DROP COLUMN `date`,
    DROP COLUMN `suspensionHours`,
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `suspensionHourId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `encounter_type` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    MODIFY `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `habit_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `job_position` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `marital_status_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `medical_aptitude` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `occupational_exposure` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `patient` DROP COLUMN `birthDate`,
    DROP COLUMN `documentType`,
    DROP COLUMN `familyNames`,
    DROP COLUMN `givenNames`,
    DROP COLUMN `identityDocument`,
    DROP COLUMN `phone`,
    DROP COLUMN `sex`,
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `personId` INTEGER NOT NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    MODIFY `workAreaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `referral_level` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `relationship_type` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `surgical_procedure_catalog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `metadata`,
    ADD COLUMN `personId` INTEGER NULL,
    ADD COLUMN `preamble` TEXT NULL;

-- AlterTable
ALTER TABLE `vital_sign` DROP COLUMN `recordedAt`;

-- AlterTable
ALTER TABLE `work_area` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `work_disability` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `workplace` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NOT NULL DEFAULT 'OFICINA',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedBy` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `allergy`;

-- DropTable
DROP TABLE `exercise`;

-- DropTable
DROP TABLE `family_history_entry`;

-- DropTable
DROP TABLE `habit`;

-- DropTable
DROP TABLE `medical_history_entry`;

-- DropTable
DROP TABLE `surgical_history_entry`;

-- DropTable
DROP TABLE `trauma_history_entry`;

-- CreateTable
CREATE TABLE `suspension_hour_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `suspension_hour_catalog_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `givenNames` VARCHAR(191) NOT NULL,
    `familyNames` VARCHAR(191) NOT NULL,
    `documentType` ENUM('DPI', 'PASSPORT', 'OTHER') NOT NULL DEFAULT 'DPI',
    `identityDocument` VARCHAR(191) NOT NULL,
    `birthDate` DATE NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `person_identityDocument_key`(`identityDocument`),
    INDEX `person_familyNames_givenNames_idx`(`familyNames`, `givenNames`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_medical_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_medical_history_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_surgical_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `surgicalProcedureId` INTEGER NOT NULL,
    `observations` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_surgical_history_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_trauma_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_trauma_history_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_family_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_family_history_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_allergy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `allergenCatalogId` INTEGER NOT NULL,
    `detail` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_allergy_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_habit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `habitCatalogId` INTEGER NOT NULL,
    `duration` VARCHAR(191) NULL,
    `quantity` DOUBLE NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'OCCASIONAL', 'FORMER') NULL,
    `observations` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_habit_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_exercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `exerciseCatalogId` INTEGER NOT NULL,
    `timesPerWeek` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `patient_exercise_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `exercise_catalog_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE FULLTEXT INDEX `icd10_code_description_idx` ON `icd10_code`(`description`);

-- CreateIndex
CREATE UNIQUE INDEX `marital_status_catalog_name_key` ON `marital_status_catalog`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `patient_personId_key` ON `patient`(`personId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_personId_key` ON `user`(`personId`);

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_workAreaId_fkey` FOREIGN KEY (`workAreaId`) REFERENCES `work_area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_medical_history` ADD CONSTRAINT `patient_medical_history_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_medical_history` ADD CONSTRAINT `patient_medical_history_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_surgical_history` ADD CONSTRAINT `patient_surgical_history_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_surgical_history` ADD CONSTRAINT `patient_surgical_history_surgicalProcedureId_fkey` FOREIGN KEY (`surgicalProcedureId`) REFERENCES `surgical_procedure_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_trauma_history` ADD CONSTRAINT `patient_trauma_history_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_trauma_history` ADD CONSTRAINT `patient_trauma_history_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_family_history` ADD CONSTRAINT `patient_family_history_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_family_history` ADD CONSTRAINT `patient_family_history_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_allergy` ADD CONSTRAINT `patient_allergy_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_allergy` ADD CONSTRAINT `patient_allergy_allergenCatalogId_fkey` FOREIGN KEY (`allergenCatalogId`) REFERENCES `allergen_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_habit` ADD CONSTRAINT `patient_habit_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_habit` ADD CONSTRAINT `patient_habit_habitCatalogId_fkey` FOREIGN KEY (`habitCatalogId`) REFERENCES `habit_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_exercise` ADD CONSTRAINT `patient_exercise_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_exercise` ADD CONSTRAINT `patient_exercise_exerciseCatalogId_fkey` FOREIGN KEY (`exerciseCatalogId`) REFERENCES `exercise_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_suspensionHourId_fkey` FOREIGN KEY (`suspensionHourId`) REFERENCES `suspension_hour_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `diagnosis` RENAME INDEX `diagnosis_encounterId_fkey` TO `diagnosis_encounterId_idx`;

