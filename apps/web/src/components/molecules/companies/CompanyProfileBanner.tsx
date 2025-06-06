import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompanyProfileBannerProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  uploadingBanner: boolean;
  setUploadingBanner: (uploading: boolean) => void;
  uploadImage: (file: File, folder: string) => Promise<string>;
}

export default function CompanyProfileBanner({
  form,
  editableFields,
  uploadingBanner,
  setUploadingBanner,
  uploadImage
}: CompanyProfileBannerProps) {
  const { formState: { errors }, setValue, watch } = form;
  const [uploadError, setUploadError] = useState<string>('');

  const onBannerUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || !editableFields.basicInfo) return;

    setUploadingBanner(true);
    setUploadError(''); // Clear previous errors
    
    try {
      const file = acceptedFiles[0];
      const url = await uploadImage(file, 'company-banners');
      setValue('banner', url, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Banner upload failed';
      console.error('Banner upload failed:', error);
      setUploadError(errorMessage);
    } finally {
      setUploadingBanner(false);
    }
  }, [editableFields.basicInfo, setValue, setUploadingBanner, uploadImage]);

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

  const currentBanner = watch('banner');

  const removeBanner = () => {
    setValue('banner', '', { shouldDirty: true, shouldTouch: true });
    setUploadError(''); // Clear error when removing banner
  };

  return (
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
      
      {/* Error Messages */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {errors.banner && (
        <p className="text-sm text-red-600">{errors.banner.message}</p>
      )}
    </div>
  );
}