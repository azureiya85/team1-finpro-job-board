'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CreateJobFormSection } from '@/components/molecules/jobs/CreateJobFormSection';
import { CreateJobFormBasicInput } from '@/components/molecules/jobs/CreateJobFormBasicInput';
import { CreateJobFormDetailsInput } from '@/components/molecules/jobs/CreateJobFormDetailsInput';
import { CreateJobFormBadgeInput } from '@/components/molecules/jobs/CreateJobFormBadgeInput';
import { validateForm, preparePayload } from '@/components/molecules/jobs/CreateJobFormPayload';
import type { 
  CompanyData,
  CreateJobFormProps,
  FormData
} from '@/types';
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

    fetchCompanyData();
  }, [companyId]);

  useEffect(() => {
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

    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = preparePayload(formData, companyData);
      
      const url = isEditing 
        ? `/api/jobs/${jobId}` 
        : '/api/jobs/create-jobs';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.issues) {
          const firstError = responseData.issues[0];
          toast.error(`${firstError.path.join('.')}: ${firstError.message}`);
        } else {
          toast.error(responseData.message || 'Failed to save job posting');
        }
        return;
      }

      toast.success(isEditing ? 'Job updated successfully' : 'Job created successfully');
      router.push(`/companies/${companyId}`);
      
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/companies/${companyId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CreateJobFormBasicInput
        formData={formData}
        setFormData={setFormData}
      />

      <CreateJobFormDetailsInput
        formData={formData}
        setFormData={setFormData}
        cities={cities}
        provinces={provinces}
      />

      <CreateJobFormSection title="Description and Requirements">
        <CreateJobFormBadgeInput
          formData={formData}
          setFormData={setFormData}
        />
      </CreateJobFormSection>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create Job')}
        </Button>
      </div>
    </form>
  );
}