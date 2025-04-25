// src/api/interviews.ts
import api from "./client";
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";
// Removed unused import 'toCard' as we are doing direct mapping here
// import { toCard } from "@/utils/mapInterview";

// Frontend interface representing the *desired* structure after mapping
export interface VisitedPostSummary {
  id: string;
  company?: string | null;
  position?: string | null;
}

// Interface representing the *actual raw data* coming from the API
interface RawPostSummaryFromAPI {
  _id: string;
  company?: string | null;
  position?: string | null;
  // Add createdAt if needed for sorting/display
  createdAt?: string;
}


// --- Map raw summary to Card Props ---
const mapRawSummaryToCardProps = (summary: RawPostSummaryFromAPI | null): InterviewCardProps | null => {
  if (!summary || typeof summary._id !== 'string' || !summary._id) {
      console.warn("Post summary missing or invalid _id:", summary);
      return null;
  }

  let dateObject: Date;
  try {
      dateObject = summary.createdAt ? new Date(summary.createdAt) : new Date();
      if (isNaN(dateObject.getTime())) dateObject = new Date(); // Fallback on invalid date
  } catch {
      dateObject = new Date(); // Fallback on error
  }


  return {
      id: summary._id, // Map _id to id
      company: summary.company ?? 'Unknown Company',
      role: summary.position ?? 'Unknown Position',
      difficulty: 'Medium', // Placeholder
      result: 'Pending',    // Placeholder
      date: dateObject,     // Use parsed/fallback date
      likes: 0,             // Placeholder
      comments: 0,          // Placeholder
      excerpt: `Experience for ${summary.position ?? 'position'} at ${summary.company ?? 'company'}.`,
  };
};

export const fetchSavedPosts = async (): Promise<InterviewCardProps[]> => {
  try {
      const response = await api.get<RawPostSummaryFromAPI[]>(`/interviews/users/me/saved-posts`);
      if (!Array.isArray(response.data)) {
          console.error("Expected an array from /saved-posts, received:", response.data);
          return [];
      }
      return response.data
          .map(mapRawSummaryToCardProps)
          .filter((card): card is InterviewCardProps => card !== null);
  } catch (error) {
      console.error("Error fetching saved posts:", error);
      return [];
  }
};

// --- NEW: Save/Unsave API calls ---
export const savePost = async (id: string): Promise<void> => {
  await api.post(`/interviews/${id}/save`);
};

export const unsavePost = async (id: string): Promise<void> => {
  await api.delete(`/interviews/${id}/save`);
};

// --- NEW: Fetch Save Status ---
export interface SaveStatusResponse {
  is_saved: boolean;
}
export const fetchSaveStatus = async (id: string): Promise<boolean> => {
  if (!id || id === 'undefined') return false; // Prevent invalid calls
  try {
      const response = await api.get<SaveStatusResponse>(`/interviews/${id}/savestatus`);
      return response.data.is_saved;
  } catch (error) {
      console.error(`Error fetching save status for post ${id}:`, error);
      return false; // Assume not saved on error
  }
};

// Type for the full raw interview document from MongoDB (used internally elsewhere)
type RawInterview = InterviewExperience & { _id: string };
export const fetchVisitedPosts = async (): Promise<InterviewCardProps[]> => {
  try {
    const response = await api.get<RawPostSummaryFromAPI[]>(`/interviews/users/me/visited-posts`);
    if (!Array.isArray(response.data)) {
      console.error("Expected an array from /visited-posts, received:", response.data);
      return [];
    }
    return response.data
      .map(mapRawSummaryToCardProps)
      .filter((card): card is InterviewCardProps => card !== null);
  } catch (error) {
    console.error("Error fetching visited posts:", error);
    return [];
  }
};

export interface CompanyInfo {
  name: string;
  interview_count: number;
}

export const fetchCompaniesSummary = async (): Promise<CompanyInfo[]> => {
  const response = await api.get<CompanyInfo[]>("/interviews/companies-summary");
  return response.data;
};

export const shareExperience = async (data: Partial<InterviewExperience>) => {
  const response = await api.post<InterviewExperience>("/share-experience", data);
  const createdExperience = response.data;
  if ((createdExperience as any)._id && !createdExperience.id) {
      createdExperience.id = (createdExperience as any)._id;
  }
  return createdExperience;
};


export const fetchInterviews = async (params?: any) => {
  const {
    search_term, company, position, difficulty, offer_status,
    sort_by = "date_desc", skip = 0, limit = 10,
  } = params || {};

  const response = await api.get<{
    total_count: number;
    experiences: RawInterview[]; // Use RawInterview which includes _id
  }>("/interviews", {
    params: {
      search_term, company, position, difficulty, offer_status,
      sort_by, skip, limit,
    },
  });

  const { total_count, experiences } = response.data;

  if (!Array.isArray(experiences)) {
    console.error("Expected 'experiences' array in response, received:", response.data);
    return { total_count: 0, experiences: [] };
  }

  return {
    total_count,
    experiences: experiences.map(e => ({
      ...e,
      id: e._id, // Map MongoDB's _id to frontend's id
    })),
  };
};

export const fetchRecent = async (limit = 5) => {
  const response = await api.get<RawInterview[]>("/interviews/recent-experiences", {
    params: { limit },
  });

  if (!Array.isArray(response.data)) {
      console.error("Expected an array from /interviews/recent-experiences, received:", response.data);
      return [];
  }
  return response.data.map(e => ({
    ...e,
    id: e._id,
  }));
};

export const fetchInterview = async (id: string): Promise<InterviewExperience> => {
  if (!id || id === 'undefined') {
      console.error("fetchInterview called with invalid ID:", id);
      throw new Error("Invalid Interview ID provided.");
  }
  const response = await api.get<RawInterview>(`/interviews/${id}`);
  return {
    ...response.data,
    id: response.data._id,
  };
};

export const fetchSimilar = async (id: string, limit = 3) => {
  if (!id || id === 'undefined') {
      console.error("fetchSimilar called with invalid ID:", id);
      return [];
  }
  const response = await api.get<RawInterview[]>(`/interviews/${id}/similar`, {
    params: { limit },
  });

  if (!Array.isArray(response.data)) {
      console.error(`Expected an array from /interviews/${id}/similar, received:`, response.data);
      return [];
  }
  return response.data.map(e => ({
    ...e,
    id: e._id,
  }));
};  