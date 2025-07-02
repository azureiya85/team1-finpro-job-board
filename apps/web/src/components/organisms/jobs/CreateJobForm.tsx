'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CreateJobFormBasicInput } from '@/components/molecules/jobs/CreateJobFormBasicInput';
import { CreateJobFormDetailsInput } from '@/components/molecules/jobs/CreateJobFormDetailsInput';
import { CreateJobFormBadgeInput } from '@/components/molecules/jobs/CreateJobFormBadgeInput';
import type { CompanyData, CreateJobFormProps, FormData } from '@/types';
import type { City, Province } from '@prisma/client';

export function CreateJobForm({ jobId, isEditing, companyId }: CreateJobFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    employmentType: '',
    category: '',
    experienceLevel: '',
    provinceId: '',
    cityId: '',
    country: 'Indonesia',
    companyId: companyId,
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: [],
    benefits: [],
    tags: [],
    isActive: true,
    isRemote: false,
    isPriority: false,
    applicationDeadline: '',
  });

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (response.ok) {
          const data: CompanyData = await response.json();
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast.error('Failed to load company data');
      }
    };

    const fetchLocations = async () => {
      try {
        const [citiesRes, provincesRes] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/provinces')
        ]);
        
        if (citiesRes.ok && provincesRes.ok) {
          const citiesData: City[] = await citiesRes.json();
          const provincesData: Province[] = await provincesRes.json();
          setCities(citiesData);
          setProvinces(provincesData);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error('Failed to load location data');
      }
    };

    if (companyId) {
      fetchCompanyData();
      fetchLocations();
    }
  }, [companyId]);

  useEffect(() => {
    if (isEditing && jobId && companyId) {
      const fetchJobData = async () => {
        try {
          const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch job data');
          }
          const jobData = await response.json();
          
          setFormData({
            title: jobData.title || '',
            employmentType: jobData.employmentType || '',
            category: jobData.category || '',
            experienceLevel: jobData.experienceLevel || '',
            provinceId: jobData.provinceId || '',
            cityId: jobData.cityId || '',
            country: jobData.country || 'Indonesia',
            companyId: companyId,
            salaryMin: jobData.salaryMin?.toString() || '',
            salaryMax: jobData.salaryMax?.toString() || '',
            description: jobData.description || '',
            requirements: jobData.requirements || [],
            benefits: jobData.benefits || [],
            tags: jobData.tags || [],
            isActive: jobData.isActive ?? true,
            isRemote: jobData.isRemote ?? false,
            isPriority: jobData.isPriority ?? false,
            applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toISOString().split('T')[0] : '',
          });
        } catch (error) {
          console.error('Error fetching job data:', error);
          toast.error('Failed to load job data');
        }
      };

      fetchJobData();
    }
  }, [isEditing, jobId, companyId]);

  const validateForm = (data: FormData) => {
    if (!data.title || !data.employmentType || !data.category || !data.experienceLevel) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const preparePayload = (data: FormData, company: CompanyData | null) => {
    return {
      ...data,
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
      companyName: company?.name,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = preparePayload(formData, companyData);
      
      const url = isEditing 
        ? `/api/companies/${companyId}/jobs/${jobId}` 
        : `/api/companies/${companyId}/jobs`;

      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save job posting');
      }

      toast.success(isEditing ? 'Job updated successfully' : 'Job created successfully');
      router.push('/company/profile');
    } catch (error) {
      console.error('Error saving job posting:', error);
      toast.error('Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <CreateJobFormBasicInput formData={formData} setFormData={setFormData} />
      <CreateJobFormDetailsInput
        formData={formData}
        setFormData={setFormData}
        cities={cities}
        provinces={provinces}
      />
      <CreateJobFormBadgeInput formData={formData} setFormData={setFormData} />
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/company/profile')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}