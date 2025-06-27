'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { ProfileUser } from '@/lib/applicantProfileService';
import ProfileViewLeft from '../../../molecules/companies/applicant-profile/ProfileViewLeft'; 
import ProfileViewRight from '../../../molecules/companies/applicant-profile/ProfileViewRight';

interface ProfileViewLayoutProps {
  user: ProfileUser;
  viewerRole: UserRole;
}

export default function ProfileViewLayout({ user, viewerRole }: ProfileViewLayoutProps) {
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatLocation = () => {
    const parts = [];
    if (user.city?.name) parts.push(user.city.name);
    if (user.province?.name) parts.push(user.province.name);
    return parts.join(', ') || 'Not specified';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.profileImage || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                </h1>
                <p className="text-gray-600 mt-1">Job Seeker</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{formatLocation()}</span>
                </div>
                
                {user.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{calculateAge(user.dateOfBirth)} years old</span>
                  </div>
                )}
              </div>
              
              {user.currentAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>{user.currentAddress}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileViewLeft user={user} />
        <ProfileViewRight user={user} viewerRole={viewerRole} />
      </div>
    </div>
  );
}