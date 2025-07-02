import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { useSubscriptionManagementStore } from '@/stores/subscriptionMgtStores';
import type { SubscriptionPlan } from '@/types/subscription';

import PlanFormModal, { PlanFormData } from '@/components/molecules/dashboard/Subscription/PlanFormModal';
import DeleteConfirmModal from '@/components/molecules/dashboard/Subscription/DeleteConfirmModal';
import PlansTable from '@/components/molecules/dashboard/Subscription/Plans/PlanTable';
import EmptyState from '@/components/molecules/dashboard/Subscription/Plans/PlanEmptyState';
import LoadingState from '@/components/molecules/dashboard/Subscription/Plans/PlanLoadingState';
import ErrorState from '@/components/molecules/dashboard/Subscription/Plans/PlanErrorState';

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
      selectPlan(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    const success = await deletePlan(selectedPlan.id);
    if (success) {
      setDeleteModalOpen(false);
      selectPlan(null);
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

  const handleRetry = () => {
    fetchPlans();
    clearError();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorState error={error} onRetry={handleRetry} />
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
          <LoadingState />
        ) : (
          <>
            {plans.length === 0 && !loading ? (
              <EmptyState onCreatePlan={() => setCreateModalOpen(true)} />
            ) : (
              <PlansTable
                plans={plans}
                onEditPlan={openEditModal}
                onDeletePlan={openDeleteModal}
              />
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
            selectPlan(null);
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
            selectPlan(null);
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