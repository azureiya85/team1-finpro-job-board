import { InterestItem } from "@/types/analyticsTypes";

export async function getApplicantInterests() {
  const query = new URLSearchParams();

  const res = await fetch(`/api/analytics/applicant-interests?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch applicant interests');
  }

  const raw = await res.json();

  return {
    labels: raw.map((item: InterestItem) => item.category),
    values: raw.map((item: InterestItem) => item.count),
  };
}