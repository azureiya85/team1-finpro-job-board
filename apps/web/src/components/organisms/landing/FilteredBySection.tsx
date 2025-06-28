'use client';

import { useEffect } from 'react';
import {
  useJobSearchStore,
  JobSearchState,
  JobSearchActions,
  SortByType,
} from '@/stores/jobSearchStore';

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { FilterAccordion } from '@/components/molecules/landing/FilterAccordion';

export function FilteredBySection() {
  // State extraction
  const {
    sortBy,
    allLocations,
  } = useJobSearchStore((state: JobSearchState) => state);
  
  // Actions extraction
  const {
    setSortBy,
    fetchLocations,
  } = useJobSearchStore((state: JobSearchActions) => state);

  // Initialize locations on mount
  useEffect(() => {
    if (allLocations.length === 0) {
      fetchLocations();
    }
  }, [fetchLocations, allLocations.length]);

  // Event handlers
  const handleSortChange = (value: string) => {
    setSortBy(value as SortByType);
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-6"> 
      {/* Sort By Section */}
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
           <div className="flex items-center space-x-2">
            <RadioGroupItem value="company_asc" id="sort-company-asc" />
            <Label htmlFor="sort-company-asc" className="font-normal cursor-pointer">Company Name (A-Z)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company_desc" id="sort-company-desc" />
            <Label htmlFor="sort-company-desc" className="font-normal cursor-pointer">Company Name (Z-A)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Filter By Section */}
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground mb-2">Filter By</h2>
        <FilterAccordion />
      </div>
    </div>
  );
}