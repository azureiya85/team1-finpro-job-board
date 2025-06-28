'use client'

import React, { useState } from 'react';
import { useAssessmentStore, SkillAssessment } from '@/stores/assessmentMgtStores';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, FolderOpen, Clock, Target, HelpCircle, AlertTriangle } from "lucide-react";

type AssessmentFormData = {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  categoryId: string;
  isActive: boolean;
};

// Assessment Form Component
const AssessmentForm: React.FC<{
  assessment?: SkillAssessment;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  onCancel: () => void;
}> = ({ assessment, onSubmit, onCancel }) => {
  const { categories } = useAssessmentStore();
  const [formData, setFormData] = useState({
    title: assessment?.title || '',
    description: assessment?.description || '',
    timeLimit: assessment?.timeLimit || 60,
    passingScore: assessment?.passingScore || 70,
    categoryId: assessment?.categoryId || '',
    isActive: assessment?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch { /* Error handled in store */ } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="title">Assessment Title</Label><Input id="title" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required /></div>
      <div className="space-y-2"><Label htmlFor="description">Description (Optional)</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="timeLimit">Time Limit (minutes)</Label><Input id="timeLimit" type="number" min="1" value={formData.timeLimit} onChange={(e) => setFormData(p => ({ ...p, timeLimit: parseInt(e.target.value) }))} required /></div>
        <div className="space-y-2"><Label htmlFor="passingScore">Passing Score (%)</Label><Input id="passingScore" type="number" min="0" max="100" value={formData.passingScore} onChange={(e) => setFormData(p => ({ ...p, passingScore: parseInt(e.target.value) }))} required /></div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select value={formData.categoryId} onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v }))} required>
          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      {assessment && (<div className="flex items-center space-x-2"><input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} /><Label htmlFor="isActive">Active</Label></div>)}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : assessment ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

interface AssessmentListProps {
  setActiveTab: (tab: string) => void;
}

export function AssessmentList({ setActiveTab }: AssessmentListProps) {
  const { categories, assessments, selectedAssessment, setSelectedAssessment, createAssessment, updateAssessment, deleteAssessment } = useAssessmentStore();
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<SkillAssessment | null>(null);

  const handleDeleteAssessment = async (assessment: SkillAssessment) => {
    if (confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
      try {
        await deleteAssessment(assessment.id);
        if (selectedAssessment?.id === assessment.id) {
          setSelectedAssessment(null);
        }
      } catch { /* Error handled in store */ }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Skill Assessments</h3>
        <Dialog open={showAssessmentForm} onOpenChange={(isOpen) => { setShowAssessmentForm(isOpen); if (!isOpen) setEditingAssessment(null); }}>
          <DialogTrigger asChild>
            <Button disabled={categories.length === 0} onClick={() => setEditingAssessment(null)}><Plus className="w-4 h-4 mr-2" />Add Assessment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}</DialogTitle>
              <DialogDescription>{editingAssessment ? 'Update the assessment details.' : 'Add a new skill assessment.'}</DialogDescription>
            </DialogHeader>
            <AssessmentForm
              assessment={editingAssessment || undefined}
              onSubmit={editingAssessment ? (data) => updateAssessment(editingAssessment.id, data) : createAssessment}
              onCancel={() => { setShowAssessmentForm(false); setEditingAssessment(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 && (
        <Alert><AlertTriangle className="h-4 w-4" /><AlertDescription>You must create a category before you can add an assessment.</AlertDescription></Alert>
      )}

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className={selectedAssessment?.id === assessment.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg cursor-pointer" onClick={() => { setSelectedAssessment(assessment); setActiveTab("questions"); }}>{assessment.title}</CardTitle>
                    <Badge variant={assessment.isActive ? "default" : "secondary"}>{assessment.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  {assessment.description && <CardDescription className="mb-3">{assessment.description}</CardDescription>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><FolderOpen className="w-4 h-4" />{assessment.category?.name || 'Uncategorized'}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{assessment.timeLimit} min</div>
                    <div className="flex items-center gap-1.5"><Target className="w-4 h-4" />{assessment.passingScore}% pass</div>
                    <div className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" />{assessment._count?.questions || 0} questions</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAssessment(assessment); setActiveTab("questions"); }}>
                    <HelpCircle className="w-4 h-4 mr-1.5" />Manage Questions
                  </Button>
                  <div className='flex gap-2'>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => { setEditingAssessment(assessment); setShowAssessmentForm(true); }}>
                      <Edit className="w-4 h-4" /><span className="sr-only">Edit Assessment</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleDeleteAssessment(assessment)}>
                      <Trash2 className="w-4 h-4" /><span className="sr-only">Delete Assessment</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {assessments.length === 0 && categories.length > 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">No assessments found. Create one to get started.</div>
        )}
      </div>
    </div>
  );
}