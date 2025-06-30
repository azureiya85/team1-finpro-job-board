import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Plus,Tag} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ExtendedGenerateCvPayload } from './GenerateCVModalForm';

interface GenerateCVModalSkillsProps {
  watch: UseFormWatch<ExtendedGenerateCvPayload>;
  setValue: UseFormSetValue<ExtendedGenerateCvPayload>;
}

export default function GenerateCVModalSkills({ 
  watch, 
  setValue 
}: GenerateCVModalSkillsProps) {
  const [skillInput, setSkillInput] = useState('');
  const customSkillsArray = watch('customSkillsArray') || [];

  // Handle adding skills with badges
  const handleSkillInput = (value: string) => {
    if (customSkillsArray.length >= 20) return;
    
    const trimmedValue = value.trim();
    if (trimmedValue && !customSkillsArray.includes(trimmedValue)) {
      const newSkills = [...customSkillsArray, trimmedValue];
      setValue('customSkillsArray', newSkills);
      setSkillInput('');
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleSkillInput(skillInput);
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = customSkillsArray.filter((_, i) => i !== index);
    setValue('customSkillsArray', newSkills);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">
          Additional Skills
          <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
        </Label>
      </div>
      
      <p className="text-sm text-gray-600">
        Add skills not covered in your assessments. Each skill will appear as a separate badge.
      </p>
      
      <div className="border rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200 bg-background">
        <div className="p-3 min-h-[120px] relative">
          <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-wrap gap-2 mb-2 pl-10">
            {customSkillsArray.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder={customSkillsArray.length === 0 ? "Type a skill and press Enter or comma..." : "Add another skill..."}
            className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto pl-10 bg-transparent"
            disabled={customSkillsArray.length >= 20}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Plus size={12} />
            Press Enter or comma (,) to add
          </span>
          <span className="flex items-center gap-1">
            <X size={12} />
            Click X to remove
          </span>
        </div>
        <span className={customSkillsArray.length >= 20 ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {customSkillsArray.length}/20 skills
        </span>
      </div>
    </motion.div>
  );
}