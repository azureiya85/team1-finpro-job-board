'use client';

import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useCompanySearchStore } from '@/stores/companySearchStore';

export function useDebouncedCompanySearch(debounceMs: number = 500) {
  const searchInput = useCompanySearchStore((state) => state.searchInput);

  const fetchCompanies = useCompanySearchStore((state) => state.fetchCompanies);
  const setSearchInput = useCompanySearchStore((state) => state.setSearchInput);

  // Debounce the search input
  const [debouncedSearchInput] = useDebounce(searchInput, debounceMs);

  useEffect(() => {
    fetchCompanies();
  }, [debouncedSearchInput, fetchCompanies]);

  return {
    setSearchInput,
  };
}