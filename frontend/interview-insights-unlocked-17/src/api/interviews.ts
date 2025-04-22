// src/api/interviews.ts
import api from "./client";
import { InterviewExperience } from "@/types/backend";
type RawInterview = {
  _id: string;
  [key: string]: any;
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
