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

interface CompanyProfileLogoProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  uploadingLogo: boolean;
  setUploadingLogo: (uploading: boolean) => void;
  uploadImage: (file: File, folder: string) => Promise<string>;
}

export default function CompanyProfileLogo({
  form,
  editableFields,
  uploadingLogo,
  setUploadingLogo,
  uploadImage
}: CompanyProfileLogoProps) {
  const { formState: { errors }, setValue, watch } = form;
  const [uploadError, setUploadError] = useState<string>('');

  const onLogoUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || !editableFields.basicInfo) return;

    setUploadingLogo(true);
    setUploadError(''); // Clear previous errors
    
    try {
      const file = acceptedFiles[0];
      const url = await uploadImage(file, 'company-logos');
      setValue('logo', url, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logo upload failed';
      console.error('Logo upload failed:', error);
      setUploadError(errorMessage);
    } finally {
      setUploadingLogo(false);
    }
  }, [editableFields.basicInfo, setValue, setUploadingLogo, uploadImage]);

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

  const currentLogo = watch('logo');

  const removeLogo = () => {
    setValue('logo', '', { shouldDirty: true, shouldTouch: true });
    setUploadError(''); // Clear error when removing logo
  };

  return (
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
      
      {/* Error Messages */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {errors.logo && (
        <p className="text-sm text-red-600">{errors.logo.message}</p>
      )}
    </div>
  );
}