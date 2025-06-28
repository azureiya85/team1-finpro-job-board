'use client';

import { useCallback } from 'react';
import {
  useJobSearchStore,
  JobSearchState,
  JobSearchActions,
  SortByType,
  DatePostedType,
} from '@/stores/jobSearchStore';
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


const formatEnumKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

interface FilterGroupProps<T extends string> {
  title: string;
  items: Record<string, T>;
  selectedItems: T[];
  onChange: (selected: T[]) => void;
}

function FilterGroupContent<T extends string>({ items, selectedItems, onChange, title }: FilterGroupProps<T>) {
  const handleCheckboxChange = useCallback((itemValue: T, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      if (!selectedItems.includes(itemValue)) {
        onChange([...selectedItems, itemValue]);
      }
    } else {
      onChange(selectedItems.filter(val => val !== itemValue));
    }
  }, [selectedItems, onChange]);

  return (
    <ScrollArea className="h-auto max-h-60 pr-3"> 
      <div className="space-y-2 py-2">
        {Object.values(items).map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.replace(/\s+/g, '-')}-${value}`}
              checked={selectedItems.includes(value)}
              onCheckedChange={(checked) => handleCheckboxChange(value, checked)}
            />
            <Label
              htmlFor={`${title.replace(/\s+/g, '-')}-${value}`}
              className="font-normal text-sm text-foreground/80 cursor-pointer"
            >
              {formatEnumKey(value)}
            </Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}


export function FilteredBySection() {
  const state = useJobSearchStore((state: JobSearchState) => state);
  const actions = useJobSearchStore((state: JobSearchActions) => state);

  // Destructure for easier access
  const {
    categories = [], employmentTypes = [], experienceLevels = [], companySizes = [],
    isRemote, sortBy, datePosted, startDate, endDate
  } = state;
  const {
    setCategories, setEmploymentTypes, setExperienceLevels, setCompanySizes,
    setIsRemote, setSortBy, setDatePosted, setDateRange
  } = actions;

  const defaultOpen = ["job-category", "employment-type", "date-posted"];

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByType);
    // Note: To make this work smoothly, you might want to trigger fetchJobs
    // after a change. A simple way is to call it here, or better,
    // add a "Apply Filters" button or use a useEffect with debounce.
    // For simplicity, let's assume the store handles fetching.
  };
  
  const handleDatePostedChange = (value: string) => {
    setDatePosted(value as DatePostedType);
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-6"> 
      {/* --- Sort By Section --- */}
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground mb-3">Sort By</h2>
        <RadioGroup
          defaultValue="newest"
          value={sortBy}
          onValueChange={handleSortChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest" className="font-normal cursor-pointer">Newest Postings</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="sort-oldest" />
            <Label htmlFor="sort-oldest" className="font-normal cursor-pointer">Oldest Postings</Label>
          </div>
        </RadioGroup>
      </div>

      {/* --- Filter By Section --- */}
      <h2 className="text-xl font-bold font-heading text-foreground mb-2">Filter By</h2>

      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full cursor-pointer">
        {/* --- New Date Posted Filter --- */}
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
            <div className="mt-4 pt-4 border-t space-y-2">
              <Label className="text-sm font-medium">Custom Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => setDateRange(date, endDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>End date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setDateRange(startDate, date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-category">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Job Category
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Job Category"
              items={JobCategory}
              selectedItems={categories}
              onChange={setCategories}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="employment-type">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Employment Type
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Employment Type"
              items={EmploymentType}
              selectedItems={employmentTypes}
              onChange={setEmploymentTypes}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience-level">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Experience Level
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Experience Level"
              items={ExperienceLevel}
              selectedItems={experienceLevels}
              onChange={setExperienceLevels}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="company-size">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Company Size
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Company Size"
              items={CompanySize}
              selectedItems={companySizes}
              onChange={setCompanySizes}
            />
          </AccordionContent>
        </AccordionItem>

        <Accordion type="single" collapsible defaultValue="work-arrangement" className="w-full">
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
                                onCheckedChange={(checked) => setIsRemote(checked === true ? true : undefined)}
                            />
                            <Label htmlFor="isRemoteFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                                Remote Only
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isOfficeFilter"
                                checked={isRemote === false}
                                onCheckedChange={(checked) => setIsRemote(checked === true ? false : undefined)}
                            />
                            <Label htmlFor="isOfficeFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                                Office-Based / On-Site
                            </Label>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </Accordion>
    </div>
  );
}