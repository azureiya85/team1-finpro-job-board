import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, Package, Calendar } from 'lucide-react';
import { useSubscriptionManagementStore } from '@/stores/subscriptionMgtStores';
import type { SubscriptionPlan } from '@/types/subscription';
import { format } from 'date-fns';

import PlanFormModal, { PlanFormData } from '@/components/molecules/dashboard/Subscription/PlanFormModal';
import DeleteConfirmModal from '@/components/molecules/dashboard/Subscription/DeleteConfirmModal';

const SubscriptionManagementPlans: React.FC = () => {
  const {
    plans,
    loading,
    error,
    selectedPlan,
    isCreating,
    isUpdating,
    isDeleting,
    fetchPlans,
    selectPlan,
    createPlan,
    updatePlan,
    deletePlan,
    clearError,
  } = useSubscriptionManagementStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = async (data: PlanFormData) => {
    const success = await createPlan(data);
    if (success) {
      setCreateModalOpen(false);
    }
  };

  const handleUpdatePlan = async (data: PlanFormData) => {
    if (!selectedPlan) return;
    
    const success = await updatePlan(selectedPlan.id, data);
    if (success) {
      setEditModalOpen(false);
      selectPlan(null); // Deselect plan after successful update
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    const success = await deletePlan(selectedPlan.id);
    if (success) {
      setDeleteModalOpen(false);
      selectPlan(null); // Deselect plan after successful deletion
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    selectPlan(plan);
    setEditModalOpen(true);
  };

  const openDeleteModal = (plan: SubscriptionPlan) => {
    selectPlan(plan);
    setDeleteModalOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading plans: {error}</p>
            <Button onClick={() => { fetchPlans(); clearError(); }} variant="outline" className="mt-2">
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
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Plan Management
          </div>
          <Button onClick={() => setCreateModalOpen(true)} disabled={loading && plans.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </CardTitle>
        <CardDescription>
          Manage subscription plans, pricing, and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && plans.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading plans...</span>
          </div>
        ) : (
          <>
            {plans.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Available</h3>
                <p className="text-gray-500 mb-4">Create your first subscription plan to get started.</p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Plan
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                     <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{plan.name}</span>
                            {plan.description && (
                              <span className="text-sm text-gray-500 line-clamp-2" title={plan.description}>
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-semibold">IDR</span>
                            <span className="font-medium">{plan.price.toLocaleString('id-ID')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{plan.duration} days</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {plan.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {plan.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{plan.features.length - 2} more
                              </Badge>
                            )}
                             {plan.features.length === 0 && (
                              <span className="text-xs text-gray-500">No features</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(plan)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteModal(plan)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}

        <PlanFormModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreatePlan}
          isSubmitting={isCreating}
          mode="create"
        />

        <PlanFormModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            selectPlan(null); // Deselect plan when closing edit modal
          }}
          plan={selectedPlan}
          onSubmit={handleUpdatePlan}
          isSubmitting={isUpdating}
          mode="edit"
        />

        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            selectPlan(null); // Deselect plan when closing delete modal
          }}
          plan={selectedPlan}
          onConfirm={handleDeletePlan}
          isDeleting={isDeleting}
        />
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementPlans;