import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

export const toCard = (e: InterviewExperience): InterviewCardProps => {
  let dateObject: Date | null = null;
  try {
    // Only attempt to create a date if createdAt exists and is truthy
    if (e.createdAt) {
      dateObject = new Date(e.createdAt);
      // Check if the created date is valid
      if (isNaN(dateObject.getTime())) {
        console.warn("Invalid date received from backend:", e.createdAt);
        dateObject = null; // Treat as invalid
      }
    }
  } catch (error) {
    console.error("Error parsing date:", e.createdAt, error);
    dateObject = null; // Treat as invalid on error
  }

  return {
    id: e.id ?? (e as any)._id!,
    company: e.company ?? "Unknown",
    role: e.position ?? "Unknown role",
    difficulty: (e.difficulty ?? "Medium").replace(/^\w/, x => x.toUpperCase()) as any,
    result: (e.offer_status ?? "Pending").replace(/^\w/, x => x.toUpperCase()) as any,
    // Use the potentially null dateObject, or fallback to Date.now() only if appropriate
    // If you want to show nothing for invalid dates, use dateObject directly
    date: dateObject ?? new Date(), // Or handle null in the component
    likes: 0, // Assuming default values
    comments: 0, // Assuming default values
    excerpt: e.quality_reasoning ?? "",
  };
};