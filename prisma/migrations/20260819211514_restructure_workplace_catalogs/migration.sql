/*
  Warnings:

  - The values [PLANTA_ADMINISTRATIVO] on the enum `job_position_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PLANTA_ADMINISTRATIVO] on the enum `job_position_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PLANTA_ADMINISTRATIVO] on the enum `job_position_type` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `job_position` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `work_area` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `job_position_name_key` ON `job_position`;

-- DropIndex
DROP INDEX `verification_identifier_idx` ON `verification`;

-- DropIndex
DROP INDEX `work_area_name_key` ON `work_area`;

-- AlterTable
ALTER TABLE `job_position` MODIFY `type` ENUM('OBRA', 'OFICINA', 'PLANTA') NULL;

-- AlterTable
ALTER TABLE `work_area` MODIFY `type` ENUM('OBRA', 'OFICINA', 'PLANTA') NULL;

-- AlterTable
ALTER TABLE `workplace` ADD COLUMN `companyId` INTEGER NULL,
    MODIFY `type` ENUM('OBRA', 'OFICINA', 'PLANTA') NOT NULL DEFAULT 'OFICINA';

-- CreateIndex
CREATE UNIQUE INDEX `job_position_name_type_key` ON `job_position`(`name`, `type`);

-- CreateIndex
CREATE INDEX `verification_identifier_idx` ON `verification`(`identifier`(191));

-- CreateIndex
CREATE UNIQUE INDEX `work_area_name_type_key` ON `work_area`(`name`, `type`);

-- AddForeignKey
ALTER TABLE `workplace` ADD CONSTRAINT `workplace_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
