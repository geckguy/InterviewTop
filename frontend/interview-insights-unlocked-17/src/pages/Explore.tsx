
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, MessageSquare } from "lucide-react";

const Explore = () => {
  const interviewExperiences = [
    {
      company: "Google",
      position: "Senior Software Engineer",
      result: "Offer",
      content: "The interview process consisted of 5 rounds. First was a phone screen with a recruiter, followed by a technical phone interview...",
      posted: "2 days ago",
      likes: 42,
      comments: 18
    },
    {
      company: "Meta",
      position: "Product Manager",
      result: "Rejected",
      content: "The process was intense but fair. Started with an initial screening...",
      posted: "1 week ago",
      likes: 36,
      comments: 12
    },
    {
      company: "Amazon",
      position: "Frontend Developer",
      result: "Offer",
      content: "Interviewed with 6 people across 4 rounds. The focus was heavily on system design and behavioral questions...",
      posted: "3 days ago",
      likes: 51,
      comments: 23
    },
    {
      company: "Microsoft",
      position: "Data Scientist",
      result: "Pending",
      content: "The process took about 4 weeks from initial application to the final round...",
      posted: "6 hours ago",
      likes: 18,
      comments: 5
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Explore Interview Experiences</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through real interview experiences shared by our community members.
            </p>
          </div>
          
          <Tabs defaultValue="latest" className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="rejections">Rejections</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="latest" className="space-y-6">
              {interviewExperiences.map((interview, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center bg-${interview.company === 'Google' ? 'blue' : interview.company === 'Meta' ? 'indigo' : interview.company === 'Amazon' ? 'yellow' : interview.company === 'Microsoft' ? 'green' : interview.company === 'Apple' ? 'gray' : interview.company === 'Netflix' ? 'red' : 'purple'}-100 text-${interview.company === 'Google' ? 'blue' : interview.company === 'Meta' ? 'indigo' : interview.company === 'Amazon' ? 'yellow' : interview.company === 'Microsoft' ? 'green' : interview.company === 'Apple' ? 'gray' : interview.company === 'Netflix' ? 'red' : 'purple'}-600 font-bold`}>
                        {interview.company.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <CardTitle className="text-base font-semibold">{interview.company}</CardTitle>
                        <CardDescription className="text-xs">{interview.position}</CardDescription>
                      </div>
                      <div className="ml-auto">
                        <span className={`bg-${interview.result === 'Offer' ? 'green' : interview.result === 'Rejected' ? 'red' : 'yellow'}-100 text-${interview.result === 'Offer' ? 'green' : interview.result === 'Rejected' ? 'red' : 'yellow'}-800 text-xs font-medium px-2 py-1 rounded`}>
                          {interview.result}
                        </span>
                      </div>
                    </div>
                    <CardContent className="px-0 py-2">
                      <p className="text-gray-700 text-sm">{interview.content}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-4">
                        <span>Posted {interview.posted}</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {interview.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {interview.comments}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-6">
              <div className="text-center py-8">
                <p>Popular interviews will appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="offers" className="space-y-6">
              <div className="text-center py-8">
                <p>Interviews with offers will appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="rejections" className="space-y-6">
              <div className="text-center py-8">
                <p>Interviews with rejections will appear here</p>
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
