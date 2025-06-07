'use client';

import { useState, useEffect } from 'react';
import { CreateJobFormSection } from '@/components/molecules/jobs/CreateJobFormSection';
import { CreateJobFormInput } from '@/components/atoms/jobs/CreateJobFormInputs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CreateJobFormProps {
  jobId?: string;
  isEditing?: boolean;
  companyId: string;
}

export function CreateJobForm({ jobId, isEditing, companyId }: CreateJobFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
    requirements: [] as string[],
    benefits: [] as string[],
    tags: [] as string[],
    isActive: true,
    isRemote: false,
    isPriority: false,
    applicationDeadline: '',
  });

  const [companyData, setCompanyData] = useState<any>(null);

  // State untuk menyimpan data cities dan provinces
  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast.error('Failed to load company data');
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Fetch cities dan provinces data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [citiesRes, provincesRes] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/provinces')
        ]);
        
        if (citiesRes.ok && provincesRes.ok) {
          const citiesData = await citiesRes.json();
          const provincesData = await provincesRes.json();
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

  useEffect(() => {
    const fetchJobData = async () => {
      if (isEditing && jobId) {
        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch job data');
          }
          const jobData = await response.json();
          
          // Update formData dengan data job yang ada
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
            isRemote: jobData.isRemote || false,
            isPriority: jobData.isPriority || false,
            applicationDeadline: jobData.applicationDeadline 
              ? new Date(jobData.applicationDeadline).toISOString().split('T')[0]
              : '',
          });
        } catch (error) {
          console.error('Error fetching job data:', error);
          toast.error('Failed to load job data');
        }
      }
    };

    fetchJobData();
  }, [isEditing, jobId, companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi field wajib
    const requiredFields = [
      'title',
      'employmentType',
      'category',
      'experienceLevel',
      'description',
      'requirements'
    ];

    // Validasi requirements
    const cleanRequirements = formData.requirements
      .filter(req => req.trim() !== '');

    if (cleanRequirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

    const missingFields = requiredFields.filter(field => {
      if (field === 'requirements') {
        return cleanRequirements.length === 0;
      }
      return !formData[field as keyof typeof formData];
    });
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Persiapkan payload sesuai dengan schema database
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        salaryCurrency: "IDR",
        isRemote: formData.isRemote,
        isPriority: formData.isPriority,
        isActive: true,
        provinceId: formData.provinceId ? formData.provinceId.toString() : null,
        cityId: formData.cityId ? formData.cityId.toString() : null,
        country: "Indonesia",
        longitude: companyData?.longitude || null,
        latitude: companyData?.latitude || null,
        applicationDeadline: formData.applicationDeadline 
          ? new Date(formData.applicationDeadline).toISOString() 
          : null,
        requirements: cleanRequirements,
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        companyId: companyId
      };

      const url = isEditing 
        ? `/api/jobs/${jobId}` 
        : '/api/jobs/create-jobs';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to save job posting';

        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          console.error('JSON error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } else {
          const textError = await response.text();
          console.error('Non-JSON response:', textError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      toast.success(isEditing ? 'Job updated successfully' : 'Job created successfully');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save job posting');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    router.push('/dashboard/jobs');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CreateJobFormSection title="Basic Information">
        <CreateJobFormInput
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Example: Senior Frontend Developer"
          required={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            value={formData.employmentType} 
            onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Job Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TECHNOLOGY">Technology</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="SALES">Sales</SelectItem>
              <SelectItem value="FINANCE">Finance</SelectItem>
              <SelectItem value="HUMAN_RESOURCES">Human Resources</SelectItem>
              <SelectItem value="OPERATIONS">Operations</SelectItem>
              <SelectItem value="DESIGN">Design</SelectItem>
              <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
              <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
              <SelectItem value="EDUCATION">Education</SelectItem>
              <SelectItem value="CONSTRUCTION">Construction</SelectItem>
              <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="HOSPITALITY">Hospitality</SelectItem>
              <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
              <SelectItem value="LEGAL">Legal</SelectItem>
              <SelectItem value="CONSULTING">Consulting</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="NON_PROFIT">Non Profit</SelectItem>
              <SelectItem value="GOVERNMENT">Government</SelectItem>
              <SelectItem value="ENGINEERING">Engineering</SelectItem>
              <SelectItem value="SCIENCE_RESEARCH">Science Research</SelectItem>
              <SelectItem value="ARTS_ENTERTAINMENT">Arts & Entertainment</SelectItem>
              <SelectItem value="WRITING_EDITING">Writing & Editing</SelectItem>
              <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
              <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
              <SelectItem value="AUTOMOTIVE">Automotive</SelectItem>
              <SelectItem value="AEROSPACE_DEFENSE">Aerospace & Defense</SelectItem>
              <SelectItem value="ENERGY_UTILITIES">Energy & Utilities</SelectItem>
              <SelectItem value="TELECOMMUNICATIONS">Telecommunications</SelectItem>
              <SelectItem value="LOGISTICS_SUPPLY_CHAIN">Logistics & Supply Chain</SelectItem>
              <SelectItem value="ARCHITECTURE_PLANNING">Architecture & Planning</SelectItem>
              <SelectItem value="SPORTS_FITNESS">Sports & Fitness</SelectItem>
              <SelectItem value="ENVIRONMENTAL_SERVICES">Environmental Services</SelectItem>
              <SelectItem value="SECURITY_PROTECTIVE_SERVICES">Security & Protective Services</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={formData.experienceLevel}
            onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRY_LEVEL">Entry Level</SelectItem>
              <SelectItem value="MID_LEVEL">Mid Level</SelectItem>
              <SelectItem value="SENIOR_LEVEL">Senior Level</SelectItem>
              <SelectItem value="EXECUTIVE">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            value={formData.provinceId}
            onValueChange={(value) => setFormData({ ...formData, provinceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province: any) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.cityId}
            onValueChange={(value) => setFormData({ ...formData, cityId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city: any) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRemote"
              checked={formData.isRemote}
              onCheckedChange={(checked: boolean) => {
                setFormData(prev => ({
                  ...prev,
                  isRemote: checked,
                  isPriority: checked ? false : prev.isPriority
                }));
              }}
            />
            <label htmlFor="isRemote">Remote Job</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPriority"
              checked={formData.isPriority}
              onCheckedChange={(checked: boolean) => {
                setFormData(prev => ({
                  ...prev,
                  isPriority: checked,
                  isRemote: checked ? false : prev.isRemote
                }));
              }}
            />
            <label htmlFor="isPriority">Priority Job</label>
          </div>
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Salary and Deadline">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CreateJobFormInput
            label="Minimum Salary"
            name="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={handleInputChange}
            placeholder="Example: 10000000"
          />
          <CreateJobFormInput
            label="Maximum Salary"
            name="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={handleInputChange}
            placeholder="Example: 15000000"
          />
        </div>

        <CreateJobFormInput
          label="Application Deadline"
          name="applicationDeadline"
          type="date"
          value={formData.applicationDeadline}
          onChange={handleInputChange}
        />
      </CreateJobFormSection>

      <CreateJobFormSection title="Description and Requirements">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed job description"
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <Input
              name="requirements"
              value={formData.requirements.join(', ')}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  requirements: value ? value.split(',').map(item => item.trim()) : []
                }));
              }}
              placeholder="Enter requirements, separate with commas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits</label>
            <Input
              name="benefits"
              value={formData.benefits.join(', ')}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  benefits: value ? value.split(',').map(item => item.trim()) : []
                }));
              }}
              placeholder="Enter benefits, separate with commas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <Input
              name="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  tags: value ? value.split(',').map(item => item.trim()) : []
                }));
              }}
              placeholder="Enter tags, separate with commas"
            />
          </div>
        </div>
      </CreateJobFormSection>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button type="submit">{isEditing ? 'Update' : 'Save'}</Button>
      </div>
    </form>
  );
}