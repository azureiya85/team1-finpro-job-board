'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Star, Tag, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { FormData } from '@/types';

interface CreateJobFormBadgeInputProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function CreateJobFormBadgeInput({ formData, setFormData }: CreateJobFormBadgeInputProps) {
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleArrayInput = (
    value: string,
    setValue: (value: string) => void,
    array: string[],
    fieldName: 'requirements' | 'benefits' | 'tags',
    maxItems = 20
  ) => {
    if (array.length >= maxItems) return;
    
    const trimmedValue = value.trim();
    if (trimmedValue && !array.includes(trimmedValue)) {
      const newArray = [...array, trimmedValue];
      setFormData(prev => ({
        ...prev,
        [fieldName]: newArray
      }));
      setValue('');
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    inputValue: string,
    setInputValue: (value: string) => void,
    array: string[],
    fieldName: 'requirements' | 'benefits' | 'tags',
    maxItems = 20
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleArrayInput(inputValue, setInputValue, array, fieldName, maxItems);
    }
  };

  const removeArrayItem = (index: number, fieldName: 'requirements' | 'benefits' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const getBadgeColor = (fieldName: 'requirements' | 'benefits' | 'tags') => {
    switch (fieldName) {
      case 'requirements':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'benefits':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'tags':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getIcon = (fieldName: 'requirements' | 'benefits' | 'tags') => {
    switch (fieldName) {
      case 'requirements':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case 'benefits':
        return <Star className="h-4 w-4 text-muted-foreground" />;
      case 'tags':
        return <Tag className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const badgeInputSections = [
    {
      fieldName: 'requirements' as const,
      label: 'Requirements',
      required: true,
      placeholder: 'Type a requirement and press Enter or comma...',
      value: requirementInput,
      setValue: setRequirementInput,
      array: formData.requirements,
      description: 'Add specific skills, qualifications, or experience needed for this position'
    },
    {
      fieldName: 'benefits' as const,
      label: 'Benefits',
      required: false,
      placeholder: 'Type a benefit and press Enter or comma...',
      value: benefitInput,
      setValue: setBenefitInput,
      array: formData.benefits,
      description: 'Add perks, benefits, or advantages of working in this position'
    },
    {
      fieldName: 'tags' as const,
      label: 'Tags',
      required: false,
      placeholder: 'Type a tag and press Enter or comma...',
      value: tagInput,
      setValue: setTagInput,
      array: formData.tags,
      description: 'Add relevant keywords or technologies for better job discovery'
    }
  ];

  return (
    <div className="space-y-6">
      {badgeInputSections.map((section, sectionIndex) => (
        <motion.div
          key={section.fieldName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            {getIcon(section.fieldName)}
            <Label className="text-sm font-medium">
              {section.label} {section.required && '*'}
            </Label>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {section.description}
          </p>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            </div>
            <div className="border rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200 bg-background">
              <div className="p-3 min-h-[100px]">
                <div className="flex flex-wrap gap-2 mb-2">
                  {section.array.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className={`${getBadgeColor(section.fieldName)} transition-colors duration-200`}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, section.fieldName)}
                          className="ml-2 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                
                <Input
                  value={section.value}
                  onChange={(e) => section.setValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(
                    e, 
                    section.value, 
                    section.setValue, 
                    section.array, 
                    section.fieldName, 
                    20
                  )}
                  placeholder={section.array.length === 0 ? section.placeholder : `Add another ${section.label.toLowerCase()}...`}
                  className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-0 h-auto p-0 bg-transparent"
                  disabled={section.array.length >= 20}
                />
              </div>
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
            <span className={section.array.length >= 20 ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {section.array.length}/20 {section.label.toLowerCase()}
            </span>
          </div>
          
          {section.required && section.array.length === 0 && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <X size={14} />
              At least one {section.label.toLowerCase().slice(0, -1)} is required
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}