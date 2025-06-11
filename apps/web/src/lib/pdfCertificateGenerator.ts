import PDFDocument, { registerFont } from 'pdfkit'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

/** Register a custom font (make sure the .ttf lives at this path) */
const fontsDir = path.resolve(__dirname, '../assets/fonts')
registerFont('Roboto-Regular', path.join(fontsDir, 'Roboto-Regular.ttf'))
registerFont('Roboto-Bold',    path.join(fontsDir, 'Roboto-Bold.ttf'))

export async function createCertificatePdf(opts: {
  name: string
  title: string
  score: number
  issuedDate: string
  verificationCode: string
  qrCodeDataUrl: string
}): Promise<Buffer> {
  // 1. Create PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => { /* done */ })

  // 2. Header: logo (optional)
  const logoPath = path.resolve(__dirname, '../assets/images/logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, { width: 100, align: 'center' })
    doc.moveDown(1.5)
  }

  // 3. Title
  doc.font('Roboto-Bold')
     .fontSize(24)
     .text('Certificate of Completion', { align: 'center' })
  doc.moveDown()

  // 4. Recipient name
  doc.font('Roboto-Regular')
     .fontSize(18)
     .text(`This is to certify that`, { align: 'center' })
     .moveDown(0.5)
     .font('Roboto-Bold')
     .fontSize(22)
     .text(opts.name, { align: 'center' })
  doc.moveDown()

  // 5. Assessment details
  doc.font('Roboto-Regular')
     .fontSize(14)
     .text(`has successfully passed the assessment titled`, { align: 'center' })
     .moveDown(0.5)
     .font('Roboto-Bold')
     .text(opts.title,   { align: 'center' })
     .moveDown()
     .font('Roboto-Regular')
     .text(`Score: ${opts.score}`,        { align: 'center' })
     .text(`Issued: ${opts.issuedDate}`,  { align: 'center' })
  doc.moveDown(2)

  // 6. QR code & verification code footer
  const qrBase64 = opts.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '')
  const qrBuffer = Buffer.from(qrBase64, 'base64')
  const qrSize   = 100
  const qrX      = (doc.page.width  - qrSize) / 2
  doc.image(qrBuffer, qrX, doc.y, { width: qrSize, height: qrSize })
  doc.moveDown()

  doc.font('Roboto-Regular')
     .fontSize(10)
     .text(`Verify at ${dayjs().format('YYYY-MM-DD')} with code:`, { align: 'center' })
     .moveDown(0.2)
     .font('Roboto-Bold')
     .text(opts.verificationCode, { align: 'center' })

  // 7. Finalize
  doc.end()
  await new Promise<void>(resolve => doc.once('end', resolve))

  return Buffer.concat(buffers)
}
