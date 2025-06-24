import {
  Prisma,
  PrismaClient,
  UserRole,
  AuthProvider,
  Gender,
  Education,
  CompanySize,
  JobCategory,
  EmploymentType,
  ExperienceLevel,
  ApplicationStatus, 
  InterviewStatus,   
  InterviewType,    
   // EmploymentStatus, 
  // VerificationMethod, 
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { indonesianLocations } from '../src/components/data/cities';
import { userSubscriptionPlans } from '../src/components/data/subscriptions';
import { skillCategories, englishQuestions, mathematicsQuestions } from '../src/components/data/assessments';
import { getInitialAnalyticsData } from '../src/components/data/analytics';
import { users as mockUsers } from '../src/components/data/users'; 
import { companies as mockCompanies } from '../src/components/data/companies'; 
import { jobPostings as mockJobPostings } from '../src/components/data/jobs'; 
import { jobApplications as mockJobApplications } from '../src/components/data/jobApplication'; 
import { interviewSchedules as mockInterviewSchedules } from '../src/components/data/jobInterview'; 
import { workExperiences } from '../src/components/data/workExperiences';
import { companyReviews } from '../src/components/data/companyReviews'; 


const prisma = new PrismaClient();

// Maps to store actual IDs against mock IDs/names for linking
const provinceCodeToIdMap = new Map<string, string>();
const cityKeyToIdMap = new Map<string, string>();
const userMockIdToActualIdMap = new Map<string, string>();
const companyMockIdToActualIdMap = new Map<string, string>();
const jobPostingMockIdToActualIdMap = new Map<string, string>(); 
const jobApplicationMockIdToActualIdMap = new Map<string, string>();
const workExperienceMockIdToActualIdMap = new Map<string, string>();
let definedAssessmentsCount = 0; // Add this line

const SALT_ROUNDS = 10;

async function seedLocations() {
  console.log('🏛️ Seeding provinces and cities...');
  for (const provinceData of indonesianLocations) {
    console.log(`  Creating province: ${provinceData.name} (${provinceData.code})`); // Verbose
    const province = await prisma.province.upsert({
      where: { code: provinceData.code },
      update: {
        name: provinceData.name,
        latitude: provinceData.latitude,
        longitude: provinceData.longitude,
      },
      create: {
        name: provinceData.name,
        code: provinceData.code,
        latitude: provinceData.latitude,
        longitude: provinceData.longitude,
      },
    });
    provinceCodeToIdMap.set(province.code, province.id);

    for (const cityData of provinceData.cities) {
      const cityKey = `${province.code}_${cityData.name}`;
      const city = await prisma.city.upsert({
        where: { name_provinceId: { name: cityData.name, provinceId: province.id } },
        update: {
          type: cityData.type,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
        },
        create: {
          name: cityData.name,
          type: cityData.type,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          provinceId: province.id,
        },
      });
      cityKeyToIdMap.set(cityKey, city.id);
    }
    console.log(`  ✅ Created/Updated ${provinceData.cities.length} cities for ${provinceData.name}`); // Verbose
  }
  console.log('🏛️ Provinces and cities seeding completed.');
}

async function seedUserSubscriptionPlans() {
  console.log('💳 Seeding user subscription plans...');
  for (const planData of userSubscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: {
        price: planData.price,
        duration: planData.duration,
        description: planData.description,
        features: planData.features,
      },
      create: {
        id: planData.id,
        name: planData.name,
        price: planData.price,
        duration: planData.duration,
        description: planData.description,
        features: planData.features,
        createdAt: planData.createdAt ? new Date(planData.createdAt) : new Date(),
        updatedAt: planData.updatedAt ? new Date(planData.updatedAt) : new Date(),
      },
    });
  }
  console.log('💳 User subscription plans seeding completed.');
}

async function seedUsers() {
  console.log('👤 Seeding users...');
  for (const userData of mockUsers) {
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, SALT_ROUNDS) : null;

    let provinceCode: string | undefined = undefined;
    let cityName: string | undefined = undefined;

    if (userData.provinceId) {
      // Extracts 'DKI' from 'province_dki_id'
      provinceCode = userData.provinceId.replace('province_', '').replace('_id', '').toUpperCase();
    }

    if (userData.cityId) {
      cityName = userData.cityId
        .replace('city_', '')
        .replace('_id', '')
        .split('_') // Split by underscore if present (e.g., jkt_selatan)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Title case each word
        .join(' '); // Join back with space
    }

    const actualProvinceId = provinceCode ? provinceCodeToIdMap.get(provinceCode) : undefined;
    const actualCityId = (provinceCode && cityName) ? cityKeyToIdMap.get(`${provinceCode}_${cityName}`) : undefined;

    if (userData.provinceId && !actualProvinceId) {
        console.warn(`  ⚠️ User ${userData.email}: Province code '${provinceCode}' (from mock ID '${userData.provinceId}') not found in map. Available province codes: [${Array.from(provinceCodeToIdMap.keys()).join(', ')}]`);
    }
    if (userData.cityId && !actualCityId) {
        const expectedCityKey = `${provinceCode}_${cityName}`;
        console.warn(`  ⚠️ User ${userData.email}: City key '${expectedCityKey}' (from mock ID '${userData.cityId}') not found in map. Ensure province code and city name match 'indonesianLocations'.`);
        // For debugging:
        // const citiesInProvince = indonesianLocations.find(p => p.code === provinceCode)?.cities.map(c => `${provinceCode}_${c.name}`);
        // if (citiesInProvince) console.log(`     Available city keys for province ${provinceCode}: [${citiesInProvince.join(', ')}]`);
    }

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImage,
        isEmailVerified: userData.isEmailVerified,
        role: userData.role as UserRole,
        provider: userData.provider as AuthProvider,
        providerId: userData.providerId,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        gender: userData.gender as Gender,
        lastEducation: userData.lastEducation as Education,
        currentAddress: userData.currentAddress,
        phoneNumber: userData.phoneNumber,
        latitude: userData.latitude,
        longitude: userData.longitude,
        provinceId: actualProvinceId,
        cityId: actualCityId,
        country: userData.country || 'Indonesia',
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
      },
      create: {
        // id: userData.id, // Let Prisma generate ID
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImage,
        isEmailVerified: userData.isEmailVerified,
        role: userData.role as UserRole,
        provider: userData.provider as AuthProvider,
        providerId: userData.providerId,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        gender: userData.gender as Gender,
        lastEducation: userData.lastEducation as Education,
        currentAddress: userData.currentAddress,
        phoneNumber: userData.phoneNumber,
        latitude: userData.latitude,
        longitude: userData.longitude,
        provinceId: actualProvinceId,
        cityId: actualCityId,
        country: userData.country || 'Indonesia',
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
      },
    });
    userMockIdToActualIdMap.set(userData.id, user.id);
    console.log(`  👤 Created/Updated user: ${user.email} (Mock ID: ${userData.id} -> Actual ID: ${user.id})`); // Verbose
  }
  console.log('👤 Users seeding completed.');
}

async function seedCompanies() {
  console.log('🏢 Seeding companies...');
  for (const companyData of mockCompanies) {
    const adminActualId = userMockIdToActualIdMap.get(companyData.adminId);
    if (!adminActualId) {
      console.warn(`  ⚠️ Admin user with mock ID ${companyData.adminId} not found for company ${companyData.name}. Skipping company.`);
      continue;
    }

    let provinceCode: string | undefined = undefined;
    let cityName: string | undefined = undefined;

    if (companyData.provinceId) {
      provinceCode = companyData.provinceId.replace('province_', '').replace('_id', '').toUpperCase();
    }

    if (companyData.cityId) {
      cityName = companyData.cityId
        .replace('city_', '')
        .replace('_id', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    const actualProvinceId = provinceCode ? provinceCodeToIdMap.get(provinceCode) : undefined;
    const actualCityId = (provinceCode && cityName) ? cityKeyToIdMap.get(`${provinceCode}_${cityName}`) : undefined;

    if (companyData.provinceId && !actualProvinceId) {
        console.warn(`  ⚠️ Company ${companyData.name}: Province code '${provinceCode}' (from mock ID '${companyData.provinceId}') not found in map. Available province codes: [${Array.from(provinceCodeToIdMap.keys()).join(', ')}]`);
    }
    if (companyData.cityId && !actualCityId) {
        const expectedCityKey = `${provinceCode}_${cityName}`;
        console.warn(`  ⚠️ Company ${companyData.name}: City key '${expectedCityKey}' (from mock ID '${companyData.cityId}') not found in map. Ensure province code and city name match 'indonesianLocations'.`);
    }

    const company = await prisma.company.upsert({
      where: { adminId: adminActualId },
      update: {
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        logo: companyData.logo,
        banner: companyData.banner,
        industry: companyData.industry,
        size: companyData.size as CompanySize,
        foundedYear: companyData.foundedYear,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        latitude: companyData.latitude,
        longitude: companyData.longitude,
       provinceId: actualProvinceId,
        cityId: actualCityId,
        country: companyData.country || 'Indonesia',
        linkedinUrl: companyData.linkedinUrl,
        facebookUrl: companyData.facebookUrl,
        twitterUrl: companyData.twitterUrl,
        instagramUrl: companyData.instagramUrl,
        updatedAt: companyData.updatedAt ? new Date(companyData.updatedAt) : new Date(),
      },
      create: {
        // id: companyData.id, // Let Prisma generate ID
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        logo: companyData.logo,
        banner: companyData.banner,
        industry: companyData.industry,
        size: companyData.size as CompanySize,
        foundedYear: companyData.foundedYear,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        latitude: companyData.latitude,
        longitude: companyData.longitude,
       provinceId: actualProvinceId,
        cityId: actualCityId,
        country: companyData.country || 'Indonesia',
        linkedinUrl: companyData.linkedinUrl,
        facebookUrl: companyData.facebookUrl,
        twitterUrl: companyData.twitterUrl,
        instagramUrl: companyData.instagramUrl,
        adminId: adminActualId,
        createdAt: companyData.createdAt ? new Date(companyData.createdAt) : new Date(),
        updatedAt: companyData.updatedAt ? new Date(companyData.updatedAt) : new Date(),
      },
    });
    companyMockIdToActualIdMap.set(companyData.id, company.id);
    console.log(`  🏢 Created/Updated company: ${company.name} (Mock ID: ${companyData.id} -> Actual ID: ${company.id})`); // Verbose
  }
  console.log('🏢 Companies seeding completed.');
}

async function seedJobPostings() {
  console.log('📄 Seeding job postings...');
  for (const jobData of mockJobPostings) {
    const companyActualId = companyMockIdToActualIdMap.get(jobData.companyId);
    if (!companyActualId) {
      console.warn(`  ⚠️ Company with mock ID ${jobData.companyId} not found for job '${jobData.title}'. Skipping job.`);
      continue;
    }

    const provinceCode = jobData.provinceId; 
    const cityName = jobData.cityId;    

    const actualProvinceId = provinceCode ? provinceCodeToIdMap.get(provinceCode) : undefined;
    const actualCityId = (provinceCode && cityName) ? cityKeyToIdMap.get(`${provinceCode}_${cityName}`) : undefined;

    if (jobData.provinceId && !actualProvinceId) {
        console.warn(`  ⚠️ Job '${jobData.title}': Province code '${provinceCode}' (from mock data) not found in map. Available province codes: [${Array.from(provinceCodeToIdMap.keys()).join(', ')}]`);
    }
    if (jobData.cityId && !actualCityId) {
        const expectedCityKey = `${provinceCode}_${cityName}`;
        console.warn(`  ⚠️ Job '${jobData.title}': City key '${expectedCityKey}' (from mock data) not found in map. Ensure province code and city name match 'indonesianLocations'.`);
        // const citiesInProvince = indonesianLocations.find(p => p.code === provinceCode)?.cities.map(c => `${provinceCode}_${c.name}`);
        // if (citiesInProvince) console.log(`     Available city keys for province ${provinceCode}: [${citiesInProvince.join(', ')}]`);
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        // id: jobData.id, // Let Prisma generate ID
        title: jobData.title,
        description: jobData.description,
        banner: jobData.banner,
        category: jobData.category as JobCategory,
        employmentType: jobData.employmentType as EmploymentType,
        experienceLevel: jobData.experienceLevel as ExperienceLevel,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: jobData.salaryCurrency || 'IDR',
        isRemote: jobData.isRemote,
        latitude: jobData.latitude,
        longitude: jobData.longitude,
        provinceId: actualProvinceId,
        cityId: actualCityId,
        country: jobData.country || 'Indonesia',
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : undefined,
        isActive: jobData.isActive,
        isPriority: !!jobData.isPriority,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        tags: jobData.tags,
        companyId: companyActualId,
        createdAt: jobData.createdAt ? new Date(jobData.createdAt) : new Date(),
        updatedAt: jobData.updatedAt ? new Date(jobData.updatedAt) : new Date(),
        publishedAt: jobData.publishedAt ? new Date(jobData.publishedAt) : undefined,
      },
    });
    jobPostingMockIdToActualIdMap.set(jobData.id, jobPosting.id); // Map mock job ID to actual DB ID
    console.log(`  📄 Created job: ${jobPosting.title} (Mock ID: ${jobData.id} -> Actual ID: ${jobPosting.id})`); // Verbose
  }
  console.log('📄 Job postings seeding completed.');
}

async function seedJobApplications() {
  console.log('📝 Seeding job applications...');
  for (const appData of mockJobApplications) {
    const userActualId = userMockIdToActualIdMap.get(appData.userId);
    const jobPostingActualId = jobPostingMockIdToActualIdMap.get(appData.jobPostingId);

    if (!userActualId) {
      console.warn(`  ⚠️ User with mock ID ${appData.userId} not found for application ${appData.id}. Skipping.`);
      continue;
    }
    if (!jobPostingActualId) {
      console.warn(`  ⚠️ Job Posting with mock ID ${appData.jobPostingId} not found for application ${appData.id}. Skipping.`);
      continue;
    }

    try {
      const application = await prisma.jobApplication.create({
        data: {
          cvUrl: appData.cvUrl,
          expectedSalary: appData.expectedSalary,
          coverLetter: appData.coverLetter,
          status: appData.status as ApplicationStatus,
          rejectionReason: appData.rejectionReason,
          adminNotes: appData.adminNotes,
          testResultId: appData.testResultId,
          userId: userActualId,
          jobPostingId: jobPostingActualId,
          createdAt: appData.createdAt ? new Date(appData.createdAt) : new Date(),
          updatedAt: appData.updatedAt ? new Date(appData.updatedAt) : new Date(),
          reviewedAt: appData.reviewedAt ? new Date(appData.reviewedAt) : undefined,
        },
      });
      jobApplicationMockIdToActualIdMap.set(appData.id, application.id);
      console.log(`  📝 Created job application: ${application.id} (Mock ID: ${appData.id})`); // Verbose
   } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Check if meta and meta.target exist and are of expected types
                const metaTarget = (error.meta as { target?: string[] | string })?.target;

                let isUserJobPostingConstraint = false;
                if (typeof metaTarget === 'string') {
                    // If target is a single string (e.g., "users_userId_jobPostingId_key")
                    isUserJobPostingConstraint = metaTarget.includes('userId') && metaTarget.includes('jobPostingId');
                } else if (Array.isArray(metaTarget)) {
                    // If target is an array of strings (e.g., ['userId', 'jobPostingId'])
                    isUserJobPostingConstraint = metaTarget.includes('userId') && metaTarget.includes('jobPostingId');
                }

                if (isUserJobPostingConstraint) {
                    console.warn(`  ⚠️ Job Application for user ${userActualId} and job ${jobPostingActualId} already exists (Mock ID: ${appData.id}). Skipping.`);
                } else {
                    // Handle other P2002 errors if needed, or log generally
                    console.error(`  ❌ A unique constraint violation occurred (P2002) for job application (Mock ID: ${appData.id}), but not the expected [userId, jobPostingId] constraint:`, error);
                }
            } else {
                 // Handle other Prisma known request errors
                 console.error(`  ❌ Error creating job application (Mock ID: ${appData.id}):`, error);
            }
        } else {
            // Handle other types of errors or rethrow
            console.error(`  ❌ An unexpected error occurred for job application (Mock ID: ${appData.id}):`, error);
        }
    }
  }
  console.log('📝 Job applications seeding completed.');
}

async function seedInterviewSchedules() { // Added function
  console.log('🗓️ Seeding interview schedules...');
  for (const interviewData of mockInterviewSchedules) {
    const jobApplicationActualId = jobApplicationMockIdToActualIdMap.get(interviewData.jobApplicationId);
    const jobPostingActualId = jobPostingMockIdToActualIdMap.get(interviewData.jobPostingId); // Get actual job posting ID
    const candidateActualId = userMockIdToActualIdMap.get(interviewData.candidateId); // candidateId is userId

    if (!jobApplicationActualId) {
      console.warn(`  ⚠️ Job Application with mock ID ${interviewData.jobApplicationId} not found for interview ${interviewData.id}. Skipping.`);
      continue;
    }
    if (!jobPostingActualId) {
      console.warn(`  ⚠️ Job Posting with mock ID ${interviewData.jobPostingId} not found for interview ${interviewData.id}. Skipping.`);
      continue;
    }
    if (!candidateActualId) {
      console.warn(`  ⚠️ Candidate (User) with mock ID ${interviewData.candidateId} not found for interview ${interviewData.id}. Skipping.`);
      continue;
    }

    await prisma.interviewSchedule.create({
      data: {
        // id: interviewData.id, // Let Prisma generate ID
        scheduledAt: new Date(interviewData.scheduledAt),
        duration: interviewData.duration,
        location: interviewData.location,
        interviewType: interviewData.interviewType as InterviewType,
        notes: interviewData.notes,
        status: interviewData.status as InterviewStatus,
        reminderSent: interviewData.reminderSent,
        jobApplicationId: jobApplicationActualId,
        jobPostingId: jobPostingActualId, // Use actual job posting ID
        candidateId: candidateActualId,
        createdAt: interviewData.createdAt ? new Date(interviewData.createdAt) : new Date(),
        updatedAt: interviewData.updatedAt ? new Date(interviewData.updatedAt) : new Date(),
      },
    });
    console.log(`  🗓️ Created interview schedule: ${interviewData.id}`); // Verbose
  }
  console.log('🗓️ Interview schedules seeding completed.');
}


async function seedSkillAssessments() {
  console.log('🎯 Seeding skill categories and assessments...');

  // 1. Seed Skill Categories 
  const categoryNameToIdMap = new Map<string, string>();
  for (const categoryData of skillCategories) { 
    const category = await prisma.skillCategory.upsert({
      where: { name: categoryData.name },
      update: {
        description: categoryData.description,
        icon: categoryData.icon,
      },
      create: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
      },
    });
    categoryNameToIdMap.set(category.name, category.id);
    console.log(`  📚 Created/Updated skill category: ${category.name}`); // Less verbose
  }
  console.log(`  ✅ Seeded ${skillCategories.length} skill categories.`);

  // 2. Define assessments to create, ensuring 25 questions each and 30 min time limit
  const assessmentsToCreate = [
    {
      categoryName: "English Comprehension", 
      assessment: {
        title: "Comprehensive English Assessment", 
        description: "Assesses comprehensive English grammar, vocabulary, and reading comprehension. Contains 25 questions.", 
        passingScore: 75, 
        timeLimit: 30,    // Standardized time limit
        isActive: true,
        questions: englishQuestions.slice(0, 25).map(q => ({ ...q })),
      }
    },
    {
      categoryName: "Mathematics",
      assessment: {
        title: "Comprehensive Mathematics Assessment",
        description: "Covers a comprehensive range of arithmetic, algebra, geometry, and problem-solving skills. Contains 25 questions.", 
        passingScore: 75,
        timeLimit: 30,    // Standardized time limit
        isActive: true,
        questions: mathematicsQuestions.slice(0, 25).map(q => ({ ...q })),
      }
    }
  ];

   definedAssessmentsCount = assessmentsToCreate.length;

  // Verify if question arrays have enough questions
  if (englishQuestions.length < 25) {
    console.warn(`  ⚠️ English questions array has only ${englishQuestions.length} questions. The English assessment will have fewer than 25 questions.`);
  }
  if (mathematicsQuestions.length < 25) {
    console.warn(`  ⚠️ Mathematics questions array has only ${mathematicsQuestions.length} questions. The Math assessment will have fewer than 25 questions.`);
  }


  let createdAssessmentsCount = 0;
  // 3. Seed Skill Assessments and their Questions
  for (const assessmentItem of assessmentsToCreate) {
    const categoryId = categoryNameToIdMap.get(assessmentItem.categoryName);

    if (categoryId) {
      // Check if an assessment with this exact title and category already exists
      const existingAssessment = await prisma.skillAssessment.findFirst({
        where: {
          title: assessmentItem.assessment.title,
          categoryId: categoryId,
        },
      });

      if (!existingAssessment) {
        if (assessmentItem.assessment.questions.length === 0) {
            console.warn(`  ⚠️ Skipping assessment "${assessmentItem.assessment.title}" for category "${assessmentItem.categoryName}" as it has 0 questions after slicing. Check your question data arrays.`);
            continue;
        }
        await prisma.skillAssessment.create({
          data: {
            title: assessmentItem.assessment.title,
            description: assessmentItem.assessment.description,
            passingScore: assessmentItem.assessment.passingScore,
            timeLimit: assessmentItem.assessment.timeLimit,
            isActive: assessmentItem.assessment.isActive,
            categoryId: categoryId,
            questions: {
              create: assessmentItem.assessment.questions.map(q => ({
                question: q.question,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
              })),
            },
          },
        });
        createdAssessmentsCount++;
        console.log(`  📊 Created assessment: ${assessmentItem.assessment.title} in category ${assessmentItem.categoryName} with ${assessmentItem.assessment.questions.length} questions.`); // Less verbose
      } else {
        console.log(`  📊 Assessment "${assessmentItem.assessment.title}" in category ${assessmentItem.categoryName} already exists. Skipping.`); // Less verbose
      }
    } else {
      console.warn(`  ⚠️ Skill category "${assessmentItem.categoryName}" not found for assessment "${assessmentItem.assessment.title}". Skipping.`);
    }
  }
  console.log(`  📊 Created ${createdAssessmentsCount} new skill assessments.`);
  console.log('🎯 Skill assessments and questions seeding completed.');
}

async function seedAnalytics() {
  console.log('📈 Initializing analytics...');
  const analyticsData = getInitialAnalyticsData();
  await prisma.websiteAnalytics.upsert({
    where: { date: new Date(analyticsData.date.setHours(0,0,0,0)) }, // Normalize date to start of day
    update: analyticsData, // Update if exists, e.g. if script run multiple times on same day for testing
    create: analyticsData,
  });
  console.log('📈 Analytics initialization completed.');
}

async function seedWorkExperiences() {
  console.log('🤝 Seeding work experiences...');
  for (const expData of workExperiences) {
    const userActualId = userMockIdToActualIdMap.get(expData.userId);
    const companyActualId = companyMockIdToActualIdMap.get(expData.companyId);

    if (!userActualId || !companyActualId) {
      console.warn(`  ⚠️ Skipping work experience ${expData.id} due to missing user or company mapping.`);
      continue;
    }
    
    try {
      const experience = await prisma.workExperience.create({
        data: {
          userId: userActualId,
          companyId: companyActualId,
          jobTitle: expData.jobTitle,
          employmentStatus: expData.employmentStatus,
          startDate: expData.startDate,
          endDate: expData.endDate,
          isVerified: expData.isVerified,
          verificationMethod: expData.verificationMethod,
          verifiedAt: expData.verifiedAt,
          createdAt: expData.createdAt,
          updatedAt: expData.updatedAt,
        },
      });
      workExperienceMockIdToActualIdMap.set(expData.id, experience.id);
      console.log(`  🤝 Created work experience for user ${userActualId.slice(0,8)} at company ${companyActualId.slice(0,8)} (Mock ID: ${expData.id})`);
    } catch (error) {
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         console.warn(`  ⚠️ Work experience for user ${userActualId} at company ${companyActualId} already exists. Skipping.`);
       } else {
         console.error(`  ❌ Error creating work experience (Mock ID: ${expData.id}):`, error);
       }
    }
  }
  console.log('🤝 Work experiences seeding completed.');
}

async function seedCompanyReviews() {
  console.log('🌟 Seeding company reviews...');
  for (const reviewData of companyReviews) {
    const userActualId = userMockIdToActualIdMap.get(reviewData.userId);
    const companyActualId = companyMockIdToActualIdMap.get(reviewData.companyId);
    const workExperienceActualId = workExperienceMockIdToActualIdMap.get(reviewData.workExperienceId);

    if (!userActualId || !companyActualId || !workExperienceActualId) {
      console.warn(`  ⚠️ Skipping review ${reviewData.id} due to missing user, company, or work experience mapping.`);
      continue;
    }

    await prisma.companyReview.create({
      data: {
        title: reviewData.title,
        review: reviewData.review,
        rating: reviewData.rating,
        cultureRating: reviewData.cultureRating,
        workLifeBalance: reviewData.workLifeBalance,
        facilitiesRating: reviewData.facilitiesRating,
        careerRating: reviewData.careerRating,
        jobPosition: reviewData.jobPosition,
        employmentStatus: reviewData.employmentStatus,
        workDuration: reviewData.workDuration,
        salaryEstimate: reviewData.salaryEstimate,
        isAnonymous: reviewData.isAnonymous,
        isVerified: reviewData.isVerified,
        userId: userActualId,
        companyId: companyActualId,
        workExperienceId: workExperienceActualId,
        createdAt: reviewData.createdAt,
        updatedAt: reviewData.updatedAt,
      },
    });
    console.log(`  🌟 Created review "${reviewData.title}" (Mock ID: ${reviewData.id})`);
  }
  console.log('🌟 Company reviews seeding completed.');
}

async function clearExistingData() {
  console.log('🧹 Cleaning existing data (order matters due to foreign keys)...');

  await prisma.notification.deleteMany();
  await prisma.interviewSchedule.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.savedJob.deleteMany();

  await prisma.companyReview.deleteMany();
  await prisma.workExperience.deleteMany();

  await prisma.preSelectionQuestion.deleteMany();
  
  await prisma.jobPosting.deleteMany();
  await prisma.preSelectionTest.deleteMany();

  await prisma.companyReview.deleteMany();

  await prisma.certificate.deleteMany();
  await prisma.userSkillAssessment.deleteMany();

  await prisma.skillAssessment.deleteMany(); 
  await prisma.skillCategory.deleteMany();

  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  
  await prisma.authenticator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();


  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  await prisma.city.deleteMany();
  await prisma.province.deleteMany();

  await prisma.websiteAnalytics.deleteMany();

  console.log('🧹 Data cleaning finished.');
}


async function main() {
  console.log('🌱 Starting database seeding...');

   
  try {
    await clearExistingData();
    await seedLocations();
    await seedUserSubscriptionPlans();    
    await seedSkillAssessments();  
    await seedUsers(); 
    await seedCompanies();
    await seedWorkExperiences();
    await seedCompanyReviews();
    await seedJobPostings();
    await seedJobApplications();
    await seedInterviewSchedules();
    await seedAnalytics();

    console.log('✨ Database seeding completed successfully!');
    console.log(`  🏛️ Provinces: ${provinceCodeToIdMap.size}, Cities: ${cityKeyToIdMap.size}`);
    console.log(`  💳 User Subscription Plans: ${userSubscriptionPlans.length}`);
    console.log(`  🎯 Skill Categories: ${skillCategories.length}, Assessments defined for creation: ${definedAssessmentsCount}`);
    console.log(`  👤 Users: ${userMockIdToActualIdMap.size}`);
    console.log(`  🏢 Companies: ${companyMockIdToActualIdMap.size}`);
    console.log(`  📄 Job Postings: ${jobPostingMockIdToActualIdMap.size}`);
    console.log(`  📝 Job Applications: ${jobApplicationMockIdToActualIdMap.size}`);
    const successfulInterviews = mockInterviewSchedules.filter(is => 
        jobApplicationMockIdToActualIdMap.has(is.jobApplicationId) &&
        jobPostingMockIdToActualIdMap.has(is.jobPostingId) &&
        userMockIdToActualIdMap.has(is.candidateId)
    ).length;
    console.log(`  🗓️ Interview Schedules: ${successfulInterviews}`);
    console.log('  📈 Analytics Initialized.');
    console.log(`  🌟 Company Reviews: ${companyReviews.length}`);
    console.log(`  🤝 Work Experiences: ${workExperienceMockIdToActualIdMap.size}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

main()
  .catch((e) => {
    console.error("MAIN CATCH BLOCK:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting Prisma client...');
    await prisma.$disconnect();
  });