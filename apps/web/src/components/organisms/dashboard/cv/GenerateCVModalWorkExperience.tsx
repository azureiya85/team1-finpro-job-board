import { useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Briefcase,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Control, UseFormRegister } from 'react-hook-form';
import { ExtendedGenerateCvPayload } from './GenerateCVModalForm';

interface GenerateCVModalWorkExperienceProps {
  control: Control<ExtendedGenerateCvPayload>;
  register: UseFormRegister<ExtendedGenerateCvPayload>;
}

export default function GenerateCVModalWorkExperience({ 
  control, 
  register
}: GenerateCVModalWorkExperienceProps) {
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'customWorkExperiencesArray'
  });

  const addExperience = () => {
    if (experienceFields.length < 10) {
      appendExperience({ startYear: '', endYear: '', companyName: '', jobTitle: '' });
    }
  };

  const removeExperienceField = (index: number) => {
    if (experienceFields.length > 1) {
      removeExperience(index);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">
          Custom Work Experience
          <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
        </Label>
      </div>
      
      <p className="text-sm text-gray-600">
        Add any work experience not recorded on this platform. This will appear on your generated CV.
      </p>

      <div className="space-y-3">
        {experienceFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-end p-4 border rounded-lg"
          >
            <div>
              <Label htmlFor={`exp-startYear-${index}`} className="text-xs text-gray-600">
                Start Year
              </Label>
              <Input
                id={`exp-startYear-${index}`}
                {...register(`customWorkExperiencesArray.${index}.startYear` as const)}
                placeholder="2018"
                type="number"
                min="1950"
                max={currentYear}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor={`exp-endYear-${index}`} className="text-xs text-gray-600">
                End Year
              </Label>
              <Input
                id={`exp-endYear-${index}`}
                {...register(`customWorkExperiencesArray.${index}.endYear` as const)}
                placeholder="2022"
                type="number"
                min="1950"
                max={currentYear + 10}
                className="mt-1"
              />
            </div>
            
            <div className="lg:col-span-2">
              <Label htmlFor={`exp-companyName-${index}`} className="text-xs text-gray-600">
                Company Name
              </Label>
              <Input
                id={`exp-companyName-${index}`}
                {...register(`customWorkExperiencesArray.${index}.companyName` as const)}
                placeholder="Acme Corporation"
                className="mt-1"
              />
            </div>
            
            <div className="lg:col-span-1">
              <Label htmlFor={`exp-jobTitle-${index}`} className="text-xs text-gray-600">
                Job Title
              </Label>
              <Input
                id={`exp-jobTitle-${index}`}
                {...register(`customWorkExperiencesArray.${index}.jobTitle` as const)}
                placeholder="Software Engineer"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExperience}
                disabled={experienceFields.length >= 10}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeExperienceField(index)}
                disabled={experienceFields.length <= 1}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>Add up to 10 work experiences</span>
        <span className={experienceFields.length >= 10 ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {experienceFields.length}/10 entries
        </span>
      </div>
    </motion.div>
  );
}