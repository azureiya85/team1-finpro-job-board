import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, Package, DollarSign, Calendar, List, Save, X} from 'lucide-react';
import { useSubscriptionManagementStore, SubscriptionPlan } from '@/stores/subscriptionMgtStores';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanFormData {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
}

const PlanFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: PlanFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}> = ({ isOpen, onClose, plan, onSubmit, isSubmitting, mode }) => {
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    features: [''],
  });

  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        description: plan.description,
        features: plan.features.length > 0 ? plan.features : [''],
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        duration: 30,
        description: '',
        features: [''],
      });
    }
  }, [plan, mode, isOpen]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
    onSubmit({
      ...formData,
      features: filteredFeatures,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {mode === 'create' ? 'Create New Plan' : 'Edit Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new subscription plan with custom features and pricing.'
              : 'Update the subscription plan details and features.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Plan"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (Days) *</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                placeholder="30"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this plan includes..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4" />
              Features
            </Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'create' ? 'Create Plan' : 'Update Plan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ isOpen, onClose, plan, onConfirm, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="py-4">
            <Alert>
              <AlertDescription>
                <strong>Plan:</strong> {plan.name}<br />
                <strong>Price:</strong> ${plan.price.toFixed(2)}<br />
                <strong>Duration:</strong> {plan.duration} days
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Plan
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading plans: {error}</p>
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
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Plan Management
          </div>
          <Button onClick={() => setCreateModalOpen(true)} disabled={loading}>
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
            {plans.length === 0 ? (
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
                              <span className="text-sm text-gray-500 line-clamp-2">
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">{plan.price.toFixed(2)}</span>
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

        {/* Modals */}
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