-- AlterTable
ALTER TABLE `materials`
    ADD COLUMN `videoUrl` VARCHAR(191) NULL AFTER `fileUrl`,
    MODIFY `fileUrl` VARCHAR(191) NULL;
