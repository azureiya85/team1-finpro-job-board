'use client';

import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, RotateCw } from 'lucide-react';
import { useCompanySearchStore, SortByType } from '@/stores/companySearchStore';
import { useDebouncedCompanySearch } from '@/hooks/useCompanySearch';
import { useLocationData } from '@/hooks/useLocationData';

export function CompanyFilters() {
  const searchInput = useCompanySearchStore((state) => state.searchInput);
  const selectedProvinceId = useCompanySearchStore((state) => state.selectedProvinceId);
  const selectedCityId = useCompanySearchStore((state) => state.selectedCityId);
  const sortBy = useCompanySearchStore((state) => state.sortBy);
  
  const setSortBy = useCompanySearchStore((state) => state.setSortBy);
  const setSelectedProvinceId = useCompanySearchStore((state) => state.setSelectedProvinceId);
  const setSelectedCityId = useCompanySearchStore((state) => state.setSelectedCityId);
  const resetFilters = useCompanySearchStore((state) => state.resetFilters);

  const { setSearchInput } = useDebouncedCompanySearch();
  const { provinces, cities, isLoadingProvinces } = useLocationData(selectedProvinceId);

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByType);
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId === 'all' ? '' : provinceId);
    // Reset city selection when province changes
    setSelectedCityId('');
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId === 'all' ? '' : cityId);
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-6 sticky top-24">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground mb-2">Filter & Sort</h2>
        <p className="text-sm text-muted-foreground">Find companies that match your criteria</p>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Search Companies</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Company name..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Location Dropdown Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground mb-2 block">Location</Label>
          
          {/* Province Dropdown */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Province</Label>
            <Select value={selectedProvinceId || 'all'} onValueChange={handleProvinceChange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select province..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {isLoadingProvinces ? (
                  <SelectItem value="loading" disabled>Loading provinces...</SelectItem>
                ) : (
                  provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* City Dropdown - only show if province is selected */}
          {selectedProvinceId && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">City/Regency</Label>
              <Select value={selectedCityId || 'all'} onValueChange={handleCityChange}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select city..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} ({city.type === 'CITY' ? 'City' : 'Regency'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Sort By Section */}
      <div>
        <h3 className="text-lg font-semibold font-heading text-primary mb-3">Sort By</h3>
        <RadioGroup
          value={sortBy}
          onValueChange={handleSortChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest" className="font-normal cursor-pointer text-sm text-foreground/80">
              Newest Companies
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="sort-oldest" />
            <Label htmlFor="sort-oldest" className="font-normal cursor-pointer text-sm text-foreground/80">
              Oldest Companies
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="name_asc" id="sort-name-asc" />
            <Label htmlFor="sort-name-asc" className="font-normal cursor-pointer text-sm text-foreground/80">
              Company Name (A-Z)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="name_desc" id="sort-name-desc" />
            <Label htmlFor="sort-name-desc" className="font-normal cursor-pointer text-sm text-foreground/80">
              Company Name (Z-A)
            </Label>
          </div>
        </RadioGroup>
      </div>
        
      {/* Reset Button */}
      <Button variant="outline" className="w-full" onClick={resetFilters}>
        <RotateCw className="mr-2 h-4 w-4" />
        Reset Filters
      </Button>
    </div>
  );
}