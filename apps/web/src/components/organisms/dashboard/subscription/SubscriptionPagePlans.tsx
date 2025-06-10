"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatFeatures } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/subscriptionStores';

export default function SubscriptionPagePlans() {
  const { plans, selectedPlan, setSelectedPlan } = useSubscriptionStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedPlan === plan.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setSelectedPlan(plan.id)}
        >
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>
              IDR {plan.price.toLocaleString()} / {plan.duration} days
            </CardDescription>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {formatFeatures(plan.features).map((feature, i) => (
                <li key={i} className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}