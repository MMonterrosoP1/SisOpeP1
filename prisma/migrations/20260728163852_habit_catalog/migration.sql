-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `role` ENUM('ADMIN', 'DOCTOR', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `banned` BOOLEAN NULL DEFAULT false,
    `banReason` TEXT NULL,
    `banExpires` DATETIME(3) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `impersonatedBy` TEXT NULL,

    UNIQUE INDEX `session_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `idToken` TEXT NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `verification_identifier_idx`(`identifier`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `acronym` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `company_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workplace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `workplace_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `work_area_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_position_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encounter_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `encounter_type_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupational_exposure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `occupational_exposure_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_disability` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `work_disability_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surgical_procedure_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `surgical_procedure_catalog_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `referral_level_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_aptitude` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `medical_aptitude_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relationship_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `relationship_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `icd10_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `chapter` VARCHAR(191) NULL,
    `block` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `icd10_code_code_key`(`code`),
    INDEX `icd10_code_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergy_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `allergy_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergen_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `allergyCategoryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `allergen_catalog_name_allergyCategoryId_key`(`name`, `allergyCategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habit_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `habit_catalog_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disease_type_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `disease_type_catalog_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marital_status_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sex` ENUM('MALE', 'FEMALE') NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_type_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `blood_type_catalog_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `givenNames` VARCHAR(191) NOT NULL,
    `familyNames` VARCHAR(191) NOT NULL,
    `documentType` ENUM('DPI', 'PASSPORT', 'OTHER') NOT NULL DEFAULT 'DPI',
    `identityDocument` VARCHAR(191) NOT NULL,
    `birthDate` DATE NOT NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `maritalStatusId` INTEGER NOT NULL,
    `phone` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `workplaceId` INTEGER NOT NULL,
    `workAreaId` INTEGER NOT NULL,
    `jobPositionId` INTEGER NOT NULL,
    `bloodTypeId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `patient_identityDocument_key`(`identityDocument`),
    INDEX `patient_companyId_idx`(`companyId`),
    INDEX `patient_identityDocument_idx`(`identityDocument`),
    INDEX `patient_familyNames_givenNames_idx`(`familyNames`, `givenNames`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `relationshipTypeId` INTEGER NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encounter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `practitionerId` VARCHAR(191) NOT NULL,
    `encounterTypeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isFirstVisit` BOOLEAN NOT NULL DEFAULT false,
    `symptomatology` TEXT NULL,
    `illnessHistory` TEXT NULL,
    `gynecologicalHistory` TEXT NULL,
    `pregnancyStatus` ENUM('PREGNANT', 'POSTPARTUM', 'NOT_PREGNANT', 'NOT_APPLICABLE') NOT NULL DEFAULT 'NOT_APPLICABLE',
    `sleepHours` DOUBLE NULL,
    `medicationsAdministered` TEXT NULL,
    `suspensionHours` INTEGER NULL,
    `referralLevelId` INTEGER NULL,
    `medicalAptitudeId` INTEGER NULL,
    `internalObservation` TEXT NULL,
    `employerObservation` TEXT NULL,
    `followUpDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `encounter_patientId_idx`(`patientId`),
    INDEX `encounter_date_idx`(`date`),
    INDEX `encounter_practitionerId_idx`(`practitionerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vital_sign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `systolicBP` DOUBLE NULL,
    `diastolicBP` DOUBLE NULL,
    `heartRate` DOUBLE NULL,
    `respiratoryRate` DOUBLE NULL,
    `oxygenSaturation` DOUBLE NULL,
    `glucose` DOUBLE NULL,
    `temperature` DOUBLE NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vital_sign_encounterId_key`(`encounterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anthropometry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `bmiCategory` ENUM('UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE_I', 'OBESE_II', 'OBESE_III') NULL,
    `abdominalCircumference` DOUBLE NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `anthropometry_encounterId_key`(`encounterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupational_exposure_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `occupationalExposureId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    UNIQUE INDEX `occupational_exposure_entry_encounterId_occupationalExposure_key`(`encounterId`, `occupationalExposureId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_disability_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `workDisabilityId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    UNIQUE INDEX `work_disability_entry_encounterId_workDisabilityId_key`(`encounterId`, `workDisabilityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_history_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surgical_history_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `surgicalProcedureId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trauma_history_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_history_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `observations` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `allergenCatalogId` INTEGER NOT NULL,
    `detail` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `habitCatalogId` INTEGER NOT NULL,
    `duration` VARCHAR(191) NULL,
    `quantity` DOUBLE NULL,
    `frequency` ENUM('DAILY', 'WEEKLY') NULL,
    `observations` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `doesExercise` BOOLEAN NOT NULL DEFAULT false,
    `sportType` VARCHAR(191) NULL,
    `timesPerWeek` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diagnosis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `icd10CodeId` INTEGER NOT NULL,
    `diseaseTypeId` INTEGER NULL,
    `observations` TEXT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_certificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encounterId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `issuedByUserId` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pdfUrl` TEXT NULL,

    UNIQUE INDEX `medical_certificate_encounterId_key`(`encounterId`),
    INDEX `medical_certificate_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `previousData` JSON NULL,
    `newData` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rate_limit` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `lastRequest` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergen_catalog` ADD CONSTRAINT `allergen_catalog_allergyCategoryId_fkey` FOREIGN KEY (`allergyCategoryId`) REFERENCES `allergy_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_workplaceId_fkey` FOREIGN KEY (`workplaceId`) REFERENCES `workplace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_workAreaId_fkey` FOREIGN KEY (`workAreaId`) REFERENCES `work_area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_maritalStatusId_fkey` FOREIGN KEY (`maritalStatusId`) REFERENCES `marital_status_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_bloodTypeId_fkey` FOREIGN KEY (`bloodTypeId`) REFERENCES `blood_type_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contact` ADD CONSTRAINT `emergency_contact_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contact` ADD CONSTRAINT `emergency_contact_relationshipTypeId_fkey` FOREIGN KEY (`relationshipTypeId`) REFERENCES `relationship_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_encounterTypeId_fkey` FOREIGN KEY (`encounterTypeId`) REFERENCES `encounter_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_referralLevelId_fkey` FOREIGN KEY (`referralLevelId`) REFERENCES `referral_level`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_medicalAptitudeId_fkey` FOREIGN KEY (`medicalAptitudeId`) REFERENCES `medical_aptitude`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vital_sign` ADD CONSTRAINT `vital_sign_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anthropometry` ADD CONSTRAINT `anthropometry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `occupational_exposure_entry` ADD CONSTRAINT `occupational_exposure_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `occupational_exposure_entry` ADD CONSTRAINT `occupational_exposure_entry_occupationalExposureId_fkey` FOREIGN KEY (`occupationalExposureId`) REFERENCES `occupational_exposure`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_disability_entry` ADD CONSTRAINT `work_disability_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_disability_entry` ADD CONSTRAINT `work_disability_entry_workDisabilityId_fkey` FOREIGN KEY (`workDisabilityId`) REFERENCES `work_disability`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_history_entry` ADD CONSTRAINT `medical_history_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_history_entry` ADD CONSTRAINT `medical_history_entry_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgical_history_entry` ADD CONSTRAINT `surgical_history_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgical_history_entry` ADD CONSTRAINT `surgical_history_entry_surgicalProcedureId_fkey` FOREIGN KEY (`surgicalProcedureId`) REFERENCES `surgical_procedure_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trauma_history_entry` ADD CONSTRAINT `trauma_history_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trauma_history_entry` ADD CONSTRAINT `trauma_history_entry_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_history_entry` ADD CONSTRAINT `family_history_entry_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_history_entry` ADD CONSTRAINT `family_history_entry_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergy` ADD CONSTRAINT `allergy_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergy` ADD CONSTRAINT `allergy_allergenCatalogId_fkey` FOREIGN KEY (`allergenCatalogId`) REFERENCES `allergen_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habit` ADD CONSTRAINT `habit_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habit` ADD CONSTRAINT `habit_habitCatalogId_fkey` FOREIGN KEY (`habitCatalogId`) REFERENCES `habit_catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise` ADD CONSTRAINT `exercise_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnosis` ADD CONSTRAINT `diagnosis_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnosis` ADD CONSTRAINT `diagnosis_icd10CodeId_fkey` FOREIGN KEY (`icd10CodeId`) REFERENCES `icd10_code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnosis` ADD CONSTRAINT `diagnosis_diseaseTypeId_fkey` FOREIGN KEY (`diseaseTypeId`) REFERENCES `disease_type_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_certificate` ADD CONSTRAINT `medical_certificate_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_certificate` ADD CONSTRAINT `medical_certificate_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_certificate` ADD CONSTRAINT `medical_certificate_issuedByUserId_fkey` FOREIGN KEY (`issuedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
