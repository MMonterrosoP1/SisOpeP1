/*
  Custom data migration script to move Doctor data to Practitioner table
*/

-- 1. Create the new practitioner table FIRST
CREATE TABLE `practitioner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `givenNames` VARCHAR(191) NOT NULL,
    `familyNames` VARCHAR(191) NOT NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `preamble` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `practitioner_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Migrate data from User/Person to Practitioner
INSERT INTO `practitioner` (`userId`, `givenNames`, `familyNames`, `sex`, `preamble`, `createdAt`, `updatedAt`)
SELECT 
    u.`id`, 
    p.`givenNames`, 
    p.`familyNames`, 
    p.`sex`, 
    u.`preamble`,
    NOW(), 
    NOW()
FROM `user` u
JOIN `person` p ON u.`personId` = p.`id`
WHERE u.`role` = 'DOCTOR';

-- 3. Prepare Encounter table
ALTER TABLE `encounter` DROP FOREIGN KEY `encounter_practitionerId_fkey`;
ALTER TABLE `encounter` ADD COLUMN `newPractitionerId` INTEGER;

-- Migrate Encounter data
UPDATE `encounter` e 
JOIN `practitioner` p ON e.`practitionerId` = p.`userId` 
SET e.`newPractitionerId` = p.`id`;

-- Clean up and swap Encounter columns
ALTER TABLE `encounter` DROP COLUMN `practitionerId`;
ALTER TABLE `encounter` CHANGE `newPractitionerId` `practitionerId` INTEGER NOT NULL;

-- 4. Prepare Document table
ALTER TABLE `document` DROP FOREIGN KEY `document_issuedByUserId_fkey`;
ALTER TABLE `document` ADD COLUMN `issuedByPractitionerId` INTEGER;

-- Migrate Document data
UPDATE `document` d 
JOIN `practitioner` p ON d.`issuedByUserId` = p.`userId` 
SET d.`issuedByPractitionerId` = p.`id`;

-- Clean up and swap Document columns
ALTER TABLE `document` DROP COLUMN `issuedByUserId`;
ALTER TABLE `document` MODIFY `issuedByPractitionerId` INTEGER NOT NULL;

-- 5. Drop old User columns and foreign key
ALTER TABLE `user` DROP FOREIGN KEY `user_personId_fkey`;
DROP INDEX `user_personId_key` ON `user`;
ALTER TABLE `user` DROP COLUMN `personId`,
                   DROP COLUMN `preamble`;

-- 6. Add constraints
ALTER TABLE `practitioner` ADD CONSTRAINT `practitioner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `encounter` ADD CONSTRAINT `encounter_practitionerId_fkey` FOREIGN KEY (`practitionerId`) REFERENCES `practitioner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `document` ADD CONSTRAINT `document_issuedByPractitionerId_fkey` FOREIGN KEY (`issuedByPractitionerId`) REFERENCES `practitioner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Drop Triggers
DROP TRIGGER IF EXISTS after_person_update;
DROP TRIGGER IF EXISTS after_person_insert;
