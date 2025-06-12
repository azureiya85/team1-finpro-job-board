import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 }   from 'uuid'
import QRCode             from 'qrcode'
import { auth }           from '@/auth'
import prisma              from '@/lib/prisma'
import { createCertificatePdf }   from '@/lib/pdfCertificateGenerator'
import { uploadFileToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Which attempt?
  const { userAssessmentId }: { userAssessmentId: string } = await req.json()

  // 3. Load the passed attempt
  const attempt = await prisma.userSkillAssessment.findUnique({
    where: { id: userAssessmentId },
    include: { assessment: true, user: true },
  })
  if (
    !attempt || 
    attempt.userId !== session.user.id || 
    !attempt.isPassed
  ) {
    return NextResponse.json(
      { error: 'Not found or not passed' }, 
      { status: 404 }
    )
  }

  // 4. Build code + QR
  const certificateCode = uuidv4()
  const verificationUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateCode}`
  const qrDataUrl        = await QRCode.toDataURL(verificationUrl)

  // 5. Generate PDF  
  const pdfBuffer = await createCertificatePdf({
    name:             attempt.user.name ?? session.user.id,
    title:            attempt.assessment.title,
    score:            attempt.score,
    issuedDate:       new Date().toLocaleDateString('en-GB'),
    verificationCode: certificateCode,
    qrCodeDataUrl:    qrDataUrl,
  })

  // 6. Upload & persist
  const upload = await uploadFileToCloudinary(
    pdfBuffer,
    `certificates/${certificateCode}.pdf`
  )
  const cert = await prisma.certificate.create({
    data: {
      userId:           session.user.id,
      userAssessmentId: attempt.id,
      certificateCode,
      title:            attempt.assessment.title,
      description:      attempt.assessment.description ?? undefined,
      certificateUrl:   upload.secure_url,
      qrCodeUrl:        qrDataUrl,
    },
  })

  return NextResponse.json({
    message:        'Certificate generated',
    certificateUrl: cert.certificateUrl,
    qrCodeUrl:      cert.qrCodeUrl,
    code:           cert.certificateCode,
  })
}
