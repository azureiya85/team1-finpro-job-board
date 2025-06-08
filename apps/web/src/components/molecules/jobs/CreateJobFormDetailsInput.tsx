'use client';

import { 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText
} from 'lucide-react';
import { CreateJobFormSection } from '@/components/molecules/jobs/CreateJobFormSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FormData } from '@/types';
import type { City, Province } from '@prisma/client';

interface CreateJobFormDetailsInputProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  cities: City[];
  provinces: Province[];
}

export function CreateJobFormDetailsInput({ 
  formData, 
  setFormData, 
  cities, 
  provinces 
}: CreateJobFormDetailsInputProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <CreateJobFormSection title="Location">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Province</Label>
              <Select
                value={formData.provinceId}
                onValueChange={(value: string) => setFormData({ ...formData, provinceId: value })}
              >
                <SelectTrigger className="h-11 mt-1">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Province" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>City</Label>
              <Select
                value={formData.cityId}
                onValueChange={(value: string) => setFormData({ ...formData, cityId: value })}
              >
                <SelectTrigger className="h-11 mt-1">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select City" />
                  </div>
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
          </div>

          <div className="flex gap-6">
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
              <Label htmlFor="isRemote" className="text-sm font-medium">Remote Job</Label>
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
              <Label htmlFor="isPriority" className="text-sm font-medium">Priority Job</Label>
            </div>
          </div>
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Salary and Deadline">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Minimum Salary (IDR)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="1,000,000"
                  min="1000000"
                  className="pl-10 h-11"
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Minimum: Rp 1,000,000
              </div>
            </div>
            
            <div>
              <Label htmlFor="salaryMax">Maximum Salary (IDR)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="1,000,000,000"
                  max="1000000000"
                  className="pl-10 h-11"
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Maximum: Rp 1,000,000,000
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="applicationDeadline">Application Deadline</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="applicationDeadline"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10 h-11"
              />
            </div>
          </div>
        </div>
      </CreateJobFormSection>

      <CreateJobFormSection title="Job Description">
        <div>
          <Label htmlFor="description">Job Description *</Label>
          <div className="relative mt-1">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed job description (minimum 50 characters)"
              className="min-h-[150px] pl-10 resize-none"
              maxLength={5000}
              required
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formData.description.length}/5000 characters (minimum: 50)
          </div>
        </div>
      </CreateJobFormSection>
    </>
  );
}