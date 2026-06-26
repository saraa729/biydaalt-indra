/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `programs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `programs_name_key` ON `programs`(`name`);
