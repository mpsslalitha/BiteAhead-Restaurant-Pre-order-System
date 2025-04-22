-- DropForeignKey
ALTER TABLE "PreOrderMenuItem" DROP CONSTRAINT "PreOrderMenuItem_preOrderId_fkey";

-- AddForeignKey
ALTER TABLE "PreOrderMenuItem" ADD CONSTRAINT "PreOrderMenuItem_preOrderId_fkey" FOREIGN KEY ("preOrderId") REFERENCES "PreOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
