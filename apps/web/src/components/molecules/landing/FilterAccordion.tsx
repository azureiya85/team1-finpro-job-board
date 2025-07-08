'use client';

import { useJobSearchStore } from '@/stores/jobSearchStore';
import type { DatePostedType } from '@/types/zustandSearch';
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@/types'; 
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterGroup } from '@/components/molecules/landing/FilterGroup';
import { DateRangeFilter } from './FilterDateRange';
import { DEFAULT_OPEN_SECTIONS } from '@/lib/utils';

export function FilterAccordion() {
  const categories = useJobSearchStore((state) => state.categories);
  const employmentTypes = useJobSearchStore((state) => state.employmentTypes);
  const experienceLevels = useJobSearchStore((state) => state.experienceLevels);
  const companySizes = useJobSearchStore((state) => state.companySizes);
  const isRemote = useJobSearchStore((state) => state.isRemote);
  const datePosted = useJobSearchStore((state) => state.datePosted);
  const startDate = useJobSearchStore((state) => state.startDate);
  const endDate = useJobSearchStore((state) => state.endDate);
  const companyLocationInput = useJobSearchStore((state) => state.companyLocationInput);
  const allLocations = useJobSearchStore((state) => state.allLocations);
  const isLocationsLoading = useJobSearchStore((state) => state.isLocationsLoading);

  const updateCategory = useJobSearchStore((state) => state.updateCategory);
  const updateEmploymentType = useJobSearchStore((state) => state.updateEmploymentType);
  const updateExperienceLevel = useJobSearchStore((state) => state.updateExperienceLevel);
  const updateCompanySize = useJobSearchStore((state) => state.updateCompanySize);
  
  const setIsRemote = useJobSearchStore((state) => state.setIsRemote);
  const setDatePosted = useJobSearchStore((state) => state.setDatePosted);
  const setDateRange = useJobSearchStore((state) => state.setDateRange);
  const setCompanyLocationInput = useJobSearchStore((state) => state.setCompanyLocationInput);


  // Event handlers
  const handleDatePostedChange = (value: string) => {
    setDatePosted(value as DatePostedType);
  };

  const handleLocationChange = (value: string) => {
    setCompanyLocationInput(value === "all" ? "" : value);
  };

  const handleRemoteChange = (checked: boolean | 'indeterminate') => {
    setIsRemote(checked === true ? true : undefined);
  };

  const handleOfficeChange = (checked: boolean | 'indeterminate') => {
    setIsRemote(checked === true ? false : undefined);
  };

  return (
    <Accordion type="multiple" defaultValue={DEFAULT_OPEN_SECTIONS} className="w-full cursor-pointer">
      {/* Date Posted Filter */}
      <AccordionItem value="date-posted">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Date Posted
        </AccordionTrigger>
        <AccordionContent>
          <RadioGroup
            value={datePosted}
            onValueChange={handleDatePostedChange}
            className="space-y-2 py-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="date-all" />
              <Label htmlFor="date-all" className="font-normal text-sm text-foreground/80 cursor-pointer">All Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="last7days" id="date-7days" />
              <Label htmlFor="date-7days" className="font-normal text-sm text-foreground/80 cursor-pointer">Last 7 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lastmonth" id="date-month" />
              <Label htmlFor="date-month" className="font-normal text-sm text-foreground/80 cursor-pointer">Last Month</Label>
            </div>
          </RadioGroup>
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={setDateRange}
          />
        </AccordionContent>
      </AccordionItem>

   {/* Job Category Filter */}
      <AccordionItem value="job-category">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Job Category
        </AccordionTrigger>
        <AccordionContent>
          <FilterGroup
            title="Job Category"
            items={JobCategory}
            selectedItems={categories}
            onItemToggle={updateCategory}
          />
        </AccordionContent>
      </AccordionItem>
      
      {/* Employment Type Filter */}
      <AccordionItem value="employment-type">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Employment Type
        </AccordionTrigger>
        <AccordionContent>
          <FilterGroup
            title="Employment Type"
            items={EmploymentType}
            selectedItems={employmentTypes}
            onItemToggle={updateEmploymentType}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Experience Level Filter */}
      <AccordionItem value="experience-level">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Experience Level
        </AccordionTrigger>
        <AccordionContent>
          <FilterGroup
            title="Experience Level"
            items={ExperienceLevel}
            selectedItems={experienceLevels}
            onItemToggle={updateExperienceLevel}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Company Location Filter */}
       <AccordionItem value="company-location">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Company Location
        </AccordionTrigger>
        <AccordionContent>
          <div className="py-2">
            <Select value={companyLocationInput} onValueChange={handleLocationChange} disabled={isLocationsLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLocationsLoading ? "Loading..." : "Select a location"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {allLocations.map((province) => (
                  <SelectGroup key={province.id}>
                    <SelectLabel>{province.name}</SelectLabel>
                    <SelectItem value={province.name}>{province.name} (All)</SelectItem> 
                    {province.cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

       {/* Company Size Filter */}
      <AccordionItem value="company-size">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Company Size
        </AccordionTrigger>
        <AccordionContent>
          <FilterGroup
            title="Company Size"
            items={CompanySize}
            selectedItems={companySizes}
            onItemToggle={updateCompanySize}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Work Arrangement Filter */}
        <AccordionItem value="work-arrangement">
        <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
          Work Arrangement
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 py-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isRemoteFilter" checked={isRemote === true} onCheckedChange={handleRemoteChange} />
              <Label htmlFor="isRemoteFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                Remote Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isOfficeFilter" checked={isRemote === false} onCheckedChange={handleOfficeChange} />
              <Label htmlFor="isOfficeFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                Office-Based / On-Site
              </Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}