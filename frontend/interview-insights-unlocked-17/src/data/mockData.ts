
import { InterviewCardProps } from "@/components/InterviewCard";

// Generate mock interview experiences
export const generateMockInterviews = (count: number): InterviewCardProps[] => {
  const companies = [
    "Google", 
    "Microsoft", 
    "Amazon", 
    "Meta", 
    "Apple", 
    "Netflix",
    "Uber", 
    "Airbnb", 
    "Tesla", 
    "Twitter", 
    "Spotify", 
    "Adobe"
  ];
  
  const roles = [
    "Software Engineer", 
    "Product Manager", 
    "Data Scientist", 
    "UX Designer", 
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "ML Engineer",
    "Technical Program Manager"
  ];
  
  const difficulties: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"];
  const results: ("Offer" | "Rejected" | "Pending")[] = ["Offer", "Rejected", "Pending"];
  
  const excerpts = [
    "The interview process consisted of 5 rounds, starting with a phone screen with a recruiter...",
    "I was asked to solve two algorithmic problems during the technical interview...",
    "The system design round was challenging but the interviewer was helpful...",
    "The behavioral questions focused on leadership and conflict resolution...",
    "I had to prepare a presentation about my previous work for the on-site...",
    "The take-home assignment was time-consuming but interesting to work on...",
    "The interview focused heavily on data structures and algorithms...",
    "I was asked to critique an existing product and suggest improvements...",
    "The culture fit interview was very conversational and casual...",
    "They asked me to implement a feature on a whiteboard during the interview..."
  ];

  return Array.from({ length: count }).map((_, index) => {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const result = results[Math.floor(Math.random() * results.length)];
    
    // Generate a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const likes = Math.floor(Math.random() * 100);
    const comments = Math.floor(Math.random() * 30);
    
    const excerpt = excerpts[Math.floor(Math.random() * excerpts.length)];
    
    return {
      id: `interview-${index + 1}`,
      company,
      role,
      difficulty,
      result,
      date,
      likes,
      comments,
      excerpt
    };
  });
};

// Generate mock interviews
export const mockInterviews = generateMockInterviews(20);

// Get unique companies from mock interviews
export const getUniqueCompanies = (): string[] => {
  const companies = mockInterviews.map(interview => interview.company);
  return Array.from(new Set(companies));
};

// Filter interviews by company
export const filterInterviewsByCompany = (company: string | null): InterviewCardProps[] => {
  if (!company) return mockInterviews;
  return mockInterviews.filter(interview => interview.company === company);
};

// Get featured interviews (top 3 with most likes)
export const getFeaturedInterviews = (): InterviewCardProps[] => {
  return [...mockInterviews]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);
};
