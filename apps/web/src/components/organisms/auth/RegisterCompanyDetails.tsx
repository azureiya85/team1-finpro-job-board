'use client';

import { motion } from 'framer-motion';
import { Controller, UseFormReturn } from 'react-hook-form';
import { CompanyRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import {
  Mail,
  Building2,
  Globe,
  Briefcase,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { categoryLabels } from '@/lib/jobConstants'; 

interface RegisterCompanyDetailsProps {
  form: UseFormReturn<CompanyRegisterFormData>;
  isPending: boolean;
}

export default function RegisterCompanyDetails({ form, isPending }: RegisterCompanyDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Building2 className="h-4 w-4" />
        Company Information
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Company Name */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Label htmlFor="companyName">Company Name *</Label>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="companyName" 
              placeholder="PT. Your Company Name" 
              {...form.register('companyName')} 
              className="pl-10 h-11"
              disabled={isPending}
            />
          </div>
          {form.formState.errors.companyName && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </motion.div>

        {/* Company Email and Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Label htmlFor="companyEmail">Company Email *</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="companyEmail" 
                type="email" 
                placeholder="contact@company.com" 
                {...form.register('companyEmail')} 
                className="pl-10 h-11"
                disabled={isPending}
              />
            </div>
            {form.formState.errors.companyEmail && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.companyEmail.message}
              </p>
            )}
          </motion.div>

          {/* Industry Dropdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Label htmlFor="industry">Industry *</Label>
            <Controller
              control={form.control}
              name="industry"
              render={({ field }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={isPending}>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between pl-3 pr-3 h-11 mt-1 font-normal"
                    >
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        {field.value
                          ? categoryLabels[field.value as keyof typeof categoryLabels]
                          : "Select Industry"}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
                    <DropdownMenuLabel>Select an Industry</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        onSelect={() => {
                          field.onChange(key); 
                        }}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
            {form.formState.errors.industry && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.industry.message}
              </p>
            )}
          </motion.div>
        </div>

        {/* Website and Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Label htmlFor="website">Website</Label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="website" 
                placeholder="https://www.yourcompany.com" 
                {...form.register('website')} 
                className="pl-10 h-11"
                disabled={isPending}
              />
            </div>
            {form.formState.errors.website && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.website.message}
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Label htmlFor="phone">Company Phone</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="phone" 
                placeholder="+62 123 4567 8900" 
                {...form.register('phone')} 
                className="pl-10 h-11"
                disabled={isPending}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}