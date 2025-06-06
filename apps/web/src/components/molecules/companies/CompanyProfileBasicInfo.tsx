import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Building2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';
import { categoryLabels } from '@/lib/jobConstants';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const onLogoUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || !editableFields.basicInfo) return;

    setUploadingLogo(true);
    try {
      const file = acceptedFiles[0];
      const url = await uploadImage(file, 'company-logos');
      setValue('logo', url, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      console.error('Logo upload failed:', error);
    } finally {
      setUploadingLogo(false);
    }
  }, [editableFields.basicInfo, setValue]);

  const onBannerUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || !editableFields.basicInfo) return;

    setUploadingBanner(true);
    try {
      const file = acceptedFiles[0];
      const url = await uploadImage(file, 'company-banners');
      setValue('banner', url, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      console.error('Banner upload failed:', error);
    } finally {
      setUploadingBanner(false);
    }
  }, [editableFields.basicInfo, setValue]);

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive
  } = useDropzone({
    onDrop: onLogoUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: !editableFields.basicInfo || uploadingLogo
  });

  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
    isDragActive: isBannerDragActive
  } = useDropzone({
    onDrop: onBannerUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: !editableFields.basicInfo || uploadingBanner
  });

  const currentLogo = watch('logo');
  const currentBanner = watch('banner');

  const removeLogo = () => {
    setValue('logo', '', { shouldDirty: true, shouldTouch: true });
  };

  const removeBanner = () => {
    setValue('banner', '', { shouldDirty: true, shouldTouch: true });
  };

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
      <CardContent className="space-y-6">
        {/* Company Name and Industry */}
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
        </div>

        {/* Website */}
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

        {/* Logo Upload Section */}
        <div className="space-y-3">
          <Label>Company Logo</Label>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              {currentLogo ? (
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                    <Image
                      src={currentLogo}
                      alt="Company Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                      unoptimized 
                    />
                  </div>
                  {editableFields.basicInfo && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Logo Upload Area */}
            <div className="flex-1">
              <div
                {...getLogoRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${!editableFields.basicInfo ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isLogoDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${editableFields.basicInfo && !uploadingLogo ? 'hover:bg-gray-50' : ''}
                `}
              >
                <input {...getLogoInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {uploadingLogo ? 'Uploading...' : 'Drop your logo here, or click to browse'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB (Square format recommended)
                </p>
              </div>
            </div>
          </div>
          {errors.logo && (
            <p className="text-sm text-red-600">{errors.logo.message}</p>
          )}
        </div>

        {/* Banner Upload Section */}
        <div className="space-y-3">
          <Label>Company Banner</Label>
          <div className="space-y-4">
            {/* Banner Preview */}
            {currentBanner ? (
              <div className="relative">
                <div className="w-full h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                  <Image
                    src={currentBanner}
                    alt="Company Banner"
                    width={1200}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized 
                  />
                </div>
                {editableFields.basicInfo && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                    onClick={removeBanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No banner uploaded</p>
                </div>
              </div>
            )}

            {/* Banner Upload Area */}
            <div
              {...getBannerRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${!editableFields.basicInfo ? 'opacity-50 cursor-not-allowed' : ''}
                ${isBannerDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${editableFields.basicInfo && !uploadingBanner ? 'hover:bg-gray-50' : ''}
              `}
            >
              <input {...getBannerInputProps()} />
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {uploadingBanner ? 'Uploading...' : 'Drop your banner here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB (Wide format recommended: 16:9 ratio)
              </p>
            </div>
          </div>
          {errors.banner && (
            <p className="text-sm text-red-600">{errors.banner.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}