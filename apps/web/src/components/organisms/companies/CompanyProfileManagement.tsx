'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { updateCompanySchema, UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { CompanyDetailed } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import CompanyProfileBasicInfo from '@/components/molecules/companies/CompanyProfileBasicInfo';
import CompanyProfileCompanyInfo from '@/components/molecules/companies/CompanyProfileCompanyInfo';
import CompanyProfileContactInfo from '@/components/molecules/companies/CompanyProfileContactInfo';
import CompanyProfileImage from '@/components/molecules/companies/CompanyProfileImage';

interface CompanyProfileEditProps {
  className?: string;
}

export interface EditableFieldsState {
  basicInfo: boolean;
  contactInfo: boolean;
  locationInfo: boolean;
  socialLinks: boolean;
  companyDetails: boolean;
  description: boolean;
}

export default function CompanyProfileManagement({ className }: CompanyProfileEditProps) {
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
  const [descriptionContent, setDescriptionContent] = useState<string>('');

  const form = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      email: '',
      phone: '',
      address: '',
      country: '',
      linkedinUrl: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      logo: '',
      banner: '',
    }
  });

  const { handleSubmit, reset, watch } = form;

  // Initialize form with company data
  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || undefined,
        foundedYear: company.foundedYear || undefined,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        country: company.country || '',
        linkedinUrl: company.linkedinUrl || '',
        facebookUrl: company.facebookUrl || '',
        twitterUrl: company.twitterUrl || '',
        instagramUrl: company.instagramUrl || '',
        logo: company.logo || '',
        banner: company.banner || '',
      });
      setDescriptionContent(company.description || '');
      setHasChanges(false);
    }
  }, [company, reset]);

  // Watch for form changes
  useEffect(() => {
    const subscription = watch((_value, { name }) => {
      if (company && name) { 
        setHasChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, company]);

  // Handle description changes
  const handleDescriptionChange = useCallback((newContent: string) => {
    setDescriptionContent(newContent);
    if (company) {
      setHasChanges(true);
    }
  }, [company]);

  // Toggle field editability
  const toggleFieldEdit = (field: keyof EditableFieldsState) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Save changes handler
  const handleSaveChanges = async (data: UpdateCompanyFormData) => {
    if (!company) return;
    
    try {
      setIsSubmitting(true);
      const formData = { ...data, description: descriptionContent };
      const response = await axios.put<{ company: CompanyDetailed }>(
        `/api/companies/${company.id}`,
        formData
      );

      if (response.data.company) {
        setCompany(response.data.company);
        toast.success('Company profile updated successfully!');
        setEditableFields({
          basicInfo: false, contactInfo: false, locationInfo: false,
          socialLinks: false, companyDetails: false, description: false,
        });
        setHasChanges(false);
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

  // Discard changes handler
  const handleDiscardChanges = () => {
    if (company) {
      reset({ 
        name: company.name || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || undefined,
        foundedYear: company.foundedYear || undefined,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        country: company.country || '',
        linkedinUrl: company.linkedinUrl || '',
        facebookUrl: company.facebookUrl || '',
        twitterUrl: company.twitterUrl || '',
        instagramUrl: company.instagramUrl || '',
        logo: company.logo || '',
        banner: company.banner || '',
      });
      setDescriptionContent(company.description || '');
    }
    setHasChanges(false);
    setEditableFields({
      basicInfo: false, contactInfo: false, locationInfo: false,
      socialLinks: false, companyDetails: false, description: false,
    });
    toast.info('Changes discarded');
  };

  // Loading state
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
        <CompanyProfileBasicInfo
          form={form}
          editableFields={editableFields}
          toggleFieldEdit={toggleFieldEdit}
        />

         <CompanyProfileImage
    form={form}
    editableFields={editableFields}
    toggleFieldEdit={toggleFieldEdit}
  />

        <CompanyProfileCompanyInfo
          form={form}
          editableFields={editableFields}
          toggleFieldEdit={toggleFieldEdit}
          descriptionContent={descriptionContent}
          onDescriptionChange={handleDescriptionChange}
        />

        <CompanyProfileContactInfo
          form={form}
          editableFields={editableFields}
          toggleFieldEdit={toggleFieldEdit}
        />
      </form>
    </div>
  );
}