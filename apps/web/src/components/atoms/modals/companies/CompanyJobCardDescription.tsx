'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { JobPostingInStore } from '@/types';

import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompanyJobCardDescriptionProps {
  job: JobPostingInStore;
}

export default function CompanyJobCardDescription({ job }: CompanyJobCardDescriptionProps) {
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  return (
    <div className="space-y-4 pt-0">
      <CardDescription className="text-base leading-relaxed">
        {job.description}
      </CardDescription>

      {job.requirements && job.requirements.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <Collapsible open={showAllRequirements} onOpenChange={setShowAllRequirements}>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                Requirements
                <Badge variant="secondary" className="text-xs">
                  {job.requirements.length}
                </Badge>
              </h4>

              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {job.requirements.slice(0, 3).map((requirement, index) => (
                  <li key={index} className="leading-relaxed">
                    {requirement}
                  </li>
                ))}
              </ul>

              <CollapsibleContent className="space-y-2">
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  {job.requirements.slice(3).map((requirement, index) => (
                    <li key={index + 3} className="leading-relaxed">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>

              {job.requirements.length > 3 && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                    {showAllRequirements ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show {job.requirements.length - 3} more requirements
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </Collapsible>
        </div>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <Collapsible open={showAllBenefits} onOpenChange={setShowAllBenefits}>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                Benefits
                <Badge variant="secondary" className="text-xs">
                  {job.benefits.length}
                </Badge>
              </h4>

              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {job.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="leading-relaxed">
                    {benefit}
                  </li>
                ))}
              </ul>

              <CollapsibleContent className="space-y-2">
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  {job.benefits.slice(3).map((benefit, index) => (
                    <li key={index + 3} className="leading-relaxed">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>

              {job.benefits.length > 3 && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                    {showAllBenefits ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show {job.benefits.length - 3} more benefits
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                )}
            </div>
          </Collapsible>
        </div>
      )}
    </div>
  );
}