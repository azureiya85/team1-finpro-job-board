"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle } from "lucide-react";
import { getDisplayableFeatures } from "@/lib/planFeaturesUtils";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: unknown;
}

interface PlansTabProps {
  plans: Plan[];
}

export default function PlansTab({ plans }: PlansTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const featuresList = getDisplayableFeatures(plan.features);

        return (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <Badge variant="outline">IDR {plan.price.toLocaleString()}</Badge>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  {plan.duration} days duration
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Features:</p>
                  {featuresList.length > 0 ? (
                    featuresList.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No features enabled.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}