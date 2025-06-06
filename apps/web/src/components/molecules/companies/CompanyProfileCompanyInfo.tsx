import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';
import { CompanySize } from '@prisma/client';
import RichTextEditor from '@/components/atoms/RichTextEditor';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';
import { companySizeLabels } from '@/lib/jobConstants';

interface CompanyProfileCompanyInfoProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  toggleFieldEdit: (field: keyof EditableFieldsState) => void;
  descriptionContent: string;
  onDescriptionChange: (content: string) => void;
}

export default function CompanyProfileCompanyInfo({
  form,
  editableFields,
  toggleFieldEdit,
  descriptionContent,
  onDescriptionChange
}: CompanyProfileCompanyInfoProps) {
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <>
      {/* Company Description */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Company Description</CardTitle>
              <CardDescription>Tell people about your company using rich text.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-description"
                checked={editableFields.description}
                onCheckedChange={() => toggleFieldEdit('description')}
              />
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Make field editable
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            key={editableFields.description ? 'description-editable' : 'description-readonly'}
            content={descriptionContent}
            onChange={onDescriptionChange}
            editable={editableFields.description}
            placeholder="Describe your company..."
            editorClassName={editableFields.description ? 'ring-2 ring-blue-200' : ''}
          />
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Company Details
              </CardTitle>
              <CardDescription>Size, founding year, and other details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-details"
                checked={editableFields.companyDetails}
                onCheckedChange={() => toggleFieldEdit('companyDetails')}
              />
              <Label htmlFor="edit-details" className="text-sm font-medium">
                Make fields editable
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select
                disabled={!editableFields.companyDetails}
                value={watch('size') || ''}
                onValueChange={(value) => {
                  if (value) {
                    setValue('size', value as CompanySize, { shouldDirty: true, shouldTouch: true });
                  } else {
                    setValue('size', undefined, { shouldDirty: true, shouldTouch: true });
                  }
                }}
              >
                <SelectTrigger className={editableFields.companyDetails ? 'ring-2 ring-blue-200' : ''}>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(companySizeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="foundedYear"
                  type="number"
                  {...register('foundedYear', { valueAsNumber: true })}
                  disabled={!editableFields.companyDetails}
                  className={`pl-10 ${editableFields.companyDetails ? 'ring-2 ring-blue-200' : ''}`}
                  placeholder="2020"
                />
              </div>
              {errors.foundedYear && (
                <p className="text-sm text-red-600 mt-1">{errors.foundedYear.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}