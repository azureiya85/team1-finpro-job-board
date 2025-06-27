'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Calendar } from 'lucide-react';
import { ProfileUser } from '@/lib/applicantProfileService';
import { formatEducationLevelDisplay } from '@/lib/jobConstants';

interface ProfileViewLeftProps {
  user: ProfileUser;
}

export default function ProfileViewLeft({ user }: ProfileViewLeftProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.gender && (
              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <p className="text-gray-900 capitalize">{user.gender.toLowerCase()}</p>
              </div>
            )}
            
            {user.lastEducation && (
              <div>
                <label className="text-sm font-medium text-gray-700">Education Level</label>
                <p className="text-gray-900">{formatEducationLevelDisplay(user.lastEducation)}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.workExperiences.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No work experience added yet.</p>
          ) : (
            <div className="space-y-6">
              {user.workExperiences.map((exp, index) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-gray-700 font-medium">{exp.companyName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(exp.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })} - {
                            exp.isCurrentJob || !exp.endDate 
                              ? 'Present' 
                              : new Date(exp.endDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })
                          }
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                    {exp.isCurrentJob && (
                      <Badge variant="secondary" className="ml-2">Current</Badge>
                    )}
                  </div>
                  {index < user.workExperiences.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}