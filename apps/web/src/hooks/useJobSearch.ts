'use client';

import { useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { useJobSearchStore } from '@/stores/jobSearchStore';
import type { JobSearchStoreState } from '@/types/zustandSearch';

export function useJobSearch(debounceMs: number = 500) {
  // --- Select state and actions from the store ---
  const searchTermInput = useJobSearchStore((state: JobSearchStoreState) => state.searchTermInput);
  const locationSearchInput = useJobSearchStore((state: JobSearchStoreState) => state.locationSearchInput);
  const companySearchInput = useJobSearchStore((state: JobSearchStoreState) => state.companySearchInput);

  const setSearchTermInput = useJobSearchStore((state: JobSearchStoreState) => state.setSearchTermInput);
  const setLocationSearchInput = useJobSearchStore((state: JobSearchStoreState) => state.setLocationSearchInput);
  const setCompanySearchInput = useJobSearchStore((state: JobSearchStoreState) => state.setCompanySearchInput);
  const applyDebouncedSearch = useJobSearchStore((state: JobSearchStoreState) => state.applyDebouncedSearch);

  // Debounce the input values
  const [debouncedSearchTerm] = useDebounce(searchTermInput, debounceMs);
  const [debouncedLocation] = useDebounce(locationSearchInput, debounceMs);
  const [debouncedCompany] = useDebounce(companySearchInput, debounceMs);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // When a debounced value changes, call the action in the store.
    applyDebouncedSearch();
  }, [debouncedSearchTerm, debouncedLocation, debouncedCompany, applyDebouncedSearch]);

  // Return everything needed to create controlled input components
  return {
    searchTermInput,
    locationSearchInput,
    companySearchInput,
    setSearchTermInput,
    setLocationSearchInput,
    setCompanySearchInput,
  };
}