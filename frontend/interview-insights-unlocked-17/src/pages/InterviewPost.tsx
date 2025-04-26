// --- START OF FILE InterviewPost.tsx ---
// (Updated with save/unsave functionality as requested)

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
// Added Bookmark icons
import { ArrowLeft, Code, Briefcase, MapPin, ExternalLink, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CompanyBadge from "@/components/CompanyBadge";
import Navbar from "@/components/Navbar";
import { toCard } from "@/utils/mapInterview";
import { Separator } from "@/components/ui/separator";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import query/mutation hooks
import { useToast } from "@/components/ui/use-toast"; // Import useToast

// Import new API functions
import { fetchInterview, fetchSimilar, fetchSaveStatus, savePost, unsavePost } from "@/api/interviews";
// Import only the type that is exported from backend.ts
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

// Helper functions (getDifficultyBadgeClass, getResultBadgeClass) remain the same...
const getDifficultyBadgeClass = (difficulty?: string | null): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
    case 'very-hard': return 'bg-red-200 text-red-900 border-red-300 hover:bg-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
  }
};

const getResultBadgeClass = (result?: string | null): string => {
  switch (result?.toLowerCase()) {
    case 'offer':
    case 'accepted':
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get query client instance
  const { toast } = useToast(); // Initialize toast

  const [interview, setInterview] = useState<InterviewExperience | null>(null);
  const [similar, setSimilar] = useState<InterviewCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Query for save status ---
  const { data: isSaved, isLoading: isLoadingSaveStatus } = useQuery<boolean>({
      queryKey: ['saveStatus', id], // Query key includes the post ID
      queryFn: () => fetchSaveStatus(id!), // Fetch status using API function
      enabled: !!id && !loading, // Enable only when ID is valid and main interview loaded
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // --- Mutations for save/unsave ---
  const saveMutation = useMutation({
      mutationFn: () => savePost(id!),
      onSuccess: () => {
          toast({ title: "Post Saved!", description: "Added to your saved list." });
          // Invalidate the save status query to refetch
          queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });
          // Invalidate the saved posts list query for the dashboard
          queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      },
      onError: (err: any) => {
          console.error("Save Error:", err);
          toast({ title: "Error Saving", description: err?.response?.data?.detail || "Could not save post.", variant: "destructive" });
      },
  });

  const unsaveMutation = useMutation({
      mutationFn: () => unsavePost(id!),
      onSuccess: () => {
          toast({ title: "Post Unsaved", description: "Removed from your saved list." });
          queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });
          queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      },
      onError: (err: any) => {
           console.error("Unsave Error:", err);
          toast({ title: "Error Unsaving", description: err?.response?.data?.detail || "Could not unsave post.", variant: "destructive" });
      },
  });

  // --- Main Data Fetching Effect ---
  useEffect(() => {
      // Reset state...
      setInterview(null); setSimilar([]); setLoading(true); setLoadingSimilar(true); setError(null);
      // Invalidate previous save status when ID changes to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });

      if (!id) {
        console.warn("[InterviewPost] ID is missing, skipping fetch.");
        setError("Interview ID is missing in the URL.");
        setLoading(false); setLoadingSimilar(false);
        return;
      }

      let isMounted = true;
      const loadData = async () => {
          try {
              // Remove detailed console logging
              // Fetch interview and similar posts
              const [interviewData, similarData] = await Promise.all([
                  fetchInterview(id).catch(err => {
                      // Keep error logging, but without details
                      console.error("[InterviewPost] Error fetching interview");
                      if (err.response?.status === 404) throw new Error("Interview not found.");
                      if (err.response?.status === 401 || err.response?.status === 403) throw new Error("Unauthorized. Please log in.");
                      throw new Error("Failed to load interview details.");
                  }),
                  fetchSimilar(id, 3).catch(err => {
                      console.warn("[InterviewPost] Error fetching similar interviews");
                      return [];
                  })
              ]);

              if (isMounted) {
                  // Remove console logging of interview data
                  setInterview(interviewData); 
                  setLoading(false);

                  // Remove console logging of similar data
                  setSimilar(similarData.map(toCard)); 
                  setLoadingSimilar(false);
              }
          } catch (err: any) {
              console.error("[InterviewPost] Error in loadData");
              if (isMounted) {
                  setError(err.message || "An unexpected error occurred.");
                  setInterview(null); setSimilar([]);
                  setLoading(false); setLoadingSimilar(false);
              }
          }
      };
      loadData();
      return () => { isMounted = false; };
  }, [id, queryClient]); // Add queryClient to dependencies

  // --- Loading State ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
            <span className="ml-3">Loading Interview...</span>
        </div>
        
      </>
    );
  }

  // --- Error State ---
  if (error) {
     return (
       <>
         <Navbar />
         <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
           <Alert variant="destructive" className="max-w-md mb-4">
             <AlertDescription>{error}</AlertDescription>
           </Alert>
           <Button onClick={() => navigate('/search')}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
           </Button>
         </div>
         
       </>
     );
   }

  // --- Fallback if interview is null after loading/error handling ---
  if (!interview) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <Alert className="max-w-md mb-4">
            <AlertDescription>Interview data could not be loaded or does not exist.</AlertDescription>
          </Alert>
           <Button onClick={() => navigate('/search')}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
           </Button>
        </div>
        
      </>
    );
  }

  // --- Toggle Save Function ---
  const handleToggleSave = () => {
      if (isLoadingSaveStatus || saveMutation.isPending || unsaveMutation.isPending) return; // Prevent rapid clicks

      if (isSaved) {
          unsaveMutation.mutate();
      } else {
          saveMutation.mutate();
      }
  };

  // --- Main Content Display ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* --- Top Bar: Back and Save Buttons --- */}
          <div className="flex justify-between items-center mb-6">
             <Button variant="outline" onClick={() => navigate('/search')}>
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
             </Button>
             {/* Save/Unsave Button */}
             <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleSave}
                  disabled={isLoadingSaveStatus || saveMutation.isPending || unsaveMutation.isPending}
                  aria-label={isSaved ? "Unsave Post" : "Save Post"}
                  // Add conditional styling for saved state
                  className={`transition-colors ${
                      isSaved
                      ? "border-brand-purple text-brand-purple bg-brand-purple-light hover:bg-brand-purple-light/80"
                      : "border-gray-300 text-gray-500 hover:bg-gray-100"
                  }`}
              >
                  {isLoadingSaveStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSaved ? (
                      <BookmarkCheck className="h-5 w-5" />
                  ) : (
                      <Bookmark className="h-5 w-5" />
                  )}
              </Button>
          </div>

          {/* --- Main Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* --- Core Interview Info Card --- */}
              <Card>
                 <CardHeader className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                   <div className="flex items-start space-x-4 flex-grow min-w-0">
                     <CompanyBadge name={interview.company ?? 'N/A'} size="lg" />
                     <div className="flex-grow min-w-0">
                       <h1 className="text-2xl font-bold mb-1 truncate">{interview.company}</h1>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          {interview.position && ( <span className="flex items-center flex-shrink-0"><Briefcase className="w-4 h-4 mr-1.5" /> {interview.position}</span> )}
                          {interview.seniority && ( <span className="flex items-center flex-shrink-0"><Code className="w-4 h-4 mr-1.5" /> {interview.seniority}</span> )}
                          {interview.location && ( <span className="flex items-center flex-shrink-0"><MapPin className="w-4 h-4 mr-1.5" /> {interview.location}</span> )}
                       </div>
                     </div>
                   </div>
                   <div className="flex flex-col items-start sm:items-end space-y-2 flex-shrink-0 pt-2 sm:pt-0">
                     <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
                           try { const dateObj = new Date(interview.createdAt); return !isNaN(dateObj.getTime()) ? `Posted ${formatDistanceToNow(dateObj, { addSuffix: true })}` : 'Invalid Date'; } catch (e) { return 'Date Error'; }
                         })()
                         : 'Date unavailable'
                       }
                     </p>
                   </div>
                 </CardHeader>
                 {/* Summary/Reasoning */}
                 {interview.quality_reasoning && (
                    <>
                      <Separator />
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-2 text-gray-700">Summary / Overview:</h3>
                        <p className="text-gray-700 italic whitespace-pre-wrap">{interview.quality_reasoning}</p>
                      </CardContent>
                    </>
                 )}
              </Card>

              {/* --- Interview Rounds Details --- */}
              {interview.interview_details && Array.isArray(interview.interview_details) && interview.interview_details.length > 0 && (
                  <Card>
                    <CardHeader className="p-6"><CardTitle>Interview Process</CardTitle></CardHeader>
                    <CardContent className="p-6 pt-0 space-y-6">
                      {(interview.interview_details as any[]).map((round, idx) => ( // Use any[] instead of InterviewRound[]
                        <div key={`round-${idx}`} className="pb-4 border-b last:border-b-0">
                          <h4 className="text-md font-semibold mb-2">
                            {/* Handle potentially missing round_number gracefully */}
                            {typeof round.round_number === 'number' ? `Round ${round.round_number}` : 'Round Details'}
                            {round.type ? `: ${round.type}` : ''}
                          </h4>
                          {round.questions && Array.isArray(round.questions) && round.questions.length > 0 && (
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
              {/* Conditional rendering and structure remains the same */}
              {interview.leetcode_questions && Array.isArray(interview.leetcode_questions) && interview.leetcode_questions.length > 0 && (
                  <Card>
                      <CardHeader className="p-6"><CardTitle>Technical Questions (Coding)</CardTitle></CardHeader>
                      <CardContent className="p-6 pt-0 space-y-6">
                          {(interview.leetcode_questions as any[]).map((lc, index) => ( // Use any[] instead of LeetcodeQuestion[]
                              <div key={`lc-${index}`} className="pb-4 border-b last:border-b-0">
                                  {/* Problem Name */}
                                  {lc.problem_name && <h4 className="text-md font-semibold mb-2">{lc.problem_name}</h4>}
                                  {/* Problem Statement */}
                                  {lc.problem_statement && (
                                      <div className="prose prose-sm max-w-none mb-3">
                                          <p className="font-medium text-gray-800">Problem:</p>
                                          <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 text-sm">{lc.problem_statement}</pre>
                                      </div>
                                  )}
                                  {/* Function Signature */}
                                  {lc.function_signature && (
                                      <div className="mb-3">
                                          <p className="text-sm font-medium text-gray-800 mb-1">Function Signature:</p>
                                          <SyntaxHighlighter language="cpp" style={atomOneDark} customStyle={{ padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                              {lc.function_signature}
                                          </SyntaxHighlighter>
                                      </div>
                                  )}
                                  {/* Test Cases */}
                                  {lc.test_cases && Array.isArray(lc.test_cases) && lc.test_cases.length > 0 && (
                                      <div className="text-sm">
                                          <p className="font-medium text-gray-800 mb-2">Test Cases:</p>
                                          {(lc.test_cases as any[]).map((tc, tc_index) => ( // Use any[] instead of TestCase[]
                                              <div key={`tc-${tc_index}`} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                                                  <p><strong className="text-gray-600">Input:</strong> <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{JSON.stringify(tc.input)}</code></p>
                                                  <p><strong className="text-gray-600">Output:</strong> <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{JSON.stringify(tc.output)}</code></p>
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
              {/* Conditional rendering and structure remains the same */}
              {interview.design_questions && Array.isArray(interview.design_questions) && interview.design_questions.length > 0 && (
                 <Card>
                   <CardHeader className="p-6"><CardTitle>System Design Questions</CardTitle></CardHeader>
                   <CardContent className="p-6 pt-0 space-y-6">
                     {(interview.design_questions as any[]).map((dq, index) => ( // Use any[] instead of DesignQuestion[]
                       <div key={`dq-${index}`} className="pb-4 border-b last:border-b-0">
                          {dq.design_task && <h4 className="text-md font-semibold mb-2">{dq.design_task}</h4>}
                          {dq.description && <p className="text-sm text-gray-700 mb-3">{dq.description}</p>}
                          {dq.guiding_questions && Array.isArray(dq.guiding_questions) && dq.guiding_questions.length > 0 && (
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
               {/* Conditional rendering and structure remains the same */}
              {interview.problem_link && Array.isArray(interview.problem_link) && interview.problem_link.length > 0 && (
                <Card>
                  <CardHeader className="p-6"><CardTitle>Relevant Links</CardTitle></CardHeader>
                  <CardContent className="p-6 pt-0">
                     <ul className="space-y-2">
                       {interview.problem_link.map((link, index) => (
                         <li key={index}>
                           <a href={String(link)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1.5 break-all">
                             <ExternalLink className="w-4 h-4 flex-shrink-0" />
                             {String(link)}
                           </a>
                         </li>
                       ))}
                     </ul>
                  </CardContent>
                </Card>
              )}

            </div> {/* End Main Content Column */}

            {/* --- Sidebar Column --- */}
            <aside className="space-y-6">
              {/* Similar Interviews Card */}
              {/* Loading state */}
              {loadingSimilar && (
                  <Card>
                      <CardHeader className="p-6"><CardTitle>Similar Interviews</CardTitle></CardHeader>
                      <CardContent className="p-6 space-y-4 animate-pulse">
                          {[...Array(2)].map((_, i) => (
                               <div key={i} className="p-3 border rounded-md space-y-2">
                                   <div className="flex justify-between items-center"><div className="h-4 w-3/5 bg-gray-200 rounded"></div><div className="h-4 w-1/5 bg-gray-200 rounded"></div></div>
                                   <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                               </div>
                           ))}
                      </CardContent>
                  </Card>
              )}

              {/* Display similar interviews */}
              {!loadingSimilar && similar.length > 0 && (
                 <Card>
                   <CardHeader className="p-6"><CardTitle>Similar Interviews</CardTitle></CardHeader>
                   <CardContent className="p-6 space-y-4">
                     {similar.map(s => (
                         <Link key={s.id} to={`/interview/${s.id}`} className="block group">
                           <div className="p-3 border rounded-md group-hover:bg-gray-50 group-hover:border-gray-300 transition">
                             <div className="flex justify-between items-start mb-1 gap-2">
                               <span className="text-sm font-medium group-hover:text-brand-purple">{s.company} - {s.role}</span>
                               <Badge variant="outline" className={`${getResultBadgeClass(s.result)} text-xs flex-shrink-0`}>{s.result}</Badge>
                             </div>
                             <p className="text-xs text-gray-500">
                               {s.date && !isNaN(new Date(s.date).getTime()) ? formatDistanceToNow(new Date(s.date), { addSuffix: true }) : 'Date unavailable'}
                             </p>
                           </div>
                         </Link>
                       ))
                     }
                   </CardContent>
                 </Card>
              )}

              {/* No similar interviews found */}
              {!loadingSimilar && similar.length === 0 && (
                 <p className="text-sm text-gray-500 text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">No similar interviews found for this company.</p>
              )}

            </aside> {/* End Sidebar Column */}
          </div> {/* End Grid */}
        </div> {/* End Container */}
      </div> {/* End Outer Wrapper */}
      
    </>
  );
};

export default InterviewPost;