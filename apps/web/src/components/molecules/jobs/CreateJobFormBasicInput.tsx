'use client';

import { 
  Briefcase, 
  Clock,
  Users,
  Building2
} from 'lucide-react';
import { CreateJobFormSection } from '@/components/molecules/jobs/CreateJobFormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  employmentTypeLabels, 
  experienceLevelLabels, 
  categoryLabels 
} from '@/lib/jobConstants';
import type { FormData } from '@/types';
import type { EmploymentType, ExperienceLevel, JobCategory } from '@prisma/client';

interface CreateJobFormBasicInputProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function CreateJobFormBasicInput({ 
  formData, 
  setFormData
}: CreateJobFormBasicInputProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <CreateJobFormSection title="Basic Information">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <div className="relative mt-1">
            <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Example: Senior Frontend Developer"
              className="pl-10 h-11"
              maxLength={200}
              required
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Employment Type *</Label>
            <Select 
              value={formData.employmentType} 
              onValueChange={(value: EmploymentType) => setFormData({ ...formData, employmentType: value })}
            >
              <SelectTrigger className="h-11 mt-1">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Employment Type" />
                </div>
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

          <div>
            <Label>Experience Level *</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experienceLevel: value })}
            >
              <SelectTrigger className="h-11 mt-1">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Experience Level" />
                </div>
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
        </div>

        <div>
          <Label>Job Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value: JobCategory) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="h-11 mt-1">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select Job Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CreateJobFormSection>
  );
}