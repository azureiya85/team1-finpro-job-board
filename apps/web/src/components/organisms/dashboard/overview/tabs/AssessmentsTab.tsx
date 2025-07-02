"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Target } from "lucide-react";
import { DashboardData, DashboardStats } from "@/types/devDashboard";

interface AssessmentsTabProps {
  data: DashboardData;
  stats: DashboardStats;
}

export default function AssessmentsTab({ data, stats }: AssessmentsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Skill Categories
          </CardTitle>
          <CardDescription>{data.categories.length} categories available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="secondary">
                  {data.assessments.filter((a) => a.categoryId === category.id).length} assessments
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Assessment Overview
          </CardTitle>
          <CardDescription>Questions and assessment statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Questions</span>
              <span className="font-bold">{stats.totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average per Assessment</span>
              <span className="font-bold">{stats.avgQuestionsPerAssessment}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              {data.assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{assessment.title}</p>
                    <p className="text-xs text-muted-foreground">{assessment.category.name}</p>
                  </div>
                  <Badge variant="outline">{assessment._count.questions} questions</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}