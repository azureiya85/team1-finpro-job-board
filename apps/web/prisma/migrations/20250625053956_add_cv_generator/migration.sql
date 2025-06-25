-- CreateTable
CREATE TABLE "generated_cvs" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'ATS_DEFAULT',
    "fileName" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_cvs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_cvs" ADD CONSTRAINT "generated_cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
