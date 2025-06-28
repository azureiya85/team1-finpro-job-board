'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, RotateCw } from 'lucide-react';
import { useCompanySearchStore, SortByType } from '@/stores/companySearchStore';
import { useDebouncedCompanySearch } from '@/hooks/useCompanySearch';


export function CompanyFilters() {
  const searchInput = useCompanySearchStore((state) => state.searchInput);
  const locationInput = useCompanySearchStore((state) => state.locationInput);
  const sortBy = useCompanySearchStore((state) => state.sortBy);
  
  const setSortBy = useCompanySearchStore((state) => state.setSortBy);
  const resetFilters = useCompanySearchStore((state) => state.resetFilters);

  const { setSearchInput, setLocationInput } = useDebouncedCompanySearch();

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filter Companies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Company name..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location..."
            className="pl-9"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih urutan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="w-full" onClick={resetFilters}>
            <RotateCw className="mr-2 h-4 w-4" />
            Reset Filter
        </Button>
      </CardContent>
    </Card>
  );
}