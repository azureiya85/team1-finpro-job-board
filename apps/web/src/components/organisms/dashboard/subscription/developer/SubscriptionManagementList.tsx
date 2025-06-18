import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Calendar, User, CreditCard } from 'lucide-react';
import { useSubscriptionManagementStore, type Subscription } from '@/stores/subscriptionMgtStores';
import { formatDistanceToNow, format } from 'date-fns';

const SubscriptionManagementList: React.FC = () => {
  const {
    subscriptions,
    loading,
    error,
    pagination,
    fetchSubscriptions,
    setSubscriptionFilters,
    clearError,
  } = useSubscriptionManagementStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Can default to 'all'

  useEffect(() => {
    // Initial fetch does not need filters from local state
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = () => {
    const newFilters: Record<string, string> = {};
    if (searchTerm) {
        newFilters.search = searchTerm;
    }
    if (statusFilter && statusFilter !== 'all') {
        newFilters.status = statusFilter;
    }
    setSubscriptionFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    // fetchSubscriptions already uses the filters from the store
    fetchSubscriptions(newPage);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, color: 'bg-green-500' },
      INACTIVE: { variant: 'secondary' as const, color: 'bg-gray-500' },
      CANCELLED: { variant: 'destructive' as const, color: 'bg-red-500' },
      EXPIRED: { variant: 'outline' as const, color: 'bg-orange-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    return (
      <Badge variant={config.variant} className={`text-white ${config.color}`}>
        {status}
      </Badge>
    );
  };

  const getExpirationInfo = (subscription: Subscription) => {
    if (subscription.status !== 'ACTIVE') return null;
    
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    
    if (endDate < now) {
      return (
        <span className="text-red-600 text-sm">
          Expired {formatDistanceToNow(endDate)} ago
        </span>
      );
    }
    
    return (
      <span className="text-blue-600 text-sm">
        Expires {formatDistanceToNow(endDate, { addSuffix: true })}
      </span>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading subscriptions: {error}</p>
            <Button onClick={clearError} variant="outline" className="mt-2">
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
          View and manage all user subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {/* Table */}
        {loading && subscriptions.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading subscriptions...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{subscription.user.name}</span>
                            <span className="text-sm text-gray-500">{subscription.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{subscription.plan.name}</span>
                            <span className="text-sm text-gray-500">
                              {subscription.plan.duration} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <Badge 
                              variant={subscription.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}
                              className={
                                subscription.paymentStatus === 'COMPLETED'
                                  ? 'bg-green-500 text-white'
                                  : subscription.paymentStatus === 'PENDING'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-red-500 text-white'
                              }
                            >
                              {subscription.paymentStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getExpirationInfo(subscription)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${subscription.plan.price.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} subscriptions
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
                  <span className="px-3 py-2 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
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