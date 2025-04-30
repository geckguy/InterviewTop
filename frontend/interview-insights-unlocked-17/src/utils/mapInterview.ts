// src/utils/mapInterview.ts
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

export const toCard = (exp: InterviewExperience): InterviewCardProps => {
  // --- Date Parsing ---
  let dateObject: Date | null = null;
  if (exp.createdAt) { // Check if createdAt exists
    try {
      const parsedDate = new Date(exp.createdAt);
      // Check if the created date is valid
      if (!isNaN(parsedDate.getTime())) {
        dateObject = parsedDate;
      } else {
        console.warn("Invalid date parsed from backend:", exp.createdAt);
      }
    } catch (error) {
      console.error("Error parsing date:", exp.createdAt, error);
    }
  }

  // --- Result Mapping ---
  let resultStatus: InterviewCardProps['result'] = 'Pending'; // Default
  const offerStatus = exp.offer_status?.toLowerCase();
  if (offerStatus === 'accepted' || offerStatus === 'offer') {
    resultStatus = 'Offer';
  } else if (offerStatus === 'rejected') {
    resultStatus = 'Rejected';
  }
  // 'Pending' is already the default

  // --- Difficulty Mapping ---
  // Ensure difficulty is one of the allowed enum values, default to medium
  const difficultyValue = exp.difficulty?.toLowerCase();
  let cardDifficulty: InterviewCardProps['difficulty'] = 'Medium'; // Default
  if (difficultyValue === 'easy' || difficultyValue === 'medium' || difficultyValue === 'hard' || difficultyValue === 'very-hard') {
      cardDifficulty = difficultyValue.replace(/^\w/, c => c.toUpperCase()) as InterviewCardProps['difficulty'];
  }


  return {
    // Prioritize simple 'id', fallback to '$oid', then random as last resort
    id: exp.id ?? exp._id?.$oid ?? String(Math.random()).substring(2),
    company: exp.company ?? 'Unknown Company', // Provide a more descriptive default
    role: exp.position ?? 'Unknown Role',      // Map position -> role
    difficulty: cardDifficulty,                // Use mapped difficulty
    result: resultStatus,                      // Use mapped result
    date: dateObject,                          // Pass the parsed date object OR null
    likes: exp.likes ?? 0,                     // Use default if null/undefined
    comments: exp.comments ?? 0,               // Use default if null/undefined
    // Map quality_reasoning -> excerpt, provide explicit fallback text
    excerpt: exp.quality_reasoning || 'View details inside.',
    isFeatured: false, // Default value, can be overridden where used
  };
};