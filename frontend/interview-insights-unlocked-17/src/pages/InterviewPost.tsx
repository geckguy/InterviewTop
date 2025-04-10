
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { mockInterviews } from "@/data/mockData";
import { InterviewCardProps } from "@/components/InterviewCard";
import { ArrowLeft, ThumbsUp, Share, MessageSquare, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CompanyBadge from "@/components/CompanyBadge";
import Navbar from "@/components/Navbar";

const InterviewPost = () => {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<InterviewCardProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [interviewSections] = useState([
    { 
      title: "Interview Process", 
      content: "The interview process consisted of 5 rounds. First, I had a phone screening with a recruiter where we discussed my background and the role. Next, I completed an online coding assessment with two algorithmic problems. Then, I had a technical interview with an engineer focused on data structures and algorithms. After that, I participated in a system design interview where I had to design a scalable application. The final round was a behavioral interview with the hiring manager, focusing on my past experiences and cultural fit."
    },
    { 
      title: "Technical Questions", 
      content: "During the technical interview, I was asked to solve problems related to arrays, linked lists, and dynamic programming. Some specific questions included implementing a function to reverse a linked list, finding the longest palindromic substring, and designing an efficient algorithm to merge k sorted arrays. For the system design portion, I was asked to design a distributed file storage system similar to Dropbox."
    },
    { 
      title: "Behavioral Questions", 
      content: "The behavioral interview focused on my past experiences and how I would handle specific situations. Questions included: 'Tell me about a time you had to resolve a conflict in your team', 'Describe a situation where you had to meet a tight deadline', and 'How do you handle feedback?'. They also asked about my interest in the company and what I knew about their products and culture."
    },
    { 
      title: "Tips and Advice", 
      content: "Based on my experience, I would recommend focusing on fundamental algorithms and data structures. Practice explaining your thought process clearly while coding. For system design, understand the basics of scalability, consistency, and reliability. For behavioral interviews, prepare specific examples from your experience using the STAR method (Situation, Task, Action, Result). Also, research the company thoroughly and be prepared to ask thoughtful questions."
    }
  ]);

  // Simulate loading the interview data
  useEffect(() => {
    const fetchInterview = async () => {
      setIsLoading(true);
      // In a real application, this would be an API call
      setTimeout(() => {
        const foundInterview = mockInterviews.find(interview => interview.id === id);
        setInterview(foundInterview || null);
        setIsLoading(false);
      }, 500);
    };

    fetchInterview();
  }, [id]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would submit the comment to an API
    console.log("Comment submitted:", comment);
    setComment("");
    // Add UI feedback
    alert("Comment submitted successfully!");
  };

  // Determine badge colors based on difficulty and result
  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    return {
      Easy: "bg-green-100 text-green-800 hover:bg-green-100",
      Medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      Hard: "bg-red-100 text-red-800 hover:bg-red-100",
    }[difficulty];
  };
  
  const getResultColor = (result: 'Offer' | 'Rejected' | 'Pending') => {
    return {
      Offer: "bg-green-100 text-green-800 hover:bg-green-100",
      Rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      Pending: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    }[result];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <p className="text-gray-500">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              This interview experience was not found. It may have been removed or the URL is incorrect.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link to="/explore">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="outline" asChild>
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="p-6 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <div className="flex items-start space-x-4">
                  <CompanyBadge name={interview.company} size="lg" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{interview.company}</h1>
                    <p className="text-lg text-gray-700">{interview.role}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDistanceToNow(interview.date, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getDifficultyColor(interview.difficulty)} variant="outline">
                    {interview.difficulty}
                  </Badge>
                  <Badge className={getResultColor(interview.result)} variant="outline">
                    {interview.result}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-6">{interview.excerpt}</p>
                  
                  {interviewSections.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-xl font-semibold mb-3 text-gray-800">{section.title}</h2>
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments section */}
            <Card>
              <CardHeader className="p-6">
                <h2 className="text-xl font-semibold">Comments ({interview.comments})</h2>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <Textarea 
                    placeholder="Share your thoughts or ask a question..." 
                    className="mb-3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button type="submit" disabled={!comment.trim()}>
                    Post Comment
                  </Button>
                </form>
                
                <div className="space-y-4">
                  {/* Mock comments */}
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">Jane Smith</span>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-gray-700">Thanks for sharing your experience! Did you do any specific preparation for the system design part?</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">Mike Johnson</span>
                      <span className="text-sm text-gray-500">4 days ago</span>
                    </div>
                    <p className="text-gray-700">I had a similar experience with their behavioral questions. I think they really value teamwork and communication skills.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="p-6">
                <h3 className="text-lg font-semibold">Actions</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-3">
                  <Button variant="outline" className="justify-start">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like ({interview.likes})
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <h3 className="text-lg font-semibold">Similar Interviews</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockInterviews
                    .filter(item => item.company === interview.company && item.id !== interview.id)
                    .slice(0, 3)
                    .map((item, index) => (
                      <Link key={index} to={`/interview/${item.id}`} className="block">
                        <div className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-900">{item.role}</span>
                            <Badge className={getResultColor(item.result)} variant="outline">
                              {item.result}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(item.date, { addSuffix: true })}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPost;
