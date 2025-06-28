import 'server-only';
import { Page, PDFOptions } from 'puppeteer';
import { 
  User, 
  WorkExperience, 
  Company, 
  Certificate, 
  UserSkillAssessment, 
  SkillAssessment, 
  Province, 
  City 
} from '@prisma/client';
import { getBrowserInstance } from './puppeteerInstance'; 

export interface CVTemplateProps {
  user: Pick<User, 'name' | 'email' | 'phoneNumber' | 'currentAddress' | 'lastEducation' | 'country'> & {
    province?: Pick<Province, 'name'> | null;
    city?: Pick<City, 'name'> | null;
  };
  workExperiences: (WorkExperience & { company: Pick<Company, 'name'> })[];
  certificates: (Certificate & { userAssessment: { assessment: Pick<SkillAssessment, 'title'> } })[];
  skills: (UserSkillAssessment & { assessment: Pick<SkillAssessment, 'title'> })[];
  professionalSummary: string;
  customSkills: string[];
  languages: { name: string; proficiency: string }[];
  educationHistory: { startYear: string; endYear: string; universityName: string; degree: string }[];
}

// Simple HTML escape function for security
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ATS-friendly HTML template generator
function generateCvHTML(props: CVTemplateProps): string {
  const { user, workExperiences, certificates, skills, professionalSummary, customSkills, languages, educationHistory } = props;

  const fullLocation = [
    user.currentAddress,
    user.city?.name,
    user.province?.name,
    user.country
  ].filter(Boolean).join(', ');

  // Combine all skills
  const allSkills = [
    ...skills.map(skill => `${skill.assessment.title} (Passed)`),
    ...customSkills
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>CV - ${escapeHtml(user.name)}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; }
            h1 { font-size: 24px; text-align: center; border: none; }
            h2 { font-size: 18px; }
            h3 { font-size: 16px; border: none; margin: 0; padding: 0; }
            .header { text-align: center; margin-bottom: 25px; }
            .contact-info { font-size: 14px; color: #4a5568; }
            .section { margin-bottom: 20px; }
            .job, .item { margin-bottom: 15px; }
            .date { float: right; font-style: italic; color: #718096; }
            .company { font-weight: bold; }
            ul { padding-left: 20px; margin-top: 5px; }
            li { margin-bottom: 5px; }
            .skills-list { list-style-type: none; padding: 0; column-count: 2; }
            .skills-list li { break-inside: avoid; }
            .last-education { font-weight: normal; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>${escapeHtml(user.name)}</h1>
                <p class="contact-info">
                    ${escapeHtml(fullLocation)} | ${escapeHtml(user.email)} | ${escapeHtml(user.phoneNumber)}
                </p>
            </header>

            <section class="section">
                <h2>Professional Summary</h2>
                <p>${escapeHtml(professionalSummary)}</p>
            </section>

            <section class="section">
                <h2>Work Experience</h2>
                ${workExperiences.map(exp => `
                    <div class="job">
                        <span class="date">${new Date(exp.startDate).toLocaleDateString('en-GB')} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-GB') : 'Present'}</span>
                        <h3>${escapeHtml(exp.jobTitle)}</h3>
                        <div class="company">${escapeHtml(exp.company.name)}</div>
                    </div>
                `).join('')}
            </section>
            
            ${allSkills.length > 0 ? `
            <section class="section">
                <h2>Skills</h2>
                <ul class="skills-list">
                    ${allSkills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}
                </ul>
            </section>
            ` : ''}
            
            <section class="section">
                <h2>Education</h2>
                <div class="last-education">
                    <strong>Last Education:</strong> ${escapeHtml(user.lastEducation)}
                </div>
                ${educationHistory.length > 0 ? `
                <div>
                    <strong>Education History:</strong>
                    <ul>
                        ${educationHistory.map(edu => `
                            <li>${escapeHtml(edu.startYear)} - ${escapeHtml(edu.endYear)}: ${escapeHtml(edu.universityName)}: ${escapeHtml(edu.degree)}</li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </section>
            
            ${languages.length > 0 ? `
            <section class="section">
                <h2>Languages</h2>
                <ul>
                    ${languages.map(lang => `<li>${escapeHtml(lang.name)} - <i>${escapeHtml(lang.proficiency)}</i></li>`).join('')}
                </ul>
            </section>
            ` : ''}

            ${certificates.length > 0 ? `
            <section class="section">
                <h2>Certifications</h2>
                <ul>
                    ${certificates.map(cert => `<li>${escapeHtml(cert.userAssessment.assessment.title)} - Issued: ${new Date(cert.issueDate).toLocaleDateString('en-GB')}</li>`).join('')}
                </ul>
            </section>
            ` : ''}
        </div>
    </body>
    </html>
  `;
}


export async function generateCvPdf(props: CVTemplateProps): Promise<Buffer> {
  try {
    const htmlContent = generateCvHTML(props);
    const browser = await getBrowserInstance(); 
    const page: Page = await browser.newPage();
    
    // Use 'domcontentloaded' to avoid timeouts on self-contained HTML
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    
    const pdfOptions: PDFOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    };

    const pdfBuffer = await page.pdf(pdfOptions);
    
    await page.close(); 
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('CV PDF generation error:', error);
    throw new Error(`Failed to generate CV PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}