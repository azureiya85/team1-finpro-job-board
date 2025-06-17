'use client'

import React, { useState } from 'react';
import { useAssessmentStore, SkillCategory } from '@/stores/assessmentMgtStores';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

// Category Form Component 
const CategoryForm: React.FC<{
  category?: SkillCategory;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  onCancel: () => void;
}> = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
      });
      onCancel();
    } catch {
      // Error is handled in the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

// Main Component for the Categories Tab
export function AssessmentCategories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useAssessmentStore();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);

  const handleDeleteCategory = async (category: SkillCategory) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch { /* Error handled in store */ }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Skill Categories</h3>
        <Dialog open={showCategoryForm} onOpenChange={(isOpen) => { setShowCategoryForm(isOpen); if (!isOpen) setEditingCategory(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
              <DialogDescription>{editingCategory ? 'Update the category details.' : 'Add a new skill category for assessments.'}</DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={editingCategory || undefined}
              onSubmit={editingCategory ? (data) => updateCategory(editingCategory.id, data) : createCategory}
              onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && <CardDescription className="mt-1">{category.description}</CardDescription>}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(category); setShowCategoryForm(true); }}>
                    <Edit className="w-4 h-4" /><span className="sr-only">Edit Category</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category)}>
                    <Trash2 className="w-4 h-4" /><span className="sr-only">Delete Category</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No categories found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}