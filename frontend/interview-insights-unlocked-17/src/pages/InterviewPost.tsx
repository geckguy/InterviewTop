import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardTitle
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Share, MessageSquare, Bookmark, Code, Briefcase, MapPin, ExternalLink } from "lucide-react"; // Added more icons
import { formatDistanceToNow } from "date-fns";
import CompanyBadge from "@/components/CompanyBadge";
import Navbar from "@/components/Navbar";
import { toCard } from "@/utils/mapInterview";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator"; // Import Separator
import SyntaxHighlighter from 'react-syntax-highlighter'; // For code highlighting
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Choose a style


import { fetchInterview, fetchSimilar } from "@/api/interviews";
// Make sure your InterviewExperience type includes the nested structures
import { InterviewExperience, InterviewRound, LeetcodeQuestion, DesignQuestion } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

// Helper to determine badge color based on difficulty
const getDifficultyBadgeClass = (difficulty?: string | null): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
    case 'very-hard': return 'bg-red-200 text-red-900 border-red-300 hover:bg-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
  }
};

// Helper to determine badge color based on result/offer_status
const getResultBadgeClass = (result?: string | null): string => {
  switch (result?.toLowerCase()) {
    case 'offer':
    case 'accepted': // Handle variations if needed
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
    case 'pending':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
  }
};


const InterviewPost = () => {
  const { id = "" } = useParams();
  const [interview, setInterview] = useState<InterviewExperience | null>(null);
  const [similar, setSimilar] = useState<InterviewCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[InterviewPost] Fetching data for ID: ${id}`);
        const data = await fetchInterview(id);
        console.log("[InterviewPost] Interview data fetched:", JSON.stringify(data, null, 2)); // Log fetched data clearly
        setInterview(data);

        const similarData = await fetchSimilar(id, 3);
        console.log("[InterviewPost] Similar data fetched:", similarData);
        setSimilar(similarData.map(toCard));

      } catch (err: any) {
        console.error("[InterviewPost] Error fetching data:", err);
        let message = "Failed to load interview details.";
        if (err.response?.status === 404) {
          message = "Interview not found.";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
           message = "Unauthorized. Please log in.";
        } else if (err.message) {
          message = err.message;
        }
        setError(message);
        setInterview(null);
        setSimilar([]);
      } finally {
        console.log("[InterviewPost] Fetching complete, setting loading to false.");
        setLoading(false);
      }
    })();
  }, [id]);

  // --- Loading State ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
        <Footer />
      </>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // --- Not Found State ---
  if (!interview) {
    // This should ideally only be hit if API returns success but no data
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center">
          <Alert className="max-w-md">
            <AlertDescription>Interview data could not be loaded.</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // --- Main Content Display ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="outline" asChild className="mb-6">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* --- Core Interview Info Card --- */}
              <Card>
                <CardHeader className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start space-x-4 flex-grow">
                    <CompanyBadge name={interview.company ?? 'N/A'} size="lg" />
                    <div className="flex-grow">
                      <h1 className="text-2xl font-bold mb-1">{interview.company}</h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                         {interview.position && (
                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {interview.position}</span>
                         )}
                         {interview.seniority && (
                            <span className="flex items-center"><Code className="w-4 h-4 mr-1.5" /> {interview.seniority}</span>
                         )}
                         {interview.location && ( // Only show if location is truthy (not false or null)
                             <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {interview.location}</span>
                         )}
                      </div>
                    </div>
                  </div>
                  {/* Badges and Date */}
                  <div className="flex flex-col items-start sm:items-end space-y-2 flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                       <Badge variant="outline" className={getDifficultyBadgeClass(interview.difficulty)}>
                         {interview.difficulty ? interview.difficulty.replace(/^\w/, c => c.toUpperCase()) : 'N/A'}
                       </Badge>
                       <Badge variant="outline" className={getResultBadgeClass(interview.offer_status)}>
                         {interview.offer_status ? interview.offer_status.replace(/^\w/, c => c.toUpperCase()) : 'N/A'}
                       </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {interview.createdAt
                        ? (() => {
                          try {
                            const dateObj = new Date(interview.createdAt);
                            if (!isNaN(dateObj.getTime())) {
                              return `Posted ${formatDistanceToNow(dateObj, { addSuffix: true })}`;
                            }
                          } catch (e) { console.error("Error parsing date:", interview.createdAt, e); }
                          return 'Date unavailable';
                        })()
                        : 'Date unavailable'
                      }
                    </p>
                  </div>
                </CardHeader>
                {/* Excerpt/Summary if available */}
                {interview.quality_reasoning && (
                   <>
                     <Separator />
                     <CardContent className="p-6">
                       <p className="text-gray-700 italic">{interview.quality_reasoning}</p>
                     </CardContent>
                   </>
                )}
              </Card>

              {/* --- Interview Rounds Details --- */}
              {interview.interview_details && interview.interview_details.length > 0 && (
                <Card>
                  <CardHeader className="p-6">
                    <CardTitle>Interview Process</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    {interview.interview_details.map((round: InterviewRound) => (
                      <div key={round.round_number} className="pb-4 border-b last:border-b-0">
                        <h4 className="text-md font-semibold mb-2">
                          Round {round.round_number}{round.type ? `: ${round.type}` : ''}
                        </h4>
                        {round.questions && round.questions.length > 0 && (
                          <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                            {round.questions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* --- LeetCode Questions --- */}
              {interview.leetcode_questions && interview.leetcode_questions.length > 0 && (
                <Card>
                  <CardHeader className="p-6">
                     <CardTitle>Technical Questions (Coding)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    {interview.leetcode_questions.map((lc: LeetcodeQuestion, index: number) => (
                      <div key={`lc-${index}`} className="pb-4 border-b last:border-b-0">
                        {lc.problem_name && <h4 className="text-md font-semibold mb-2">{lc.problem_name}</h4>}
                        {lc.problem_statement && (
                          <div className="prose prose-sm max-w-none mb-3">
                            <p className="font-medium text-gray-800">Problem:</p>
                            {/* Render problem statement carefully, maybe use markdown parser if needed */}
                            <pre className="whitespace-pre-wrap font-sans text-gray-700">{lc.problem_statement}</pre>
                          </div>
                        )}
                        {lc.function_signature && (
                          <div className="mb-3">
                             <p className="text-sm font-medium text-gray-800 mb-1">Function Signature:</p>
                             <SyntaxHighlighter language="cpp" style={atomOneDark} customStyle={{ padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {lc.function_signature}
                             </SyntaxHighlighter>
                          </div>
                        )}
                        {lc.test_cases && lc.test_cases.length > 0 && (
                          <div className="text-sm">
                             <p className="font-medium text-gray-800 mb-2">Test Cases:</p>
                             {lc.test_cases.map((tc, tc_index) => (
                               <div key={`tc-${tc_index}`} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                                 <p><strong className="text-gray-600">Input:</strong> <code className="text-xs">{String(tc.input)}</code></p>
                                 <p><strong className="text-gray-600">Output:</strong> <code className="text-xs">{String(tc.output)}</code></p>
                                 {tc.explanation && <p className="mt-1"><strong className="text-gray-600">Explanation:</strong> <span className="text-gray-700">{tc.explanation}</span></p>}
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* --- System Design Questions --- */}
              {interview.design_questions && interview.design_questions.length > 0 && (
                 <Card>
                   <CardHeader className="p-6">
                     <CardTitle>System Design Questions</CardTitle>
                   </CardHeader>
                   <CardContent className="p-6 pt-0 space-y-6">
                     {interview.design_questions.map((dq: DesignQuestion, index: number) => (
                       <div key={`dq-${index}`} className="pb-4 border-b last:border-b-0">
                          {dq.design_task && <h4 className="text-md font-semibold mb-2">{dq.design_task}</h4>}
                          {dq.description && <p className="text-sm text-gray-700 mb-3">{dq.description}</p>}
                          {dq.guiding_questions && dq.guiding_questions.length > 0 && (
                            <>
                             <p className="text-sm font-medium text-gray-800 mb-1">Guiding Questions / Considerations:</p>
                             <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                               {dq.guiding_questions.map((gq, gq_index) => <li key={`gq-${gq_index}`}>{gq}</li>)}
                             </ul>
                            </>
                          )}
                       </div>
                     ))}
                   </CardContent>
                 </Card>
              )}

               {/* --- Problem Links --- */}
              {interview.problem_link && interview.problem_link.length > 0 && (
                <Card>
                  <CardHeader className="p-6">
                    <CardTitle>Relevant Links</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                     <ul className="space-y-2">
                       {interview.problem_link.map((link, index) => (
                         <li key={index}>
                           <a
                             href={String(link)} // Ensure it's a string
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1.5"
                           >
                             <ExternalLink className="w-4 h-4" />
                             {String(link)}
                           </a>
                         </li>
                       ))}
                     </ul>
                  </CardContent>
                </Card>
              )}

            </div> {/* End Main Content Column */}

            {/* Sidebar Column */}
            <aside className="space-y-6">
              {/* Actions Card */}
              <Card>
                <CardHeader className="p-6">
                  <CardTitle>Actions</CardTitle> {/* Changed from h3 */}
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsUp className="h-4 w-4 mr-2" /> Like {/* Add onClick handler */}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bookmark className="h-4 w-4 mr-2" /> Save {/* Add onClick handler */}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="h-4 w-4 mr-2" /> Share {/* Add onClick handler */}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" /> Comment {/* Add onClick handler */}
                  </Button>
                </CardContent>
              </Card>

              {/* Similar Interviews Card */}
              <Card>
                <CardHeader className="p-6">
                   <CardTitle>Similar Interviews</CardTitle> {/* Changed from h3 */}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {similar.length > 0 ? (
                    similar.map(s => (
                      <Link key={s.id} to={`/interview/${s.id}`} className="block group">
                        <div className="p-3 border rounded-md group-hover:bg-gray-50 group-hover:border-gray-300 transition">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="text-sm font-medium group-hover:text-brand-purple">{s.company} - {s.role}</span>
                            <Badge variant="outline" className={`${getResultBadgeClass(s.result)} text-xs`}>{s.result}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {s.date && !isNaN(s.date.getTime())
                              ? formatDistanceToNow(s.date, { addSuffix: true })
                              : 'Date unavailable'
                            }
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center">No similar interviews found.</p>
                  )}
                </CardContent>
              </Card>
            </aside> {/* End Sidebar Column */}
          </div> {/* End Grid */}
        </div> {/* End Container */}
      </div> {/* End Outer Wrapper */}
      <Footer />
    </>
  );
};

export default InterviewPost;