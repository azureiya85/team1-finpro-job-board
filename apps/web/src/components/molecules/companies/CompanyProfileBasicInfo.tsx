import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Building2 } from 'lucide-react';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';
import { categoryLabels } from '@/lib/jobConstants';

interface CompanyProfileBasicInfoProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  toggleFieldEdit: (field: keyof EditableFieldsState) => void;
}

export default function CompanyProfileBasicInfo({
  form,
  editableFields,
  toggleFieldEdit
}: CompanyProfileBasicInfoProps) {
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Company name, industry, and basic details</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-basic"
              checked={editableFields.basicInfo}
              onCheckedChange={() => toggleFieldEdit('basicInfo')}
            />
            <Label htmlFor="edit-basic" className="text-sm font-medium">
              Make fields editable
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={!editableFields.basicInfo}
              className={editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              disabled={!editableFields.basicInfo}
              value={watch('industry') || ''}
              onValueChange={(value) => {
                setValue('industry', value, { shouldDirty: true, shouldTouch: true });
              }}
            >
              <SelectTrigger className={editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="website"
                {...register('website')}
                disabled={!editableFields.basicInfo}
                className={`pl-10 ${editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}`}
                placeholder="https://example.com"
              />
            </div>
            {errors.website && (
              <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              {...register('logo')}
              disabled={!editableFields.basicInfo}
              className={editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}
              placeholder="https://example.com/logo.png"
            />
            {errors.logo && (
              <p className="text-sm text-red-600 mt-1">{errors.logo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Banner URL</Label>
            <Input
              id="banner"
              {...register('banner')}
              disabled={!editableFields.basicInfo}
              className={editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}
              placeholder="https://example.com/banner.png"
            />
            {errors.banner && (
              <p className="text-sm text-red-600 mt-1">{errors.banner.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}