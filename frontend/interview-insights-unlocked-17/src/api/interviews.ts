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
interface RawVisitedPostFromAPI {
    _id: string; // The field name as it comes from the API
    company?: string | null;
    position?: string | null;
    // Add other fields if the backend endpoint actually sends them
}


// Type for the full raw interview document from MongoDB (used internally elsewhere)
type RawInterview = InterviewExperience & { _id: string };

// --- Updated fetchVisitedPosts ---
export const fetchVisitedPosts = async (): Promise<InterviewCardProps[]> => {
  try {
    // Expect the raw data structure (with _id) from the backend endpoint
    const response = await api.get<RawVisitedPostFromAPI[]>(`/interviews/users/me/visited-posts`);

    if (!Array.isArray(response.data)) {
        console.error("Expected an array from /users/me/visited-posts, received:", response.data);
        return []; // Return empty array on unexpected data structure
    }

    // Map the raw data to the format needed by InterviewCard
    // Perform the _id -> id mapping manually here
    return response.data
      .map(summary => {
        // Basic validation to ensure summary and its _id exist
        if (!summary || typeof summary._id !== 'string' || !summary._id) {
          console.warn("Visited post summary missing or invalid _id:", summary);
          // Return null to filter out problematic entries later
          return null;
        }

        // Construct InterviewCardProps using summary data and placeholders
        return {
          id: summary._id, // <--- Perform the mapping from _id to id HERE
          company: summary.company ?? 'Unknown Company',
          role: summary.position ?? 'Unknown Position',
          // Add default/placeholder values for fields not present
          difficulty: 'Medium', // Placeholder
          result: 'Pending',    // Placeholder
          date: new Date(),     // Placeholder - visited date isn't tracked simply
          likes: 0,             // Placeholder
          comments: 0,          // Placeholder
          // Create a more informative placeholder excerpt
          excerpt: `Interview experience for ${summary.position ?? 'position'} at ${summary.company ?? 'company'}.`,
        };
      })
      // Filter out any entries that failed validation (returned null)
      .filter((card): card is InterviewCardProps => card !== null);

  } catch (error) {
    console.error("Error fetching visited posts:", error);
    // Depending on error handling strategy, you might throw, return [], or return specific error cards
    return [];
  }
};
// --- End Updated fetchVisitedPosts ---


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