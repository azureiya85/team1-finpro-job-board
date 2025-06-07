'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateJobFormSection } from '@/components/molecules/jobs/CreateJobFormSection';
import { CreateJobFormInput } from '@/components/atoms/jobs/CreateJobFormInputs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  employmentTypeLabels, 
  experienceLevelLabels, 
  categoryLabels 
} from '@/lib/jobConstants';
import type { 
  CompanyData,
  CreateJobFormProps,
  FormData,
  JobPayload
} from '@/types';
import type { City, Province, EmploymentType, ExperienceLevel, JobCategory } from '@prisma/client';

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
  
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [tagInput, setTagInput] = useState('');

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

  const handleArrayInput = (
    value: string,
    setValue: (value: string) => void,
    array: string[],
    fieldName: 'requirements' | 'benefits' | 'tags',
    maxItems = 20
  ) => {
    if (array.length >= maxItems) return;
    
    const trimmedValue = value.trim();
    if (trimmedValue && !array.includes(trimmedValue)) {
      const newArray = [...array, trimmedValue];
      setFormData(prev => ({
        ...prev,
        [fieldName]: newArray
      }));
      setValue('');
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    inputValue: string,
    setInputValue: (value: string) => void,
    array: string[],
    fieldName: 'requirements' | 'benefits' | 'tags',
    maxItems = 20
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleArrayInput(inputValue, setInputValue, array, fieldName, maxItems);
    }
  };

  const removeArrayItem = (index: number, fieldName: 'requirements' | 'benefits' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return false;
    }
    
    if (formData.requirements.length === 0) {
      toast.error('At least one requirement is needed');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {  
      // Bersihkan, lalu persiapkan data
      const cleanRequirements = formData.requirements.filter(req => req.trim() !== '');
      const cleanBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
      const cleanTags = formData.tags.filter(tag => tag.trim() !== '');

      // Prepare payload sesuai dengan schema database
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
      router.push('/dashboard/jobs');
      
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <div className="text-sm text-gray-500 mt-1">
          {formData.title.length}/200 characters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            value={formData.employmentType} 
            onValueChange={(value: EmploymentType) => setFormData({ ...formData, employmentType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Employment Type *" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(employmentTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            value={formData.category} 
            onValueChange={(value: JobCategory) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Job Category *" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.experienceLevel}
            onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experienceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Experience Level *" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(experienceLevelLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            value={formData.provinceId}
            onValueChange={(value: string) => setFormData({ ...formData, provinceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.cityId}
            onValueChange={(value: string) => setFormData({ ...formData, cityId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Salary (IDR)
            </label>
            <Input
              name="salaryMin"
              type="number"
              value={formData.salaryMin}
              onChange={handleInputChange}
              placeholder="Minimum: 1,000,000"
              min="1000000"
            />
            <div className="text-sm text-gray-500 mt-1">
              Minimum: Rp 1,000,000
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Salary (IDR)
            </label>
            <Input
              name="salaryMax"
              type="number"
              value={formData.salaryMax}
              onChange={handleInputChange}
              placeholder="Maximum: 1,000,000,000"
              max="1000000000"
            />
            <div className="text-sm text-gray-500 mt-1">
              Maximum: Rp 1,000,000,000
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Application Deadline
          </label>
          <Input
            name="applicationDeadline"
            type="date"
            value={formData.applicationDeadline}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Description and Requirements">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed job description (minimum 50 characters)"
              className="min-h-[150px]"
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.description.length}/5000 characters (minimum: 50)
            </div>
          </div>

          {/* Requirements Section with Badge Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Requirements * (Press Enter or comma to add)
            </label>
            
            <div className="border rounded-lg p-3 min-h-[100px] bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="default" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                    {req}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              
              {/* Input field */}
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, requirementInput, setRequirementInput, formData.requirements, 'requirements', 20)}
                placeholder={formData.requirements.length === 0 ? "Type a requirement and press Enter or comma..." : "Add another requirement..."}
                className="w-full bg-transparent border-none outline-none text-sm"
                disabled={formData.requirements.length >= 20}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Press Enter or comma (,) to add • Click X to remove</span>
              <span className={formData.requirements.length >= 20 ? 'text-red-500' : 'text-gray-500'}>
                {formData.requirements.length}/20 requirements
              </span>
            </div>
          </div>

          {/* Benefits Section with Badge Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Benefits (Press Enter or comma to add)
            </label>
            
            <div className="border rounded-lg p-3 min-h-[80px] bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'benefits')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, benefitInput, setBenefitInput, formData.benefits, 'benefits', 20)}
                placeholder={formData.benefits.length === 0 ? "Type a benefit and press Enter or comma..." : "Add another benefit..."}
                className="w-full bg-transparent border-none outline-none text-sm"
                disabled={formData.benefits.length >= 20}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Press Enter or comma (,) to add • Click X to remove</span>
              <span className={formData.benefits.length >= 20 ? 'text-red-500' : 'text-gray-500'}>
                {formData.benefits.length}/20 benefits
              </span>
            </div>
          </div>

          {/* Tags Section with Badge Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Tags (Press Enter or comma to add)
            </label>
            
            <div className="border rounded-lg p-3 min-h-[60px] bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="default" className="bg-primary-100 text-primary-800 hover:bg-teritary-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'tags')}
                      className="ml-1 text-primary-600 hover:text-teritary-800"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, tagInput, setTagInput, formData.tags, 'tags', 20)}
                placeholder={formData.tags.length === 0 ? "Type a tag and press Enter or comma..." : "Add another tag..."}
                className="w-full bg-transparent border-none outline-none text-sm"
                disabled={formData.tags.length >= 20}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Press Enter or comma (,) to add • Click X to remove</span>
              <span className={formData.tags.length >= 20 ? 'text-red-500' : 'text-gray-500'}>
                {formData.tags.length}/20 tags
              </span>
            </div>
          </div>
        </div>
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