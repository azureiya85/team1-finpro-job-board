import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';    

interface CompanyProfileContactInfoProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  toggleFieldEdit: (field: keyof EditableFieldsState) => void;
}

export default function CompanyProfileContactInfo({
  form,
  editableFields,
  toggleFieldEdit
}: CompanyProfileContactInfoProps) {
  const { register, formState: { errors } } = form;

  return (
    <>
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Email, phone, and contact details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-contact"
                checked={editableFields.contactInfo}
                onCheckedChange={() => toggleFieldEdit('contactInfo')}
              />
              <Label htmlFor="edit-contact" className="text-sm font-medium">
                Make fields editable
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!editableFields.contactInfo}
                  className={`pl-10 ${editableFields.contactInfo ? 'ring-2 ring-blue-200' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  {...register('phone')}
                  disabled={!editableFields.contactInfo}
                  className={`pl-10 ${editableFields.contactInfo ? 'ring-2 ring-blue-200' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>Address and location details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-location"
                checked={editableFields.locationInfo}
                onCheckedChange={() => toggleFieldEdit('locationInfo')}
              />
              <Label htmlFor="edit-location" className="text-sm font-medium">
                Make fields editable
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="space-y-2" htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              disabled={!editableFields.locationInfo}
              className={editableFields.locationInfo ? ' ring-2 ring-blue-200' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              disabled={!editableFields.locationInfo}
              className={editableFields.locationInfo ? 'ring-2 ring-blue-200' : ''}
            />
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-social"
                checked={editableFields.socialLinks}
                onCheckedChange={() => toggleFieldEdit('socialLinks')}
              />
              <Label htmlFor="edit-social" className="text-sm font-medium">
                Make fields editable
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                {...register('linkedinUrl')}
                disabled={!editableFields.socialLinks}
                className={editableFields.socialLinks ? 'ring-2 ring-blue-200' : ''}
                placeholder="https://linkedin.com/company/..."
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                {...register('facebookUrl')}
                disabled={!editableFields.socialLinks}
                className={editableFields.socialLinks ? 'ring-2 ring-blue-200' : ''}
                placeholder="https://facebook.com/..."
              />
              {errors.facebookUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.facebookUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                {...register('twitterUrl')}
                disabled={!editableFields.socialLinks}
                className={editableFields.socialLinks ? 'ring-2 ring-blue-200' : ''}
                placeholder="https://twitter.com/..."
              />
              {errors.twitterUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.twitterUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                {...register('instagramUrl')}
                disabled={!editableFields.socialLinks}
                className={editableFields.socialLinks ? 'ring-2 ring-blue-200' : ''}
                placeholder="https://instagram.com/..."
              />
              {errors.instagramUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.instagramUrl.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}