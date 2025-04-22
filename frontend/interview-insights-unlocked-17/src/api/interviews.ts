// src/api/interviews.ts
import api from "./client";
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard"; 
import { toCard } from "@/utils/mapInterview";
type RawInterview = {
  _id: string;
  [key: string]: any;
};
export interface VisitedPostSummary {
  id: string;
  company?: string | null;
  position?: string | null;
  // Add other fields if your backend endpoint returns more
}

export const fetchVisitedPosts = async (limit: number = 10): Promise<InterviewCardProps[]> => {
  // Adjust the endpoint URL if it's under a different prefix (e.g., /users/me/visited-posts)
  const response = await api.get<VisitedPostSummary[]>(`/interviews/users/me/visited-posts`, {
     params: { limit }
  });
  // Map the summary data to the format needed by InterviewCard
  // You might need to adjust this mapping based on what VisitedPostSummary contains
  // and what InterviewCardProps expects. Add default/placeholder values as needed.
  return response.data.map(summary => ({
      id: summary.id,
      company: summary.company ?? 'Unknown Company',
      role: summary.position ?? 'Unknown Position',
      // Add default values for fields not present in VisitedPostSummary
      difficulty: 'Medium', // Placeholder
      result: 'Pending',    // Placeholder
      date: new Date(),     // Placeholder - visited date isn't tracked simply
      likes: 0,             // Placeholder
      comments: 0,          // Placeholder
      excerpt: '',          // Placeholder
  }));
};

export interface CompanyInfo {
  name: string;
  interview_count: number;
}

export const fetchCompaniesSummary = async (): Promise<CompanyInfo[]> => {
  const response = await api.get<CompanyInfo[]>("/interviews/companies-summary"); // Adjust URL if needed
  return response.data;
};

export const shareExperience = async (data: Partial<InterviewExperience>) => {
  // You might need to transform the flat frontend state `data`
  // into the nested structure expected by InterviewExperience before sending.
  // For now, assuming data is already structured correctly.
  const response = await api.post<InterviewExperience>("/share-experience", data);
  return response.data;
};

export const fetchInterviews = async (params?: any) => {
  const {
    search_term,
    company,
    position,
    difficulty,
    offer_status,
    sort_by = "date_desc",
    skip = 0,
    limit = 10,
  } = params || {};

  const response = await api.get<{
    total_count: number;
    experiences: RawInterview[];
  }>("/interviews", {
    params: {
      search_term,
      company,
      position,
      difficulty,
      offer_status,
      sort_by,
      skip,
      limit,
    },
  });

  const { total_count, experiences } = response.data;
  return {
    total_count,
    experiences: experiences.map(e => ({
      ...e,
      id: e._id,           // ← copy _id → id
    })),
  };
};

export const fetchRecent = async (limit = 5) => {
  const response = await api.get<RawInterview[]>("/interviews/recent-experiences", {
    params: { limit },
  });

  return response.data.map(e => ({
    ...e,
    id: e._id,             // ← and here
  }));
};

export const fetchInterview = async (id: string) => {
  const response = await api.get<RawInterview>(`/interviews/${id}`);
  return {
    ...response.data,
    id: response.data._id, // ← and here
  };
};

export const fetchSimilar = async (id: string, limit = 3) => {
  const response = await api.get<RawInterview[]>(`/interviews/${id}/similar`, {
    params: { limit },
  });
  return response.data.map(e => ({
    ...e,
    id: e._id,             // ← and here
  }));
};
