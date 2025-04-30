// src/components/InterviewCard.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyBadge from "./CompanyBadge";

export interface InterviewCardProps {
  id: string;
  company: string;
  role: string;
  // Allow string for flexibility if needed, but keep specific types for common cases
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  result: 'Offer' | 'Rejected' | 'Pending' | 'Accepted' | string; // Added Accepted, allow string
  date: Date | string; // Allow string date from backend too
  likes?: number; // Make optional
  comments?: number; // Make optional
  excerpt?: string | null; // Allow null
  isFeatured?: boolean; // Optional prop to identify featured cards
}

// --- CORRECTED: Destructure isFeatured with a default value ---
const InterviewCard = ({
  id,
  company,
  role,
  difficulty,
  result,
  date,
  likes = 0, // Default values
  comments = 0, // Default values
  excerpt,
  isFeatured = false // Destructure and provide default
}: InterviewCardProps) => {

  // --- Helper to safely create a Date object ---
  const getDateObject = (dateInput: Date | string | undefined): Date | null => {
      if (!dateInput) return null;
      try {
          const d = new Date(dateInput);
          return isNaN(d.getTime()) ? null : d;
      } catch (e) {
          return null;
      }
  };

  const dateObject = getDateObject(date);

  // Determine badge color based on difficulty
  const difficultyString = typeof difficulty === 'string' ? difficulty.toLowerCase() : 'medium';
  const difficultyColor = {
      easy: "bg-green-100 text-green-800 hover:bg-green-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      hard: "bg-red-100 text-red-800 hover:bg-red-100",
      'very-hard': 'bg-red-200 text-red-900 border-red-300 hover:bg-red-200'
  }[difficultyString] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'; // Fallback

  // Determine badge color based on result
  const resultString = typeof result === 'string' ? result.toLowerCase() : 'pending';
  const displayResult = resultString === 'accepted' ? 'offer' : resultString; // Treat accepted as offer for color
   const resultColor = {
      offer: "bg-green-100 text-green-800 hover:bg-green-100",
      rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      pending: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  }[displayResult] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'; // Fallback


  // --- Determine link path based on isFeatured (using the destructured prop) ---
  const linkPath = isFeatured ? `/public/interview/${id}` : `/interview/${id}`;

  // --- Format difficulty/result for display ---
  const displayDifficulty = typeof difficulty === 'string' ? difficulty.replace(/^\w/, c => c.toUpperCase()) : 'N/A';
  const displayResultText = typeof result === 'string' ? result.replace(/^\w/, c => c.toUpperCase()) : 'N/A';


  return (
    // Use the dynamic linkPath
    <Link to={linkPath}>
      <Card className="h-full transition-all hover:shadow-md hover:border-brand-purple">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
          <div className="flex items-center space-x-3">
            <CompanyBadge name={company ?? 'N/A'} />
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">{company ?? 'Unknown'}</h3>
              <p className="text-sm text-gray-600">{role ?? 'Unknown Role'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
             <Badge className={difficultyColor} variant="outline">
               {displayDifficulty}
             </Badge>
             <Badge className={resultColor} variant="outline">
               {displayResultText}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
           {/* Added fallback for excerpt */}
          <p className="text-gray-600 line-clamp-3">{excerpt || "No details provided."}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-gray-500">
           {/* Use formatted date */}
          <span>{dateObject ? formatDistanceToNow(dateObject, { addSuffix: true }) : 'Date unknown'}</span>
          <div className="flex space-x-3">
            <span className="flex items-center">
              <ThumbsUp className="w-3 h-3 mr-1" />
              {likes}
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              {comments}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default InterviewCard;