import { useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  GraduationCap,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Control, UseFormRegister } from 'react-hook-form';
import { ExtendedGenerateCvPayload } from './GenerateCVModalForm';

interface GenerateCVModalEducationHistoryProps {
  control: Control<ExtendedGenerateCvPayload>;
  register: UseFormRegister<ExtendedGenerateCvPayload>;
}

export default function GenerateCVModalEducationHistory({ 
  control, 
  register
}: GenerateCVModalEducationHistoryProps) {
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'educationHistoryArray'
  });

  const addEducation = () => {
    if (educationFields.length < 10) {
      appendEducation({ startYear: '', endYear: '', universityName: '', degree: '' });
    }
  };

  const removeEducationField = (index: number) => {
    if (educationFields.length > 1) {
      removeEducation(index);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">
          Education History
          <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
        </Label>
      </div>
      
      <p className="text-sm text-gray-600">
        Add your educational background including degrees, universities, and years of study.
      </p>

      <div className="space-y-3">
        {educationFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-end p-4 border rounded-lg"
          >
            <div>
              <Label htmlFor={`startYear-${index}`} className="text-xs text-gray-600">
                Start Year
              </Label>
              <Input
                id={`startYear-${index}`}
                {...register(`educationHistoryArray.${index}.startYear` as const)}
                placeholder="2020"
                type="number"
                min="1950"
                max={currentYear}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor={`endYear-${index}`} className="text-xs text-gray-600">
                End Year
              </Label>
              <Input
                id={`endYear-${index}`}
                {...register(`educationHistoryArray.${index}.endYear` as const)}
                placeholder="2024"
                type="number"
                min="1950"
                max={currentYear + 10}
                className="mt-1"
              />
            </div>
            
            <div className="lg:col-span-2">
              <Label htmlFor={`universityName-${index}`} className="text-xs text-gray-600">
                University Name
              </Label>
              <Input
                id={`universityName-${index}`}
                {...register(`educationHistoryArray.${index}.universityName` as const)}
                placeholder="University of Example"
                className="mt-1"
              />
            </div>
            
            <div className="lg:col-span-1">
              <Label htmlFor={`degree-${index}`} className="text-xs text-gray-600">
                Degree
              </Label>
              <Input
                id={`degree-${index}`}
                {...register(`educationHistoryArray.${index}.degree` as const)}
                placeholder="Bachelor of Science"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEducation}
                disabled={educationFields.length >= 10}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeEducationField(index)}
                disabled={educationFields.length <= 1}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>Add up to 10 education entries</span>
        <span className={educationFields.length >= 10 ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {educationFields.length}/10 entries
        </span>
      </div>
    </motion.div>
  );
}