
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  result: 'Offer' | 'Rejected' | 'Pending';
  date: Date;
  likes: number;
  comments: number;
  excerpt: string;
}

const InterviewCard = ({ 
  id, 
  company, 
  role, 
  difficulty, 
  result, 
  date, 
  likes, 
  comments, 
  excerpt 
}: InterviewCardProps) => {
  // Determine badge color based on difficulty
  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 hover:bg-green-100",
    Medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Hard: "bg-red-100 text-red-800 hover:bg-red-100",
  }[difficulty];
  
  // Determine badge color based on result
  const resultColor = {
    Offer: "bg-green-100 text-green-800 hover:bg-green-100",
    Rejected: "bg-red-100 text-red-800 hover:bg-red-100",
    Pending: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  }[result];

  return (
    <Link to={`/interview/${id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-brand-purple">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
          <div className="flex items-center space-x-3">
            <CompanyBadge name={company} />
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">{company}</h3>
              <p className="text-sm text-gray-600">{role}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={difficultyColor} variant="outline">
              {difficulty}
            </Badge>
            <Badge className={resultColor} variant="outline">
              {result}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-600 line-clamp-3">{excerpt}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-gray-500">
          <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
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
