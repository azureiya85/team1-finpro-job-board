'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJobSearchStore } from '@/stores/jobSearchStore';
import type { JobSearchStoreState } from '@/types/zustandSearch'; 
import { useDebouncedJobSearchActions } from '@/hooks/useJobSearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, MapPin, Building2 } from 'lucide-react';

const searchFormSchema = z.object({
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function SearchJobSection() {
const storeSearchTerm = useJobSearchStore((state) => state.searchTermInput);
const storeLocationSearch = useJobSearchStore((state) => state.locationSearchInput);;
  const storeCompanySearch = useJobSearchStore((state: JobSearchStoreState) => state.companySearchInput);

  const {
    setSearchTermInput: debouncedSetSearchTerm,
    setLocationSearchInput: debouncedSetLocationSearch,
    setCompanySearchInput: debouncedSetCompanySearch,
  } = useDebouncedJobSearchActions();

const fetchJobs = useJobSearchStore((state) => state.fetchJobs);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      jobTitle: storeSearchTerm || '',
      location: storeLocationSearch || '',
      company: storeCompanySearch || '',
    },
  });

  useEffect(() => {
    form.setValue('jobTitle', storeSearchTerm || '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [storeSearchTerm, form]); 

  useEffect(() => {
    form.setValue('location', storeLocationSearch || '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [storeLocationSearch, form]);

  useEffect(() => {
    form.setValue('company', storeCompanySearch || '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [storeCompanySearch, form]);

  const jobTitleValue = form.watch('jobTitle');
  const locationValue = form.watch('location');
  const companyValue = form.watch('company');

  useEffect(() => {
    debouncedSetSearchTerm(jobTitleValue === undefined ? '' : jobTitleValue);
  }, [jobTitleValue, debouncedSetSearchTerm]);

  useEffect(() => {
    debouncedSetLocationSearch(locationValue === undefined ? '' : locationValue);
  }, [locationValue, debouncedSetLocationSearch]);

  useEffect(() => {
    debouncedSetCompanySearch(companyValue === undefined ? '' : companyValue);
  }, [companyValue, debouncedSetCompanySearch]);

  const onSubmit = (values: SearchFormValues) => {
    console.log("Form submitted, triggering explicit fetch with current store state:", values);
    fetchJobs();
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold font-heading text-foreground mb-4">Search Jobs</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">By Job Title</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">By Location</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Jakarta, Remote" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">By Company</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Google, Microsoft" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}