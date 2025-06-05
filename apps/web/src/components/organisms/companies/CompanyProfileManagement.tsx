'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { updateCompanySchema, UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { CompanyDetailed } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X, Globe, Phone, Mail, MapPin, Calendar, Users, Building2, ExternalLink } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios, { AxiosError } from 'axios';
import { CompanySize } from '@prisma/client';

interface CompanyProfileEditProps {
  className?: string;
}

interface EditableFieldsState {
  basicInfo: boolean;
  contactInfo: boolean;
  locationInfo: boolean;
  socialLinks: boolean;
  companyDetails: boolean;
  description: boolean;
}

const companySizeOptions = [
  { value: 'STARTUP', label: '1-10 employees (Startup)' },
  { value: 'SMALL', label: '11-50 employees (Small)' },
  { value: 'MEDIUM', label: '51-200 employees (Medium)' },
  { value: 'LARGE', label: '201-1000 employees (Large)' },
  { value: 'ENTERPRISE', label: '1000+ employees (Enterprise)' }
];

export default function CompanyProfileEdit({ className }: CompanyProfileEditProps) {
  
  const company = useCompanyProfileStore((state) => state.company) as CompanyDetailed | null;
  const setCompany = useCompanyProfileStore((state) => state.setCompany);

  const [editableFields, setEditableFields] = useState<EditableFieldsState>({
    basicInfo: false,
    contactInfo: false,
    locationInfo: false,
    socialLinks: false,
    companyDetails: false,
    description: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

 const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company?.name || '',
      website: company?.website || '',
      industry: company?.industry || '',
      size: company?.size || undefined,
      foundedYear: company?.foundedYear || undefined,
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
      country: company?.country || '',
      linkedinUrl: company?.linkedinUrl || '',
      facebookUrl: company?.facebookUrl || '',
      twitterUrl: company?.twitterUrl || '',
      instagramUrl: company?.instagramUrl || '',
      logo: company?.logo || '',
      banner: company?.banner || '',
    }
  });

  // Rich Text Editor for description
  const editor = useEditor({
    extensions: [StarterKit],
    content: company?.description || '',
    editable: editableFields.description,
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  // Update editor editability when field state changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editableFields.description);
    }
  }, [editableFields.description, editor]);

  // Watch for form changes
  useEffect(() => {
    const subscription = watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  const toggleFieldEdit = (field: keyof EditableFieldsState) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveChanges = async (data: UpdateCompanyFormData) => {
    if (!company) return;

  try {
  setIsSubmitting(true);

  // Include description from editor
  const formData = {
    ...data,
    description: editor?.getHTML() || company.description,
  };

  const response = await axios.put<{ company: CompanyDetailed }>(
    `/api/companies/${company.id}`,
    formData
  );

  if (response.data.company) {
    setCompany(response.data.company);
    toast.success('Company profile updated successfully!');
    setHasChanges(false);
    setEditableFields({
      basicInfo: false,
      contactInfo: false,
      locationInfo: false,
      socialLinks: false,
      companyDetails: false,
      description: false,
    });
  }
} catch (error: unknown) {
  console.error('Error updating company:', error);
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ error: string }>;

    const serverMessage = axiosErr.response?.data?.error;
    toast.error(serverMessage ?? 'Failed to update company profile');
  } else {
    toast.error('Failed to update company profile');
  }
} finally {
  setIsSubmitting(false);
}
  };

  const handleDiscardChanges = () => {
    reset();
    editor?.commands.setContent(company?.description || '');
    setHasChanges(false);
    setEditableFields({
      basicInfo: false,
      contactInfo: false,
      locationInfo: false,
      socialLinks: false,
      companyDetails: false,
      description: false,
    });
    toast.info('Changes discarded');
  };

  if (!company) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Company Profile</h2>
          <p className="text-gray-600 mt-1">Update your company information and settings</p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardChanges}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Discard Changes
            </Button>
            <Button
              onClick={handleSubmit(handleSaveChanges)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleSaveChanges)} className="space-y-6">
        {/* Basic Information */}
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
              <div>
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
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...register('industry')}
                  disabled={!editableFields.basicInfo}
                  className={editableFields.basicInfo ? 'ring-2 ring-blue-200' : ''}
                />
                {errors.industry && (
                  <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
                )}
              </div>

              <div>
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

              <div>
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

              <div>
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

        {/* Company Description */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Company Description</CardTitle>
                <CardDescription>Tell people about your company</CardDescription>
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
            <div className={`min-h-[200px] border rounded-md p-4 ${editableFields.description ? 'ring-2 ring-blue-200' : 'bg-gray-50'}`}>
              <EditorContent 
                editor={editor} 
                className="prose max-w-none focus:outline-none"
              />
            </div>
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
              <div>
                <Label htmlFor="size">Company Size</Label>
                <Select
                  disabled={!editableFields.companyDetails}
                  value={watch('size') || ''}
                 onValueChange={(value) => {
  if (value) {
    setValue('size', value as CompanySize);
  } else {
    setValue('size', undefined);
  }
}}
                >
                  <SelectTrigger className={editableFields.companyDetails ? 'ring-2 ring-blue-200' : ''}>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
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
                <div className="relative">
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
                <div className="relative">
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                disabled={!editableFields.locationInfo}
                className={editableFields.locationInfo ? 'ring-2 ring-blue-200' : ''}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </form>
    </div>
  );
}