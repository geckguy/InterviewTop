import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Share, MessageSquare, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CompanyBadge from "@/components/CompanyBadge";
import Navbar from "@/components/Navbar";
import { toCard } from "@/utils/mapInterview";
import Footer from "@/components/Footer";

import { fetchInterview, fetchSimilar } from "@/api/interviews";
import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

const InterviewPost = () => {
  const { id = "" } = useParams();
  const [interview, setInterview] = useState<InterviewExperience | null>(null);
  const [similar, setSimilar]     = useState<InterviewCardProps[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null); // <-- Reset error on new fetch
      try {
        console.log(`[InterviewPost] Fetching data for ID: ${id}`); // Keep logs for debugging
        const data = await fetchInterview(id);
        console.log("[InterviewPost] Interview data fetched:", data);
        setInterview(data);

        const similarData = await fetchSimilar(id, 3);
        console.log("[InterviewPost] Similar data fetched:", similarData);
        setSimilar(similarData.map(toCard));

      } catch (err: any) { // <-- Add catch block
        console.error("[InterviewPost] Error fetching data:", err);
        setError(err.message || "Failed to load interview details.");
        setInterview(null); // Ensure interview is null on error
        setSimilar([]); // Clear similar on error
      } finally {
        console.log("[InterviewPost] Fetching complete, setting loading to false.");
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) { // Keep loading check first
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
      </>
    );
  }

  if (error) { // <-- Add error display block
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center p-4">
          <Alert variant="destructive">
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


  if (!interview) { // Keep not found check (for cases where API returns nothing without error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-gray-50 flex flex-col items-center justify-center">
          <Alert>
            <AlertDescription>Interview not found.</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
          </Button>
        </div>
         <Footer /> {/* Added Footer here too */}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-gray-50"> {/* ADD wrapper div with pt-20 */}
      <div className="container mx-auto px-4 py-8"> {/* This div is the inner container */}
          <Button variant="outline" asChild className="mb-4">
             <Link to="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* main */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="p-6 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <div className="flex items-start space-x-4">
                  <CompanyBadge name={interview.company} size="lg" />
                  <div>
                    <h1 className="text-2xl font-bold">{interview.company}</h1>
                    <p>{interview.role}</p>
                    <p className="text-sm text-gray-500">
                    {interview.createdAt // Use createdAt
                      ? (() => { // Use an IIFE or helper function for cleaner logic
                          try {
                            const dateObj = new Date(interview.createdAt);
                            if (!isNaN(dateObj.getTime())) { // Check if parsing was successful
                              return formatDistanceToNow(dateObj, { addSuffix: true });
                            }
                          } catch (e) { console.error("Error parsing date:", interview.createdAt, e); }
                          return 'Date not available'; // Fallback if createdAt exists but is invalid
                        })()
                      : 'Date not available' // Fallback if createdAt doesn't exist
                    }
                  </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge>{interview.difficulty}</Badge>
                  <Badge>{interview.result}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-6">{interview.excerpt}</p>
                {/* you can render full details here once the backend adds them */}
                  {interview.interview_details?.map(r=>(
                  <div key={r.round_number} className="mb-6">
                  <h4 className="font-semibold">Round {r.round_number}: {r.type}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {r.questions.map((q,i)=><li key={i}>{q}</li>)}
                  </ul>
                </div>
              ))}
              </CardContent>
            </Card>
          </div>

          {/* sidebar */}
          <aside>
            <Card className="mb-6">
              <CardHeader className="p-6">
                <h3 className="font-semibold">Actions</h3>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Like
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" /> Comment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <h3 className="font-semibold">Similar Interviews</h3>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {similar.map(s => (
                  <Link key={s.id} to={`/interview/${s.id}`} className="block">
                    <div className="p-3 border rounded-md hover:bg-gray-50 transition">
                      <div className="flex justify-between mb-1">
                        <span>{s.role}</span>
                        <Badge>{s.result}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                      {s.date && !isNaN(s.date.getTime())
                        ? formatDistanceToNow(s.date, { addSuffix: true })
                        : 'Date not available'
                      }
                    </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
        </div>
      </div>
      <Footer />
      </>
  );
};

export default InterviewPost;
