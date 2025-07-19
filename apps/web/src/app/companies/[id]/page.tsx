import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CompanyProfileTemplate from '@/components/templates/companies/CompanyProfileTemplate';
import { getCompanyDetails } from '@/lib/actions/companyUtils';

// The props interface for a Server Component page
interface CompanyProfilePageProps {
  params: {
    id: string;
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { id } = params;

  const companyData = await getCompanyDetails(id);

  if (!companyData) {
    notFound();
  }

  return <CompanyProfileTemplate company={companyData} />;
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const { id } = params;
  const company = await getCompanyDetails(id);

  if (!company) {
    return { title: 'Company Not Found' };
  }

  return {
    title: `${company.name} | Company Profile`,
    description: company.description?.substring(0, 160) || `Learn more about ${company.name} and their open positions.`,
    openGraph: {
      title: `${company.name} | Company Profile`,
      description: company.description?.substring(0, 160) || `Learn more about ${company.name}.`,
      images: company.logo ? [{ url: company.logo }] : [],
    },
  };
}