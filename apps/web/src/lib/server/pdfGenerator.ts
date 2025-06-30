import 'server-only';
import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';

export interface CertificateTemplateProps {
  userName: string;
  assessmentTitle: string;
  issueDate: string;
  certificateCode: string;
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
                <div class="signature-name">CEO, YourApp</div>
            </div>
        </footer>
    </div>
</body>
</html>`;
}

// Simple HTML escape function for security
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function generateCertificatePdf(props: CertificateTemplateProps): Promise<Buffer> {
  let browser: Browser | null = null;
  
  try {
    // 1. Generate HTML content directly
    const htmlContent = generateCertificateHTML(props);

    // 2. Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config', 
        '--disable-back-forward-cache',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-component-extensions-with-background-pages'
      ],
      // Remove timeout from launch options
      timeout: 60000, // 60 seconds for launch
    });

    const page: Page = await browser.newPage();

    // 3. Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });

    // 4. Set the content and wait for it to be ready
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 // 30 second timeout
    });

    // Wait a bit for fonts and rendering to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Generate the PDF with optimized settings
    const pdfOptions: PDFOptions = {
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      timeout: 30000, // 30 second timeout
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // 6. Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}