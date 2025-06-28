'use client'

import React, { useState, useEffect } from 'react';
import { useAssessmentStore, SkillAssessmentQuestion } from '@/stores/assessmentMgtStores';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

type QuestionFormData = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string | null;
};

type CorrectAnswer = QuestionFormData['correctAnswer'];

const QuestionForm: React.FC<{
  question?: SkillAssessmentQuestion;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel: () => void;
}> = ({ question, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    question: question?.question || '',
    optionA: question?.optionA || '',
    optionB: question?.optionB || '',
    optionC: question?.optionC || '',
    optionD: question?.optionD || '',
    correctAnswer: question?.correctAnswer || 'A',
    explanation: question?.explanation || '', 
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
      <div className="space-y-2"><Label htmlFor="question">Question</Label><Textarea id="question" value={formData.question} onChange={(e) => setFormData(p => ({ ...p, question: e.target.value }))} rows={3} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="optionA">Option A</Label><Input id="optionA" value={formData.optionA} onChange={(e) => setFormData(p => ({ ...p, optionA: e.target.value }))} required /></div>
        <div className="space-y-2"><Label htmlFor="optionB">Option B</Label><Input id="optionB" value={formData.optionB} onChange={(e) => setFormData(p => ({ ...p, optionB: e.target.value }))} required /></div>
        <div className="space-y-2"><Label htmlFor="optionC">Option C</Label><Input id="optionC" value={formData.optionC} onChange={(e) => setFormData(p => ({ ...p, optionC: e.target.value }))} required /></div>
        <div className="space-y-2"><Label htmlFor="optionD">Option D</Label><Input id="optionD" value={formData.optionD} onChange={(e) => setFormData(p => ({ ...p, optionD: e.target.value }))} required /></div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="correctAnswer">Correct Answer</Label>
        <Select value={formData.correctAnswer} onValueChange={(value) => setFormData(p => ({ ...p, correctAnswer: value as CorrectAnswer }))} required>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="explanation">Explanation (Optional)</Label><Textarea id="explanation" value={formData.explanation ?? ''} onChange={(e) => setFormData(p => ({ ...p, explanation: e.target.value }))} rows={3} /></div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : question ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export function AssessmentQuestions() {
  const { questions, selectedAssessment, fetchQuestions, createQuestion, updateQuestion, deleteQuestion } = useAssessmentStore();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SkillAssessmentQuestion | null>(null);

  useEffect(() => {
    if (selectedAssessment) {
      fetchQuestions(selectedAssessment.id);
    }
  }, [selectedAssessment, fetchQuestions]);

  const handleDeleteQuestion = async (question: SkillAssessmentQuestion) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(question.assessmentId, question.id);
      } catch { /* Error handled in store */ }
    }
  };

  const handleQuestionSubmit = (data: QuestionFormData) => {
    if (!selectedAssessment) return Promise.reject("No assessment selected");

    const submissionData = {
      ...data,
      explanation: data.explanation || undefined,
    };

    if (editingQuestion) {
      return updateQuestion(selectedAssessment.id, editingQuestion.id, submissionData);
    } else {
      return createQuestion(selectedAssessment.id, submissionData);
    }
  };
  
  const questionCount = selectedAssessment?._count?.questions || 0;
  const canCreateQuestion = selectedAssessment && questionCount < 25;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{selectedAssessment ? `Questions for "${selectedAssessment.title}"` : 'Select an Assessment'}</h3>
          {selectedAssessment && <p className="text-sm text-muted-foreground">{questionCount}/25 questions - {questionCount >= 25 ? 'Maximum reached.' : `${25 - questionCount} more required.`}</p>}
        </div>
        {selectedAssessment && (
          <Dialog open={showQuestionForm} onOpenChange={(isOpen) => { setShowQuestionForm(isOpen); if (!isOpen) setEditingQuestion(null); }}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateQuestion} onClick={() => setEditingQuestion(null)}><Plus className="w-4 h-4 mr-2" />Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create New Question'}</DialogTitle>
                <DialogDescription>{editingQuestion ? 'Update the question details.' : 'Add a new question to the assessment.'}</DialogDescription>
              </DialogHeader>
              <QuestionForm
                question={editingQuestion || undefined}
                onSubmit={handleQuestionSubmit}
                onCancel={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedAssessment ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Please select an assessment from the ‘Assessments&apos; tab to view and manage its questions.</p>
        </div>
      ) : questionCount < 25 ? (
        <Alert variant="default"><AlertTriangle className="h-4 w-4" /><AlertDescription>This assessment needs at least 25 questions to be considered complete. It currently has {questionCount} question{questionCount !== 1 ? 's' : ''}.</AlertDescription></Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription>This assessment has 25 questions and is ready to be used.</AlertDescription></Alert>
      )}

      {selectedAssessment && (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2">Question {index + 1}: <span className='font-normal'>{question.question}</span></CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {(['A', 'B', 'C', 'D'] as const).map(opt => (<div key={opt} className={`p-2 rounded border ${question.correctAnswer === opt ? 'bg-green-100 border-green-300 font-semibold' : 'bg-gray-50'}`}><strong>{opt}:</strong> {question[`option${opt}`]}</div>))}
                    </div>
                    {question.explanation && <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800 border border-blue-200"><strong>Explanation:</strong> {question.explanation}</div>}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingQuestion(question); setShowQuestionForm(true); }}><Edit className="w-4 h-4" /><span className="sr-only">Edit Question</span></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDeleteQuestion(question)}><Trash2 className="w-4 h-4" /><span className="sr-only">Delete Question</span></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          {questions.length === 0 && <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">No questions found for this assessment. Add one to get started.</div>}
        </div>
      )}
    </div>
  );
}