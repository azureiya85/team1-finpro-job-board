'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FolderOpen, HelpCircle, AlertTriangle, X } from "lucide-react";
import { useAssessmentMgtStore } from '@/stores/assessmentMgtStores'; 
import { AssessmentCategories } from '@/components/organisms/dashboard/assessments/developer/AssessmentCategories';
import { AssessmentList } from '@/components/organisms/dashboard/assessments/developer/AssessmentList';
import { AssessmentQuestions } from '@/components/organisms/dashboard/assessments/developer/AssessmentQuestion';

export default function AssessmentManagementPageTemplate() {
  const {
    categories,
    assessments,
    questions, 
    selectedAssessment,
    categoryError,
    assessmentError,
    questionError,
    fetchCategories,
    fetchAssessments,
  } = useAssessmentMgtStore();

  const [activeTab, setActiveTab] = useState("categories");
  const [displayError, setDisplayError] = useState<string | null>(null);

  // Sync store errors to the local display state
  useEffect(() => {
    const firstError = categoryError || assessmentError || questionError;
    setDisplayError(firstError);
  }, [categoryError, assessmentError, questionError]);

  const questionCount = selectedAssessment ? questions.length : 0;

  useEffect(() => {
    fetchCategories();
    fetchAssessments();
  }, [fetchCategories, fetchAssessments]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Manage Skill Assessments
          </CardTitle>
          <CardDescription>
            Create, edit, and manage skill assessment tests and questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className='flex items-center justify-between'>
                {displayError}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDisplayError(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />Categories ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="assessments" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />Assessments ({assessments.length})
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />Questions {selectedAssessment && `(${questionCount}/25)`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <AssessmentCategories />
            </TabsContent>
            <TabsContent value="assessments">
              <AssessmentList setActiveTab={setActiveTab} />
            </TabsContent>
            <TabsContent value="questions">
              <AssessmentQuestions />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}