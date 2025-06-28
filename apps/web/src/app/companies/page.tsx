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
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-[250px]" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="border-t pt-3 flex justify-between">
        <Skeleton className="h-5 w-[100px]" />
        <Skeleton className="h-5 w-[100px]" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-md">
          <p>There is an error while fetching company data.</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (companies.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground bg-muted/50 rounded-md">
          <p>No company found.</p>
          <p className="text-sm">Try other search terms.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    );
  };

  return (
    <main className="container mx-auto py-24 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight">All Companies</h1>
        <p className="text-muted-foreground mt-2">
         Show all companies registered in this website
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <aside className="lg:col-span-1">
          <CompanyFilters />
        </aside>

        {/* Right Column: Company List & Pagination */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {renderContent()}
            
            {pagination.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button variant="outline" onClick={handlePrevPage} disabled={!pagination.hasPrev}>
                      <PaginationPrevious className="mr-2" />
                      Prev
                    </Button>
                  </PaginationItem>
                  <PaginationItem className="hidden sm:flex items-center text-sm font-medium">
                    Page {pagination.page} from {pagination.totalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <Button variant="outline" onClick={handleNextPage} disabled={!pagination.hasNext}>
                      Next
                      <PaginationNext className="ml-2" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}