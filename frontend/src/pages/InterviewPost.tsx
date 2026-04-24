// --- START OF FILE InterviewPost.tsx ---
// (UPDATED based on user request to show full details for hardcoded featured posts)

import React, { useEffect, useState } from "react"; // Import React
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Briefcase, MapPin, ExternalLink, Loader2, Bookmark, BookmarkCheck, Lock } from "lucide-react"; // Added Lock
import { formatDistanceToNow } from "date-fns";
import CompanyBadge from "@/components/interview/CompanyBadge";
import Navbar from "@/components/layout/Navbar";
import { Separator } from "@/components/ui/separator";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

import { fetchInterview, fetchSimilar, fetchSaveStatus, savePost, unsavePost } from "@/api/interviews";
// Import BOTH types, InterviewExperience is primary now
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/interview/InterviewCard";
// --- Import hardcoded FULL data ---
// *** IMPORTANT: Ensure featuredPosts.ts now exports InterviewExperience[] with full data ***
import { hardcodedFeaturedPosts } from "@/data/featuredPosts";

interface InterviewPostProps {
  isPublic?: boolean; // Optional prop passed from router
}

// Helper functions for badge styling (remain the same)
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
    const lowerResult = result?.toLowerCase();
    if (lowerResult === 'offer' || lowerResult === 'accepted') { return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'; }
    if (lowerResult === 'rejected') { return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'; }
    if (lowerResult === 'pending') { return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100'; }
    return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
};

// --- Main Component ---
const InterviewPost: React.FC<InterviewPostProps> = ({ isPublic = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // --- State ---
  // UPDATED: State now holds the full InterviewExperience if loaded
  const [interviewData, setInterviewData] = useState<InterviewExperience | null>(null);
  const [similar, setSimilar] = useState<InterviewCardProps[]>([]); // Similar are still cards
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  // Find featured post data (assuming it now contains full InterviewExperience details)
  const featuredPostData = hardcodedFeaturedPosts.find(
      post => post.id === id || post._id?.$oid === id // Match either id or _id.$oid
  );
  // REMOVED: shouldFetchFromApi is no longer needed with the simplified logic

  // --- Helper to get props safely ---
  // UPDATED: Key type is now InterviewExperience, fallback logic is the same
  const getProp = (key: keyof InterviewExperience, fallback: any = undefined) => {
      const value = (interviewData && typeof interviewData === 'object' && key in interviewData)
             ? (interviewData as any)[key]
             : undefined;
      return value ?? fallback;
  };

  // --- Authentication Check Effect ---
  // UPDATED: Login required only if not public, not authenticated, AND not a featured post
  useEffect(() => {
    if (!isPublic && !isAuthenticated && !featuredPostData) {
      console.log("[InterviewPost] Authentication required for non-public, non-featured post.");
      setRequiresLogin(true);
      setLoading(false); setLoadingSimilar(false);
    } else {
      setRequiresLogin(false);
    }
  }, [isPublic, isAuthenticated, featuredPostData]); // Added featuredPostData dependency

  // --- Conditional Data Fetching Effect (UPDATED) ---
  useEffect(() => {
    setInterviewData(null); setSimilar([]); setLoading(true); setLoadingSimilar(true); setError(null);

    if (!isPublic && isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });
    }

    if (!id) { setError("Interview ID is missing."); setLoading(false); setLoadingSimilar(false); return; }
    if (requiresLogin) { setLoading(false); setLoadingSimilar(false); return; }

    let isMounted = true;
    const loadData = async () => {
        console.log(`[InterviewPost] Loading data for ID: ${id}. Featured: ${!!featuredPostData}`);
        try {
            let loadedInterviewData: InterviewExperience | null = null;
            let shouldFetchSimilar = false; // Flag to control similar posts fetching

            // Case 1: It's a hardcoded featured post. Use the full data directly.
            if (featuredPostData) {
                console.log("[InterviewPost] Using hardcoded full data for featured post:", id);
                loadedInterviewData = featuredPostData; // Use the full data object
                // Fetch similar only if authenticated, even for featured posts
                if (isAuthenticated) {
                    shouldFetchSimilar = true;
                } else {
                    setLoadingSimilar(false); // Skip similar if not logged in
                }
            }
            // Case 2: Not a featured post. Fetch from API.
            else {
                 // Requires auth if not public, otherwise allows fetch
                 if (isAuthenticated || isPublic) {
                    console.log(`[InterviewPost] Fetching API data for non-featured ID: ${id}`);
                    loadedInterviewData = await fetchInterview(id).catch(err => {
                        console.error("[InterviewPost] Error fetching interview:", err.response?.status, err.message);
                        if (err.response?.status === 404) throw new Error("Interview not found.");
                        if (err.response?.status === 401 || err.response?.status === 403) {
                            setRequiresLogin(true); // Force login if API denies access
                            throw new Error("Unauthorized.");
                        }
                        throw new Error("Failed to load interview details.");
                    });
                     // Fetch similar only if authenticated when fetching from API
                    if (isAuthenticated) {
                        shouldFetchSimilar = true;
                    } else {
                        setLoadingSimilar(false); // Skip similar if not logged in
                    }
                 } else {
                     // Handled by requiresLogin check at the start
                     console.warn("[InterviewPost] Access blocked for non-featured, non-public post.");
                 }
            }

            // Fetch Similar Posts if flagged
             let loadedSimilarData: InterviewCardProps[] = [];
             if (shouldFetchSimilar) {
                 console.log("[InterviewPost] Fetching similar interviews for ID:", id);
                 loadedSimilarData = await fetchSimilar(id, 3)
                    .then(data => data.map((e: any) => ({ // Map to CardProps
                        id: e._id?.$oid || e._id || e.id || `similar-${Math.random()}`,
                        company: e.company ?? "Unknown",
                        role: e.position ?? "Unknown role",
                        difficulty: (e.difficulty ?? "Medium") as InterviewCardProps['difficulty'],
                        result: (e.offer_status ?? "Pending") as InterviewCardProps['result'],
                        date: e.createdAt ? new Date(e.createdAt) : new Date(),
                        likes: e.likes ?? 0, comments: e.comments ?? 0,
                        excerpt: e.quality_reasoning ?? "",
                        isFeatured: false
                    })))
                    .catch(err => {
                         console.warn("[InterviewPost] Failed to fetch similar interviews:", err);
                         return [];
                    });
             }

            if (isMounted) {
                setInterviewData(loadedInterviewData);
                setSimilar(loadedSimilarData);
                setLoading(false);
                setLoadingSimilar(false); // Similar loading is complete (fetched or skipped)
            }

        } catch (err: any) {
            console.error("[InterviewPost] Error during data load:", err);
            if (isMounted) {
                if (err.message !== "Unauthorized.") { setError(err.message || "An unexpected error occurred."); }
                setLoading(false); setLoadingSimilar(false);
            }
        }
    };

    if (!requiresLogin) { loadData(); }

    return () => { isMounted = false; };
  }, [id, queryClient, isPublic, isAuthenticated, requiresLogin, featuredPostData]); // Added featuredPostData


  // --- Save Status Query ---
  // Logic remains the same: only enabled if authenticated AND not public
  const { data: isSaved, isLoading: isLoadingSaveStatus } = useQuery<boolean>({
    queryKey: ['saveStatus', id],
    queryFn: () => fetchSaveStatus(id!),
    enabled: !!id && isAuthenticated && !isPublic && !requiresLogin,
    staleTime: 5 * 60 * 1000,
  });

  // --- Save/Unsave Mutations ---
  // No changes needed
  const saveMutation = useMutation({
    mutationFn: () => savePost(id!),
    onSuccess: () => {
        toast({ title: "Post Saved!", description: "Added to your saved list." });
        queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });
        queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
    onError: (err: any) => { /* ... error handling ... */ },
  });
  const unsaveMutation = useMutation({
    mutationFn: () => unsavePost(id!),
    onSuccess: () => {
        toast({ title: "Post Unsaved", description: "Removed from your saved list." });
        queryClient.invalidateQueries({ queryKey: ['saveStatus', id] });
        queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
    onError: (err: any) => { /* ... error handling ... */ },
  });
  const handleToggleSave = () => {
    if (!isAuthenticated || isPublic || isLoadingSaveStatus || saveMutation.isPending || unsaveMutation.isPending) return;
    if (isSaved) { unsaveMutation.mutate(); } else { saveMutation.mutate(); }
  };

  // --- RENDER STATES ---
   if (requiresLogin) { /* ... (Render Login Prompt as before) ... */
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                    <Card className="p-8 max-w-md shadow-lg">
                        <CardHeader><CardTitle className="text-center text-xl font-semibold">Access Restricted</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6">Please sign in to view this interview experience.</p>
                            <Button onClick={() => navigate('/signin', { state: { from: location } })}> <Lock className="mr-2 h-4 w-4" /> Sign In to Continue </Button>
                            <p className="text-xs text-gray-500 mt-4"> Don't have an account? <Link to="/signup" state={{ from: location }} className="text-blue-600 hover:underline">Sign Up</Link> </p>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
   if (loading) { /* ... (Render Loading Spinner as before) ... */
        return ( <> <Navbar /> <div className="min-h-screen flex items-center justify-center"> <Loader2 className="h-8 w-8 animate-spin text-brand-purple" /> <span className="ml-3">Loading Interview...</span> </div> </> );
    }
   if (error) { /* ... (Render Error Alert as before) ... */
        return ( <> <Navbar /> <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4 text-center"> <Alert variant="destructive" className="max-w-md mb-4"> <AlertDescription>{error}</AlertDescription> </Alert> <Button onClick={() => navigate(isPublic && !featuredPostData ? '/' : '/search')}> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button> </div> </> );
    }
   if (!interviewData) { /* ... (Render No Data Alert as before) ... */
        return ( <> <Navbar /> <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4 text-center"> <Alert className="max-w-md mb-4"> <AlertDescription>Interview data could not be loaded or does not exist.</AlertDescription> </Alert> <Button onClick={() => navigate(isPublic && !featuredPostData ? '/' : '/search')}> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button> </div> </> );
    }

  // --- Prepare Data for Display (using full InterviewExperience data) ---
  const companyName = getProp('company', 'N/A');
  const position = getProp('position', null); // Use 'position' from InterviewExperience
  const seniority = getProp('seniority', null);
  const locationProp = getProp('location', null);
  const difficulty = getProp('difficulty', 'N/A');
  const resultProp = getProp('offer_status', 'Pending'); // Use 'offer_status'
  const summary = getProp('quality_reasoning', null); // Use 'quality_reasoning'
  const displayDateInput = getProp('createdAt', null); // Use 'createdAt'
  let formattedDate = 'Date unavailable';
  if (displayDateInput) { try { const d=new Date(displayDateInput); if(!isNaN(d.getTime())) formattedDate = `Posted ${formatDistanceToNow(d,{addSuffix:true})}`; } catch(e){} }
  const resultText = String(resultProp ?? 'N/A').replace(/^\w/, (c:string) => c.toUpperCase());

  // REMOVED: hasFullDetails check is no longer needed for main content rendering logic
  // const hasFullDetails = interviewData && 'interview_details' in interviewData;

  // --- Main Content Render ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
             <Button variant="outline" onClick={() => navigate(-1)}> {/* Simple back navigation */}
               <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             {/* Conditional Save Button */}
             {isAuthenticated && !isPublic && (
                <Button
                     variant="outline" size="icon" onClick={handleToggleSave}
                     disabled={isLoadingSaveStatus || saveMutation.isPending || unsaveMutation.isPending}
                     aria-label={isSaved ? "Unsave Post" : "Save Post"}
                     className={`transition-colors ${isSaved ? "border-brand-purple text-brand-purple bg-brand-purple-light hover:bg-brand-purple-light/80" : "border-gray-300 text-gray-500 hover:bg-gray-100"}`}
                 >
                     {isLoadingSaveStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                 </Button>
              )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
               {/* Core Info Card */}
                <Card>
                    <CardHeader className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                        {/* ... (Render CompanyBadge, Title, Sub-details using prepared variables) ... */}
                        <div className="flex items-start space-x-4 flex-grow min-w-0">
                            <CompanyBadge name={companyName} size="lg" />
                            <div className="flex-grow min-w-0">
                                <h1 className="text-2xl font-bold mb-1 truncate">{companyName}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                    {position && (<span className="flex items-center flex-shrink-0"><Briefcase className="w-4 h-4 mr-1.5" /> {position}</span>)}
                                    {seniority && (<span className="flex items-center flex-shrink-0"><Code className="w-4 h-4 mr-1.5" /> {seniority}</span>)}
                                    {locationProp && (<span className="flex items-center flex-shrink-0"><MapPin className="w-4 h-4 mr-1.5" /> {locationProp}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end space-y-2 flex-shrink-0 pt-2 sm:pt-0">
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                                <Badge variant="outline" className={getDifficultyBadgeClass(difficulty)}>{difficulty.replace(/^\w/, (c: string) => c.toUpperCase())}</Badge>
                                <Badge variant="outline" className={getResultBadgeClass(resultProp)}>{resultText}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                        </div>
                    </CardHeader>
                    {/* Summary/Reasoning */}
                    {summary && (
                       <> <Separator /> <CardContent className="p-6"> <h3 className="text-sm font-semibold mb-2 text-gray-700">Summary / Overview:</h3> <p className="text-gray-700 italic whitespace-pre-wrap">{summary}</p> </CardContent> </>
                    )}
                </Card>

               {/* Render full details sections directly from interviewData */}
               <>
                   {/* Interview Rounds Details */}
                    {Array.isArray(interviewData.interview_details) && interviewData.interview_details.length > 0 && (
                        <Card>
                            <CardHeader className="p-6"><CardTitle>Interview Process</CardTitle></CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                {interviewData.interview_details.map((round: any, idx: number) => (
                                    <div key={`round-${idx}`} className="pb-4 border-b last:border-b-0">
                                        <h4 className="text-md font-semibold mb-2">
                                            {typeof round.round_number === 'number' ? `Round ${round.round_number}` : 'Round Details'}
                                            {round.type ? `: ${round.type}` : ''}
                                        </h4>
                                        {round.questions && Array.isArray(round.questions) && round.questions.length > 0 ? (
                                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                                                {round.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No specific questions listed for this round.</p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                   {/* LeetCode Questions */}
                    {Array.isArray(interviewData.leetcode_questions) && interviewData.leetcode_questions.length > 0 && (
                         <Card>
                            <CardHeader className="p-6"><CardTitle>Technical Questions (Coding)</CardTitle></CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                {interviewData.leetcode_questions.map((lc: any, index: number) => (
                                    <div key={`lc-${index}`} className="pb-4 border-b last:border-b-0">
                                        {lc.problem_name && <h4 className="text-md font-semibold mb-2">{lc.problem_name}</h4>}
                                        {lc.problem_statement && ( <div className="prose prose-sm max-w-none mb-3"> <p className="font-medium text-gray-800">Problem:</p> <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 text-sm">{lc.problem_statement}</pre> </div> )}
                                        {lc.function_signature && ( <div className="mb-3"> <p className="text-sm font-medium text-gray-800 mb-1">Function Signature:</p> <SyntaxHighlighter language="cpp" style={atomOneDark} customStyle={{ padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>{lc.function_signature}</SyntaxHighlighter> </div> )}
                                        {lc.test_cases && Array.isArray(lc.test_cases) && lc.test_cases.length > 0 && ( <div className="text-sm"> <p className="font-medium text-gray-800 mb-2">Test Cases:</p> {(lc.test_cases as any[]).map((tc: any, tc_index: number) => ( <div key={`tc-${tc_index}`} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200"> <p><strong className="text-gray-600">Input:</strong> <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{JSON.stringify(tc.input)}</code></p> <p><strong className="text-gray-600">Output:</strong> <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{JSON.stringify(tc.output)}</code></p> {tc.explanation && <p className="mt-1"><strong className="text-gray-600">Explanation:</strong> <span className="text-gray-700">{tc.explanation}</span></p>} </div> ))} </div> )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* System Design Questions */}
                    {Array.isArray(interviewData.design_questions) && interviewData.design_questions.length > 0 && (
                        <Card>
                            <CardHeader className="p-6"><CardTitle>System Design Questions</CardTitle></CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                {interviewData.design_questions.map((dq: any, index: number) => (
                                      <div key={`dq-${index}`} className="pb-4 border-b last:border-b-0">
                                          {dq.design_task && <h4 className="text-md font-semibold mb-2">{dq.design_task}</h4>}
                                          {dq.description && <p className="text-sm text-gray-700 mb-3">{dq.description}</p>}
                                          {dq.guiding_questions && Array.isArray(dq.guiding_questions) && dq.guiding_questions.length > 0 && ( <> <p className="text-sm font-medium text-gray-800 mb-1">Guiding Questions / Considerations:</p> <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700"> {dq.guiding_questions.map((gq:string, gq_index:number) => <li key={`gq-${gq_index}`}>{gq}</li>)} </ul> </> )}
                                      </div>
                                 ))}
                            </CardContent>
                        </Card>
                   )}

                   {/* Problem Links */}
                    {Array.isArray(interviewData.problem_link) && interviewData.problem_link.length > 0 && (
                        <Card>
                            <CardHeader className="p-6"><CardTitle>Relevant Links</CardTitle></CardHeader>
                            <CardContent className="p-6 pt-0">
                                <ul className="space-y-2">
                                    {interviewData.problem_link.map((link: any, index: number) => (
                                         <li key={index}> <a href={String(link)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1.5 break-all"> <ExternalLink className="w-4 h-4 flex-shrink-0" /> {String(link)} </a> </li>
                                     ))}
                                </ul>
                            </CardContent>
                        </Card>
                   )}
               </>
                {/* REMOVED: Alert prompt for public featured posts is no longer needed */}

            </div> {/* End Main Content Column */}

            {/* Sidebar Column */}
             <aside className="space-y-6">
                 {/* Show Similar Interviews only if authenticated */}
                 {isAuthenticated && (
                     <>
                         {loadingSimilar && ( /* ... Skeleton Loader ... */
                            <Card>
                                <CardHeader className="p-6"><CardTitle>Similar Interviews</CardTitle></CardHeader>
                                <CardContent className="p-6 space-y-4 animate-pulse"> {[...Array(2)].map((_, i) => ( <div key={i} className="p-3 border rounded-md space-y-2"> <div className="flex justify-between items-center"><div className="h-4 w-3/5 bg-gray-200 rounded"></div><div className="h-4 w-1/5 bg-gray-200 rounded"></div></div> <div className="h-3 w-1/3 bg-gray-200 rounded"></div> </div> ))} </CardContent>
                            </Card>
                         )}
                         {!loadingSimilar && similar.length > 0 && (
                             <Card>
                                <CardHeader className="p-6"><CardTitle>Similar Interviews</CardTitle></CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {similar.map(s => {
                                        let similarFormattedDate = 'Date unavailable'; if (s.date) { try { const d = new Date(s.date); if (!isNaN(d.getTime())) similarFormattedDate = formatDistanceToNow(d, { addSuffix: true }); } catch (e) {} } const similarResultText = String(s.result ?? 'N/A').replace(/^\w/, (c:string) => c.toUpperCase());
                                        return ( <Link key={s.id} to={`/interview/${s.id}`} className="block group"> <div className="p-3 border rounded-md group-hover:bg-gray-50 group-hover:border-gray-300 transition"> <div className="flex justify-between items-start mb-1 gap-2"> <span className="text-sm font-medium group-hover:text-brand-purple truncate">{s.company} - {s.role}</span> <Badge variant="outline" className={`${getResultBadgeClass(s.result)} text-xs flex-shrink-0`}>{similarResultText}</Badge> </div> <p className="text-xs text-gray-500">{similarFormattedDate}</p> </div> </Link> );
                                    })}
                                </CardContent>
                            </Card>
                          )}
                         {!loadingSimilar && similar.length === 0 && (
                            <p className="text-sm text-gray-500 text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">No similar interviews found.</p>
                          )}
                     </>
                 )}
                 {/* CTA for non-authenticated users */}
                 {!isAuthenticated && (
                     <Card>
                         <CardHeader><CardTitle>Explore More</CardTitle></CardHeader>
                         <CardContent>
                             <p className="text-sm text-gray-600 mb-4">Sign in to see similar interviews and save posts.</p>
                             <Button className="w-full" onClick={() => navigate('/signin', { state: { from: location } })}>Sign In / Sign Up</Button>
                         </CardContent>
                     </Card>
                 )}
            </aside> {/* End Sidebar Column */}
          </div> {/* End Grid */}
        </div> {/* End Container */}
      </div> {/* End Outer Wrapper */}
    </>
  );
};

export default InterviewPost;
// --- END OF FILE ---