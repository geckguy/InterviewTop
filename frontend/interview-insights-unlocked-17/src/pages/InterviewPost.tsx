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
import Footer from "@/components/Footer";

import { fetchInterview, fetchSimilar } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { InterviewCardProps } from "@/components/InterviewCard";

const InterviewPost = () => {
  const { id = "" } = useParams();
  const [interview, setInterview] = useState<InterviewCardProps | null>(null);
  const [similar, setSimilar]     = useState<InterviewCardProps[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data   = await fetchInterview(id);
        const alike  = await fetchSimilar(id, 3);
        setInterview(toCard(data));
        setSimilar(alike.map(toCard));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
      </>
    );
  }

  if (!interview) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Alert>
            <AlertDescription>Interview not found.</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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
                      {formatDistanceToNow(interview.date, { addSuffix: true })}
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
                        {formatDistanceToNow(s.date, { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InterviewPost;
