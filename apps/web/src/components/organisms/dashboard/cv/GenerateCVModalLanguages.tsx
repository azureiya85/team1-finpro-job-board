import { useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Globe,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ExtendedGenerateCvPayload } from './GenerateCVModalForm';

interface GenerateCVModalLanguagesProps {
  control: Control<ExtendedGenerateCvPayload>;
  register: UseFormRegister<ExtendedGenerateCvPayload>;
  setValue: UseFormSetValue<ExtendedGenerateCvPayload>;
  watch: UseFormWatch<ExtendedGenerateCvPayload>;
}

// Language proficiency levels
const proficiencyLevels = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
  { value: 'professional', label: 'Professional' }
];

export default function GenerateCVModalLanguages({ 
  control, 
  register, 
  setValue,
  watch
}: GenerateCVModalLanguagesProps) {
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'languagesArray'
  });

  const watchedLanguages = watch('languagesArray');

  const addLanguage = () => {
    if (languageFields.length < 10) {
      appendLanguage({ language: '', proficiency: '' });
    }
  };

  const removeLanguageField = (index: number) => {
    if (languageFields.length > 1) {
      removeLanguage(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">
          Languages
          <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
        </Label>
      </div>
      
      <p className="text-sm text-gray-600">
        Add languages you speak and your proficiency level for each.
      </p>

      <div className="space-y-3">
        {languageFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <Label htmlFor={`language-${index}`} className="text-xs text-gray-600">
                Language
              </Label>
              <Input
                id={`language-${index}`}
                {...register(`languagesArray.${index}.language` as const)}
                placeholder="e.g., English, Spanish"
                className="mt-1"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor={`proficiency-${index}`} className="text-xs text-gray-600">
                Proficiency Level
              </Label>
              <Select
                onValueChange={(value) => setValue(`languagesArray.${index}.proficiency`, value)}
                value={watchedLanguages?.[index]?.proficiency || ''}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLanguage}
                disabled={languageFields.length >= 10}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLanguageField(index)}
                disabled={languageFields.length <= 1}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>Add up to 10 languages with proficiency levels</span>
        <span className={languageFields.length >= 10 ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {languageFields.length}/10 languages
        </span>
      </div>
    </motion.div>
  );
}