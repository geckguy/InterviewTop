// src/types/backend.ts
export interface InterviewExperience {
    id?: string;
    company?: string | null;
    position?: string | null;
    seniority?: string | null;
    location?: string | null;
    interview_details?: unknown;         // add stricter typing if you like
    leetcode_questions?: unknown;
    design_questions?: unknown;
    problem_link?: string[];
    difficulty?: string | null;
    offer_status?: string | null;
    quality_flag?: number | null;
    quality_reasoning?: string | null;
    createdAt?: string;                  // ISO string from Mongo
  }
  