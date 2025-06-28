'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Award, Building, Clock } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { ProfileUser } from '@/lib/applicantProfileService';

interface ProfileViewRightProps {
  user: ProfileUser;
  viewerRole: UserRole;
}

export default function ProfileViewRight({ user, viewerRole }: ProfileViewRightProps) {
  const getSkillBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const formatApplicationStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };
  
  return (
    <div className="space-y-6">
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Skills Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.skillAssessments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No skills assessed yet.</p>
          ) : (
            <div className="space-y-3">
              {user.skillAssessments.map((userSkill) => (
                <div key={userSkill.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{userSkill.assessment.title}</span>
                  <Badge 
                    variant={getSkillBadgeVariant(userSkill.score)}
                    className="text-xs"
                  >
                    {userSkill.score}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.certificates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No certificates added yet.</p>
          ) : (
            <div className="space-y-4">
              {user.certificates.map((cert) => (
                <div key={cert.id} className="space-y-1">
                  <h4 className="font-medium text-sm">{cert.name}</h4>
                  <p className="text-xs text-gray-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500">
                    Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                    {cert.expiryDate && (
                      <span> • Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application History */}
      {viewerRole === UserRole.COMPANY_ADMIN && user.jobApplications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Application History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.jobApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No applications to your company.</p>
            ) : (
              <div className="space-y-3">
                {user.jobApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="space-y-1">
                    <h4 className="font-medium text-sm">{app.jobPosting.title}</h4>
                    <p className="text-xs text-gray-600">{app.jobPosting.company.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {formatApplicationStatus(app.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {user.jobApplications.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{user.jobApplications.length - 5} more applications
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}