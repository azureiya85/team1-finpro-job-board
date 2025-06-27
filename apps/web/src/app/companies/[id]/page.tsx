import axios from 'axios';
import CompanyProfileTemplate from '@/components/templates/companies/CompanyProfileTemplate';
import { notFound } from 'next/navigation';
import type { CompanyDetailed } from '@/types';
import type { Metadata } from 'next'; 

const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: EXPRESS_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

async function getCompanyData(companyId: string): Promise<CompanyDetailed | null> { 
  try {
    if (!companyId) {
      console.error('getCompanyData called with invalid companyId:', companyId);
      return null;
    }

    console.log(`[getCompanyData] Fetching company data for ID: ${companyId} from Express API`);

    const response = await apiClient.get<CompanyDetailed>(`/companies/${companyId}`);
    
    console.log(`[getCompanyData] Successfully fetched company data for ID: ${companyId}`);
    return response.data;

  } catch (error) {
    console.error(`[getCompanyData] Error fetching company data for ${companyId}:`, error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn(`[getCompanyData] Company not found (404) for ID: ${companyId}`);
        return null;
      }
      
      if (error.code === 'NETWORK_ERR' || error.message === 'Network Error') {
        console.error(`[getCompanyData] Network error for company ${companyId}:`, error.message);
      } else if (error.response) {
        console.error(`[getCompanyData] Server error for company ${companyId}: ${error.response.status} ${error.response.statusText}`, error.response.data);
      } else if (error.request) {
        console.error(`[getCompanyData] No response received for company ${companyId}:`, error.request);
      }
    }
    
    return null;
  }
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log(`[CompanyProfilePage] Page loaded for company ID: ${id}`);
  const companyData = await getCompanyData(id);

  if (!companyData) {
    console.log(`[CompanyProfilePage] Company data not found for ID: ${id}, calling notFound()`);
    notFound();
  }

  console.log(`[CompanyProfilePage] Rendering company profile for: ${companyData.name}`);
  return <CompanyProfileTemplate company={companyData} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  console.log(`[generateMetadata] Generating metadata for company ID: ${id}`);
  const company = await getCompanyData(id);

  if (!company) {
    console.log(`[generateMetadata] Company not found for metadata generation, ID: ${id}`);
    return { title: 'Company Not Found' };
  }

  console.log(`[generateMetadata] Generated metadata for company: ${company.name}`);
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