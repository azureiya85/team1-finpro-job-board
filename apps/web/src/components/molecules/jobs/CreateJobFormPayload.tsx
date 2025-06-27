import { toast } from 'sonner';
import type { FormData, JobPayload, CompanyData } from '@/types';
import type { JobCategory, EmploymentType, ExperienceLevel } from '@prisma/client';

export const validateForm = (formData: FormData): boolean => {
  if (!formData.title.trim()) {
    toast.error('Job title is required');
    return false;
  }
  
  if (!formData.description.trim()) {
    toast.error('Job description is required');
    return false;
  }
  
  if (formData.description.trim().length < 50) {
    toast.error('Job description must be at least 50 characters');
    return false;
  }
  
  if (formData.requirements.length === 0) {
    toast.error('At least one requirement is needed');
    return false;
  }
  
  if (!formData.employmentType) {
    toast.error('Employment type is required');
    return false;
  }
  
  if (!formData.category) {
    toast.error('Job category is required');
    return false;
  }
  
  if (!formData.experienceLevel) {
    toast.error('Experience level is required');
    return false;
  }
  
  return true;
};

export const preparePayload = (formData: FormData, companyData: CompanyData | null): JobPayload => {
  const cleanRequirements = formData.requirements.filter(req => req.trim() !== '');
  const cleanBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
  const cleanTags = formData.tags.filter(tag => tag.trim() !== '');
  const payload: JobPayload = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    category: formData.category as JobCategory,
    employmentType: formData.employmentType as EmploymentType,
    experienceLevel: formData.experienceLevel as ExperienceLevel,
    requirements: cleanRequirements,
    benefits: cleanBenefits,
    tags: cleanTags,
    salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
    salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
    salaryCurrency: "IDR",
    isRemote: Boolean(formData.isRemote),
    isPriority: Boolean(formData.isPriority),
    isActive: true,
    provinceId: formData.provinceId || undefined,
    cityId: formData.cityId || undefined,
    country: "Indonesia",
    latitude: companyData?.latitude ? Number(companyData.latitude) : undefined,
    longitude: companyData?.longitude ? Number(companyData.longitude) : undefined,
    applicationDeadline: formData.applicationDeadline
      ? new Date(formData.applicationDeadline).toISOString()
      : undefined,
    companyId: ''
  };

  return payload;
};