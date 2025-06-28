'use client';

import { useEffect } from 'react';
import { useCompanySearchStore } from '@/stores/companySearchStore';
import { CompanyCard } from '@/components/molecules/companies/CompanyCard';
import { CompanyFilters } from '@/components/organisms/companies/CompanyFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

function CompanyCardSkeleton() {
  return (
    <div className="flex items-start space-x-6 rounded-lg border bg-card p-6 shadow-sm">
      <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-4 w-[250px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-6">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
    </div>
  );
}

export default function AllCompaniesPage() {
  const {
    companies,
    isLoading,
    error,
    pagination,
    currentPage,
    fetchCompanies,
    setCurrentPage,
  } = useCompanySearchStore();

  // Initial fetch on component mount
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderContent = () => {
    if (isLoading && companies.length === 0) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-lg font-semibold">There is an error while fetching company data.</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      );
    }

    if (companies.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border">
          <p className="text-lg font-semibold">No company found.</p>
          <p className="text-sm mt-2">Try other search terms.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    );
  };

  return (
    <main className="container mx-auto py-24 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading tracking-tight text-foreground">All Companies</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Discover companies registered on our platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <aside className="lg:col-span-1">
          <CompanyFilters />
        </aside>

        {/* Right Column: Company List & Pagination */}
        <div className="lg:col-span-3">
          <div className="space-y-8">
            {renderContent()}
            
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button variant="outline" onClick={handlePrevPage} disabled={!pagination.hasPrev}>
                        <PaginationPrevious className="mr-2" />
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem className="hidden sm:flex items-center text-sm font-medium px-4">
                      Page {pagination.page} of {pagination.totalPages}
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="outline" onClick={handleNextPage} disabled={!pagination.hasNext}>
                        Next
                        <PaginationNext className="ml-2" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}