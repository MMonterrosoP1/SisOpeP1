SET FOREIGN_KEY_CHECKS = 0;

-- DropForeignKey (con IF EXISTS para compatibilidad con producción)
ALTER TABLE `allergy` DROP FOREIGN KEY IF EXISTS `allergy_allergenCatalogId_fkey`;
ALTER TABLE `allergy` DROP FOREIGN KEY IF EXISTS `allergy_encounterId_fkey`;
ALTER TABLE `exercise` DROP FOREIGN KEY IF EXISTS `exercise_encounterId_fkey`;
ALTER TABLE `family_history_entry` DROP FOREIGN KEY IF EXISTS `family_history_entry_encounterId_fkey`;
ALTER TABLE `family_history_entry` DROP FOREIGN KEY IF EXISTS `family_history_entry_icd10CodeId_fkey`;
ALTER TABLE `habit` DROP FOREIGN KEY IF EXISTS `habit_encounterId_fkey`;
ALTER TABLE `habit` DROP FOREIGN KEY IF EXISTS `habit_habitCatalogId_fkey`;
ALTER TABLE `medical_history_entry` DROP FOREIGN KEY IF EXISTS `medical_history_entry_encounterId_fkey`;
ALTER TABLE `medical_history_entry` DROP FOREIGN KEY IF EXISTS `medical_history_entry_icd10CodeId_fkey`;
ALTER TABLE `patient` DROP FOREIGN KEY IF EXISTS `patient_workAreaId_fkey`;
ALTER TABLE `surgical_history_entry` DROP FOREIGN KEY IF EXISTS `surgical_history_entry_encounterId_fkey`;
ALTER TABLE `surgical_history_entry` DROP FOREIGN KEY IF EXISTS `surgical_history_entry_surgicalProcedureId_fkey`;
ALTER TABLE `trauma_history_entry` DROP FOREIGN KEY IF EXISTS `trauma_history_entry_encounterId_fkey`;
ALTER TABLE `trauma_history_entry` DROP FOREIGN KEY IF EXISTS `trauma_history_entry_icd10CodeId_fkey`;

-- DropIndex (con IF EXISTS)
DROP INDEX IF EXISTS `encounter_date_idx` ON `encounter`;
DROP INDEX IF EXISTS `patient_familyNames_givenNames_idx` ON `patient`;
DROP INDEX IF EXISTS `patient_identityDocument_idx` ON `patient`;
DROP INDEX IF EXISTS `patient_identityDocument_key` ON `patient`;
DROP INDEX IF EXISTS `patient_workAreaId_fkey` ON `patient`;
DROP INDEX IF EXISTS `verification_identifier_idx` ON `verification`;

-- AlterTable
ALTER TABLE `allergen_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `allergy_category`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `anthropometry` DROP COLUMN IF EXISTS `recordedAt`;

-- AlterTable
ALTER TABLE `blood_type_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `company`
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `disease_type_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `document_type_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `encounter`
    DROP COLUMN IF EXISTS `date`,
    DROP COLUMN IF EXISTS `suspensionHours`,
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `suspensionHourId` INTEGER NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `encounter_type`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL,
    MODIFY `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `habit_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `job_position`
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `marital_status_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `medical_aptitude`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `occupational_exposure`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `patient`
    DROP COLUMN IF EXISTS `birthDate`,
    DROP COLUMN IF EXISTS `documentType`,
    DROP COLUMN IF EXISTS `familyNames`,
    DROP COLUMN IF EXISTS `givenNames`,
    DROP COLUMN IF EXISTS `identityDocument`,
    DROP COLUMN IF EXISTS `phone`,
    DROP COLUMN IF EXISTS `sex`,
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `personId` INTEGER NOT NULL,
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL,
    MODIFY `workAreaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `referral_level`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `relationship_type`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `surgical_procedure_catalog`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user`
    DROP COLUMN IF EXISTS `metadata`,
    ADD COLUMN IF NOT EXISTS `personId` INTEGER NULL,
    ADD COLUMN IF NOT EXISTS `preamble` TEXT NULL;

-- AlterTable
ALTER TABLE `vital_sign` DROP COLUMN IF EXISTS `recordedAt`;

-- AlterTable
ALTER TABLE `work_area`
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `work_disability`
    ADD COLUMN IF NOT EXISTS `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `workplace`
    ADD COLUMN IF NOT EXISTS `createdBy` VARCHAR(191) NULL,
    ADD COLUMN IF NOT EXISTS `type` ENUM('OBRA', 'OFICINA', 'PLANTA', 'PLANTA_ADMINISTRATIVO') NOT NULL DEFAULT 'OFICINA',
    ADD COLUMN IF NOT EXISTS `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS `updatedBy` VARCHAR(191) NULL;

-- DropTable (con IF EXISTS para tablas que solo existen en dev)
DROP TABLE IF EXISTS `allergy`;
DROP TABLE IF EXISTS `exercise`;
DROP TABLE IF EXISTS `family_history_entry`;
DROP TABLE IF EXISTS `habit`;
DROP TABLE IF EXISTS `medical_history_entry`;
DROP TABLE IF EXISTS `surgical_history_entry`;
DROP TABLE IF EXISTS `trauma_history_entry`;

-- CreateTable
CREATE TABLE IF NOT EXISTS `suspension_hour_catalog` (
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
CREATE TABLE IF NOT EXISTS `person` (
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
CREATE TABLE IF NOT EXISTS `patient_medical_history` (
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
CREATE TABLE IF NOT EXISTS `patient_surgical_history` (
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
CREATE TABLE IF NOT EXISTS `patient_trauma_history` (
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
CREATE TABLE IF NOT EXISTS `patient_family_history` (
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
CREATE TABLE IF NOT EXISTS `patient_allergy` (
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
CREATE TABLE IF NOT EXISTS `patient_habit` (
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
CREATE TABLE IF NOT EXISTS `patient_exercise` (
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
CREATE TABLE IF NOT EXISTS `exercise_catalog` (
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

-- CreateIndex (con IF NOT EXISTS)
CREATE FULLTEXT INDEX IF NOT EXISTS `icd10_code_description_idx` ON `icd10_code`(`description`);
CREATE UNIQUE INDEX IF NOT EXISTS `marital_status_catalog_name_key` ON `marital_status_catalog`(`name`);
CREATE UNIQUE INDEX IF NOT EXISTS `patient_personId_key` ON `patient`(`personId`);
CREATE UNIQUE INDEX IF NOT EXISTS `user_personId_key` ON `user`(`personId`);
CREATE INDEX IF NOT EXISTS `verification_identifier_idx` ON `verification`(`identifier`(191));

-- AddForeignKey (con IF NOT EXISTS via CONSTRAINT check)
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

SET FOREIGN_KEY_CHECKS = 1;

