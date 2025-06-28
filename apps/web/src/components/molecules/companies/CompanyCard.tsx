import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Briefcase, MessageSquare, Clock } from 'lucide-react';
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
    <Link href={`/companies/${company.id}`} className="group block h-full">
      <Card className="flex h-full flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={56}
                  height={56}
                  className="rounded-lg border object-contain bg-white p-0.5 shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted shrink-0">
                  <Building className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-heading leading-tight group-hover:text-primary truncate">
                  {company.name}
                </CardTitle>
                
                {company.avgRating > 0 && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{company.avgRating.toFixed(1)}</span>
                    <RatingStars rating={company.avgRating} />
                    <span>({totalReviews})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground" title={location}>
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {company.description && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {company.description}
            </p>
          )}
        </CardContent>

     {/* Card Footer */}
        <div className="px-6 pb-4 pt-2">
           <div className="border-t pt-3 space-y-2 text-sm text-foreground/90">
                {/* Row 1: Jobs and Reviews */}
                <div className='flex items-center justify-between'>
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span>{company._count.jobPostings} Open Jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>{totalReviews} Reviews</span>
                    </div>
                </div>

                {/* Row 2: Last Job Posted Date */}
                {company.lastJobPostedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Last Job: {formatRelativeTime(new Date(company.lastJobPostedAt))}
                    </span>
                  </div>
                )}
           </div>
        </div>
      </Card>
    </Link>
  );
}