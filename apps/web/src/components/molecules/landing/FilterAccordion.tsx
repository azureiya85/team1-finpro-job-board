'use client';

import {
  useJobSearchStore,
  JobSearchState,
  JobSearchActions,
  DatePostedType,
} from '@/stores/jobSearchStore';
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FilterGroup } from '@/components/molecules/landing/FilterGroup';
import { DateRangeFilter } from './FilterDateRange';
import { DEFAULT_OPEN_SECTIONS } from '@/lib/utils';

export function FilterAccordion() {
  // State extraction
  const {
    categories = [], 
    employmentTypes = [], 
    experienceLevels = [], 
    companySizes = [],
    isRemote, 
    datePosted, 
    startDate, 
    endDate,
    companyLocationInput,
    allLocations,
    isLocationsLoading,
  } = useJobSearchStore((state: JobSearchState) => state);
  
  // Actions extraction
  const {
    setCategories, 
    setEmploymentTypes, 
    setExperienceLevels, 
    setCompanySizes,
    setIsRemote, 
    setDatePosted, 
    setDateRange,
    setCompanyLocationInput,
  } = useJobSearchStore((state: JobSearchActions) => state);

  // Event handlers
  const handleDatePostedChange = (value: string) => {
    setDatePosted(value as DatePostedType);
  };

  const handleLocationChange = (value: string) => {
    setCompanyLocationInput(value === "all" ? "" : value);
  };

  const handleRemoteFilterChange = (checked: boolean | 'indeterminate', isRemoteValue: boolean) => {
    setIsRemote(checked === true ? isRemoteValue : undefined);
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
            onChange={setCategories}
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
            onChange={setEmploymentTypes}
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
            onChange={setExperienceLevels}
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
            <Select
              value={companyLocationInput}
              onValueChange={handleLocationChange}
              disabled={isLocationsLoading}
            >
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
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
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
            onChange={setCompanySizes}
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
              <Checkbox
                id="isRemoteFilter"
                checked={isRemote === true}
                onCheckedChange={(checked) => handleRemoteFilterChange(checked, true)}
              />
              <Label htmlFor="isRemoteFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                Remote Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOfficeFilter"
                checked={isRemote === false}
                onCheckedChange={(checked) => handleRemoteFilterChange(checked, false)}
              />
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