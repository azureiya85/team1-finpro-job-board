import 'server-only';
import { Page, PDFOptions } from 'puppeteer-core';
import { getBrowserInstance } from './puppeteerInstance';

export interface CertificateTemplateProps {
  userName: string;
  assessmentTitle: string;
  issueDate: string;
  certificateCode: string;
}

// Simple HTML escape function for security 
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": ''
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Generate HTML template 
function generateCertificateHTML({
  userName,
  assessmentTitle,
  issueDate,
  certificateCode,
}: CertificateTemplateProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        
        .certificate-wrapper {
            width: 1000px;
            height: 700px;
            border: 10px solid #0a4d68;
            padding: 40px;
            background-color: white;
            position: relative;
            box-sizing: border-box;
        }
        
        .header {
            text-align: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #05bfdb;
        }
        
        .title {
            font-size: 48px;
            font-weight: bold;
            color: #088395;
            margin: 40px 0 20px 0;
        }
        
        .subtitle {
            font-size: 24px;
            color: #333;
        }
        
        .body-content {
            text-align: center;
            margin-top: 80px;
        }
        
        .recipient {
            font-size: 36px;
            font-weight: bold;
            border-bottom: 2px solid #ccc;
            display: inline-block;
            padding-bottom: 5px;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 20px;
            color: #555;
            line-height: 1.6;
        }
        
        .assessment-title {
            color: #088395;
            font-size: 24px;
            margin-top: 10px;
            display: block;
            font-weight: bold;
        }
        
        .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-block {
            text-align: center;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            width: 200px;
            margin: 0 auto 5px auto;
        }
        
        .signature-name {
            font-weight: bold;
        }
        
        .certificate-id {
            font-size: 12px;
            color: #888;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <header class="header">
            <div class="logo">Work Vault</div>
            <h1 class="title">Certificate of Completion</h1>
            <h2 class="subtitle">This certifies that</h2>
        </header>

        <main class="body-content">
            <div class="recipient">${escapeHtml(userName)}</div>
            <p class="message">
                has successfully completed the assessment for
                <br />
                <span class="assessment-title">${escapeHtml(assessmentTitle)}</span>
            </p>
        </main>

        <footer class="footer">
            <div class="certificate-id">
                <div>Issued on: ${escapeHtml(issueDate)}</div>
                <div>Certificate ID: ${escapeHtml(certificateCode)}</div>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">CEO, Work Vault</div>
            </div>
        </footer>
    </div>
</body>
</html>`;
}

export async function generateCertificatePdf(props: CertificateTemplateProps): Promise<Buffer> {
  let page: Page | null = null;
  
  try {
    const htmlContent = generateCertificateHTML(props);

    // 1. Get the shared browser instance, just like in cvGenerator.ts
    const browser = await getBrowserInstance();
    page = await browser.newPage();

    // 2. Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });

    // 3. Set the content and wait for it to be ready
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded', 
    });

    // 4. Generate the PDF with optimized settings
    const pdfOptions: PDFOptions = {
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Certificate PDF generation error:', error);
    throw new Error(`Failed to generate certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) {
      await page.close();
    }
  }
}