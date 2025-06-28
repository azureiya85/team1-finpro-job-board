import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Building, MapPin, Briefcase, MessageSquare, Clock, Star } from 'lucide-react';
import { CompanyWithDetails } from '@/stores/companySearchStore';
import RatingStars from '@/components/atoms/stars/RatingStars';
import { formatRelativeTime } from '@/lib/dateTimeUtils'; 

interface CompanyCardProps {
  company: CompanyWithDetails;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const location = company.city?.name
    ? `${company.city.name}${company.province?.name ? ', ' + company.province.name.replace('Provinsi ', '') : ''}`
    : company.province?.name || 'Location Undisclosed';
  
  const totalReviews = company._count.companyReviews;

  return (
    <Link href={`/companies/${company.id}`} className="group block">
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 bg-card border">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg border object-contain bg-white p-1"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
                  <Building className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Company Details */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Header Section */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-heading leading-tight group-hover:text-primary transition-colors duration-200">
                  {company.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{location}</span>
                  </div>
                  
                  {company.avgRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-foreground">{company.avgRating.toFixed(1)}</span>
                      <RatingStars rating={company.avgRating} size={16} />
                      <span className="text-muted-foreground">({totalReviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {company.description && (
                <p className="text-muted-foreground leading-relaxed line-clamp-2 text-base">
                  {company.description}
                </p>
              )}

              {/* Stats Section */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="font-medium">{company._count.jobPostings}</span>
                    <span className="text-muted-foreground">
                      {company._count.jobPostings === 1 ? 'Open Job' : 'Open Jobs'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">{totalReviews}</span>
                    <span className="text-muted-foreground">
                      {totalReviews === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>
                </div>

                {/* Last Job Posted */}
                {company.lastJobPostedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Last Job: {formatRelativeTime(new Date(company.lastJobPostedAt))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}