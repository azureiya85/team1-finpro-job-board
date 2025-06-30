import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateCvPdf } from '@/lib/server/cvGenerator';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { generateCvSchema } from '@/lib/validations/zodCVGenerateValidation';
import { SubscriptionStatus } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validationResult = generateCvSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, 
        { status: 400 }
      );
    }

    const { professionalSummary, customSkills, languages, customWorkExperiences, educationHistory } = validationResult.data;

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: new Date() },
      },
    });

    if (!activeSubscription) {
      return NextResponse.json({ error: 'CV Generator is an exclusive feature for subscribed users.' }, { status: 403 });
    }
    
    // 1. Fetch all required data for the CV from the database
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        province: { select: { name: true } },
        city: { select: { name: true } },
        workExperiences: { 
          include: { company: { select: { name: true } } },
          orderBy: { startDate: 'desc' }
        },
        certificates: { 
          include: { userAssessment: { include: { assessment: { select: { title: true } } } } },
          where: { isValid: true }
        },
        skillAssessments: { 
          include: { assessment: { select: { title: true } } },
          where: { isPassed: true }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 2. Parse the string inputs into arrays
    const customSkillsArray = customSkills ? 
      customSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0) : 
      [];

       const customWorkExperiencesArray = customWorkExperiences ?
      customWorkExperiences.split(',').map(exp => {
        const [startYear, endYear, companyName, jobTitle] = exp.split(':').map(part => part.trim());
        return { startYear, endYear, companyName, jobTitle };
      }).filter(exp => exp.startYear && exp.endYear && exp.companyName && exp.jobTitle) :
      [];

    const languagesArray = languages ? 
      languages.split(',').map(lang => {
        const [name, proficiency] = lang.split(':').map(part => part.trim());
        return { name, proficiency };
      }).filter(lang => lang.name && lang.proficiency) : 
      [];

    const educationHistoryArray = educationHistory ? 
      educationHistory.split(',').map(edu => {
        const [startYear, endYear, universityName, degree] = edu.split(':').map(part => part.trim());
        return { startYear, endYear, universityName, degree };
      }).filter(edu => edu.startYear && edu.endYear && edu.universityName && edu.degree) : 
      [];

    // 3. Prepare the data for the PDF template
    const cvData = {
      user: userData,
      workExperiences: userData.workExperiences,
      certificates: userData.certificates,
      skills: userData.skillAssessments,
      professionalSummary,
      customSkills: customSkillsArray,
      customWorkExperiences: customWorkExperiencesArray,
      languages: languagesArray,
      educationHistory: educationHistoryArray,
    };

    // 4. Generate the PDF buffer
    const pdfBuffer = await generateCvPdf(cvData);
    
    // 5. Upload the PDF to Cloudinary
    const fileName = `CV_${userData.name?.replace(/\s/g, '_') || userData.id}_${Date.now()}`;
    const publicId = `job-portal/cvs/${fileName}`;
    const uploadResult = await uploadFileToCloudinary(pdfBuffer, publicId);

    if (!uploadResult?.secure_url) {
        throw new Error('Failed to upload CV to Cloudinary.');
    }

    // 6. Save the generated CV record to the database
    const newCv = await prisma.generatedCv.create({
        data: {
            userId: session.user.id,
            url: uploadResult.secure_url,
            fileName: `${fileName}.pdf`,
            template: 'ATS_DEFAULT'
        }
    });

    // 7. Return the final URL
    return NextResponse.json({ url: newCv.url, id: newCv.id });

  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json({ error: 'Failed to generate CV' }, { status: 500 });
  }
}