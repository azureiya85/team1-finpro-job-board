import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Filter, User } from 'lucide-react';
import { useSubscriptionManagementStore } from '@/stores/subscriptionMgtStores';
import SubscriptionTable from '@/components/molecules/dashboard/Subscription/SubscriptionListTable'; 

const SubscriptionManagementList: React.FC = () => {
  const {
    subscriptions,
    loading,
    error,
    pagination,
    filters: storeFilters, // Access filters from the store
    fetchSubscriptions,
    setSubscriptionFilters,
    clearError,
  } = useSubscriptionManagementStore();

  // Initialize local filter state from store or defaults
  const [searchTerm, setSearchTerm] = useState(storeFilters.search || '');
  const [statusFilter, setStatusFilter] = useState(storeFilters.status || 'all');

  // Sync local state if store filters change 
  useEffect(() => {
    setSearchTerm(storeFilters.search || '');
    setStatusFilter(storeFilters.status || 'all');
  }, [storeFilters]);

  const loadSubscriptions = useCallback((page?: number) => {
    const currentFilters: Record<string, string> = {};
    if (searchTerm.trim()) {
        currentFilters.search = searchTerm.trim();
    }
    if (statusFilter && statusFilter !== 'all') {
        currentFilters.status = statusFilter;
    }
    // If page is not provided, use current page from pagination or default to 1
    fetchSubscriptions(page || pagination.page || 1, currentFilters);
  }, [searchTerm, statusFilter, fetchSubscriptions, pagination.page]);


  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]); // loadSubscriptions is memoized

  const handleSearch = () => {
    const newFilters: Record<string, string> = {};
    if (searchTerm.trim()) {
        newFilters.search = searchTerm.trim();
    }
    if (statusFilter && statusFilter !== 'all') {
        newFilters.status = statusFilter;
    }
    setSubscriptionFilters(newFilters); // Trigger fetch via store's setSubscriptionFilters
  };

  const handlePageChange = (newPage: number) => {
    // Fetch specific page with current filters
    loadSubscriptions(newPage);
  };
  
  const handleRetryFetch = () => {
    clearError();
    loadSubscriptions(); // Retry with current filters and page
  };


  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading subscriptions: {error}</p>
            <Button onClick={handleRetryFetch} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <User className="w-5 h-5 mr-2" />
          Subscription List
        </CardTitle>
        <CardDescription>
          View and manage all user subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search user email, name, or plan name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
              {loading && pagination.page === 1 ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </div>

        {/* Table Area */}
        {loading && subscriptions.length === 0 && pagination.page === 1 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading subscriptions...</span>
          </div>
        ) : (
          <>
            <SubscriptionTable subscriptions={subscriptions} />

            {/* Pagination */}
            {subscriptions.length > 0 && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total subscriptions)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementList;