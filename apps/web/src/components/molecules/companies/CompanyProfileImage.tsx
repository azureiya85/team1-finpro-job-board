import { UseFormReturn } from 'react-hook-form';
import { UpdateCompanyFormData } from '@/lib/validations/zodCompanyValidation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { EditableFieldsState } from '@/components/organisms/companies/CompanyProfileManagement';
import { useState } from 'react';
import CompanyProfileLogo from './CompanyProfileLogo';
import CompanyProfileBanner from './CompanyProfileBanner';

interface CompanyProfileImageProps {
  form: UseFormReturn<UpdateCompanyFormData>;
  editableFields: EditableFieldsState;
  toggleFieldEdit: (field: keyof EditableFieldsState) => void;
}

export default function CompanyProfileImage({
  form,
  editableFields,
  toggleFieldEdit
}: CompanyProfileImageProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Parse the response JSON first to get the error details
      const result = await response.json();

      if (!response.ok) {
        // Use the specific error message from the server
        const errorMessage = result.error || `Upload failed with status ${response.status}`;
        console.error('Upload error details:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          result
        });
        throw new Error(errorMessage);
      }

      return result.url;
    } catch (error) {
      // If it's a network error or JSON parsing error
      if (error instanceof TypeError) {
        console.error('Network error during upload:', error);
        throw new Error('Network error: Unable to connect to upload service');
      }
      
      // Re-throw the error with the original message
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Company Images
            </CardTitle>
            <CardDescription>Upload company logo and banner image</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-images"
              checked={editableFields.basicInfo}
              onCheckedChange={() => toggleFieldEdit('basicInfo')}
            />
            <Label htmlFor="edit-images" className="text-sm font-medium">
              Make fields editable
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CompanyProfileLogo
          form={form}
          editableFields={editableFields}
          uploadingLogo={uploadingLogo}
          setUploadingLogo={setUploadingLogo}
          uploadImage={uploadImage}
        />
        
        <CompanyProfileBanner
          form={form}
          editableFields={editableFields}
          uploadingBanner={uploadingBanner}
          setUploadingBanner={setUploadingBanner}
          uploadImage={uploadImage}
        />
      </CardContent>
    </Card>
  );
}