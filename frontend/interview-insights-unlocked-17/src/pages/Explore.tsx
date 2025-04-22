import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, MessageSquare } from "lucide-react";

import { fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { InterviewCardProps } from "@/components/InterviewCard";

const Explore = () => {
  const [latest, setLatest] = useState<InterviewCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { experiences } = await fetchInterviews({ sort_by: "date_desc", limit: 8 });
      setLatest(experiences.map(toCard));
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Explore Interview Experiences</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through real interview experiences shared by our community.
            </p>
          </div>

          <Tabs defaultValue="latest" className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="latest" className="space-y-6">
              {loading ? (
                <p className="text-center">Loading…</p>
              ) : (
                latest.map((i) => (
                  <Card key={i.id} className="hover:shadow-md transition">
                    <CardHeader className="pb-2">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-brand-purple-light text-brand-purple font-bold">
                          {i.company.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-base font-semibold">{i.company}</CardTitle>
                          <CardDescription className="text-xs">{i.role}</CardDescription>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {i.result}
                          </span>
                        </div>
                      </div>
                      <CardContent className="px-0 py-2">
                        <p className="text-gray-700 text-sm line-clamp-2">{i.excerpt}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-4">
                          <span>{i.date.toDateString()}</span>
                          <div className="flex space-x-3">
                            <span className="flex items-center">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {i.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {i.comments}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="popular" className="space-y-6">
              <div className="text-center py-8">
                <p>Popular interviews will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Explore;
