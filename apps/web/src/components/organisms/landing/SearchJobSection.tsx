'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useJobSearchStore } from '@/stores/jobSearchStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, MapPin, Building2 } from 'lucide-react';
import { useEffect } from 'react';

const searchFormSchema = z.object({
  jobTitle: z.string(),
  location: z.string(),
  company: z.string(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function SearchJobSection() {
  const {
    searchTermInput,
    locationSearchInput,
    companySearchInput,
    setSearchTermInput,
    setLocationSearchInput,
    setCompanySearchInput,
  } = useJobSearch();
  
  // Get the explicit search trigger for the "Search" button
  const applyDebouncedSearch = useJobSearchStore((state) => state.applyDebouncedSearch);

  // Initialize react-hook-form, using the store's state as the default values.
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      jobTitle: searchTermInput,
      location: locationSearchInput,
      company: companySearchInput,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setSearchTermInput(values.jobTitle || '');
      setLocationSearchInput(values.location || '');
      setCompanySearchInput(values.company || '');
    });
    return () => subscription.unsubscribe();
  }, [form, setSearchTermInput, setLocationSearchInput, setCompanySearchInput]);
  
  const onSubmit = () => {
    applyDebouncedSearch();
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