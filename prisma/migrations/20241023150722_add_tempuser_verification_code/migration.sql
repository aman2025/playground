/*
  Warnings:

  - You are about to drop the column `verificationToken` on the `TempUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verificationCode]` on the table `TempUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `verificationCode` to the `TempUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TempUser_verificationToken_key";

-- AlterTable
ALTER TABLE "TempUser" DROP COLUMN "verificationToken",
ADD COLUMN     "verificationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TempUser_verificationCode_key" ON "TempUser"("verificationCode");
