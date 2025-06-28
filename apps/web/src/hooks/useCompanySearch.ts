'use client';

import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useCompanySearchStore } from '@/stores/companySearchStore';

export function useDebouncedCompanySearch(debounceMs: number = 500) {
  const searchInput = useCompanySearchStore((state) => state.searchInput);
  const locationInput = useCompanySearchStore((state) => state.locationInput);

  const fetchCompanies = useCompanySearchStore((state) => state.fetchCompanies);
  const setSearchInput = useCompanySearchStore((state) => state.setSearchInput);
  const setLocationInput = useCompanySearchStore((state) => state.setLocationInput);

  // Debounce the text inputs
  const [debouncedSearchInput] = useDebounce(searchInput, debounceMs);
  const [debouncedLocationInput] = useDebounce(locationInput, debounceMs);

  useEffect(() => {
    fetchCompanies();
  }, [debouncedSearchInput, debouncedLocationInput, fetchCompanies]);

  return {
    setSearchInput,
    setLocationInput,
  };
}