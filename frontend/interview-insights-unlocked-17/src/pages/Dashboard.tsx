// --- START OF FILE Dashboard.tsx ---
// (Updated with Visited/Saved Tabs)

import { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
// Added History, Bookmark icons
import { MessageSquare, Search, Loader2, History, Bookmark } from "lucide-react";
import { Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
// Import both fetch functions
import { fetchVisitedPosts, fetchSavedPosts } from "@/api/interviews";
import { useAuth } from "@/hooks/useAuth";
import InterviewCard from '@/components/InterviewCard';
import { InterviewCardProps } from "@/components/InterviewCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth(); // Use user from context
  const navigate = useNavigate();
  const location = useLocation();

  // --- State for view mode (visited or saved) ---
  const [viewMode, setViewMode] = useState<'visited' | 'saved'>('visited');

  // --- Conditional Query based on viewMode ---
  const { data: posts, isLoading: isLoadingPosts, error: errorPosts } = useQuery<InterviewCardProps[], Error>({
    // Query key changes based on the view mode and user ID
    queryKey: [viewMode === 'visited' ? 'visitedPosts' : 'savedPosts', user?.id],
    // Fetch function depends on the selected view mode
    queryFn: viewMode === 'visited' ? fetchVisitedPosts : fetchSavedPosts,
    enabled: !!user?.id, // Only run query if user ID is available
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: true, // Refetch on window focus for potentially updated lists
  });

  // --- Authentication Check ---
  if (!isAuthenticated || !user) {
    // Redirect to sign-in if not authenticated
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // --- Navigation Helper ---
  const handleNavigate = (path: string) => navigate(path);

  // --- Dynamic Content based on viewMode ---
  const cardTitle = viewMode === 'visited' ? 'Recently Viewed Posts' : 'Your Saved Posts';
  const loadingMessage = `Loading ${viewMode} posts...`;
  const errorMessage = `Error loading ${viewMode} posts. Please try again later.`;
  const emptyMessage = viewMode === 'visited'
    ? <>You haven't viewed any posts yet. Start <Link to="/search" className="text-brand-purple hover:underline font-medium mx-1">searching</Link>!</>
    : <>You haven't saved any posts yet. Find experiences <Link to="/search" className="text-brand-purple hover:underline font-medium mx-1">here</Link> and save them using the <Bookmark className="inline h-4 w-4 mx-1 text-gray-500"/> icon!</>;

  return (
    <>
      <Navbar /> {/* Navbar includes the Sign Out button */}
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* --- Header Section --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-center sm:text-left">Your Dashboard</h1>
            {user && (
              <span className="text-lg text-gray-600 text-center sm:text-right">
                Welcome, {user.username || user.email}!
              </span>
            )}
          </div>
          {/* --- End Header --- */}


          {/* --- Main Grid Layout --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* --- Posts Section (Main Area with Tabs) --- */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                {/* Tabs for switching between Visited and Saved */}
                <CardHeader className="p-0 border-b"> {/* Reduced padding */}
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'visited' | 'saved')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 rounded-t-lg rounded-b-none"> {/* Adjust height/rounding */}
                            <TabsTrigger value="visited" className="gap-1.5 data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple data-[state=active]:shadow-none">
                                <History className="h-4 w-4"/> Visited
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="gap-1.5 data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple data-[state=active]:shadow-none">
                                <Bookmark className="h-4 w-4"/> Saved
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                 <CardContent className="pt-6"> {/* Added padding top */}
                     {/* Dynamic Title and Button */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                       <CardTitle className="text-xl">{cardTitle}</CardTitle>
                       <Button variant="outline" size="sm" onClick={() => handleNavigate('/search')}>
                           Find More Experiences
                       </Button>
                    </div>

                  {/* --- Conditional Rendering based on query state --- */}
                  {/* Loading State */}
                  {isLoadingPosts && (
                      <div className="text-center py-10 flex items-center justify-center text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                          {loadingMessage}
                      </div>
                  )}

                  {/* Error State */}
                  {!isLoadingPosts && errorPosts && (
                      <p className="text-red-600 text-center py-10">{errorMessage}</p>
                  )}

                  {/* Success State - Data Display */}
                  {!isLoadingPosts && !errorPosts && posts && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {posts.map((postProps) => (
                         // Validate postProps and id before rendering
                         postProps?.id ? (
                           <InterviewCard key={postProps.id} {...postProps} />
                        ) : (
                           // Optionally log or render a placeholder for invalid data
                           <div key={Math.random()} className="p-4 border rounded text-red-500 text-xs">Invalid post data encountered.</div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoadingPosts && !errorPosts && (!posts || posts.length === 0) && (
                      <p className="text-gray-500 text-center py-10">
                          {emptyMessage}
                      </p>
                  )}
                </CardContent>
              </Card>
            </div> {/* End Main Area Column */}

            {/* --- Sidebar Column --- */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                     variant="default"
                     size="sm"
                     className="w-full justify-start bg-brand-purple hover:bg-brand-purple-dark text-white"
                     onClick={() => handleNavigate('/share-experience')}
                   >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Share Interview Experience
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     className="w-full justify-start"
                     onClick={() => handleNavigate('/search')}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Specific Interviews
                  </Button>
                </CardContent>
              </Card>
              {/* You could add more cards here, e.g., profile summary, stats */}
            </div> {/* End Sidebar Column */}

          </div> {/* End Main Grid Layout */}
        </div> {/* End Container */}
      </div> {/* End Page Wrapper */}
    </>
  );
};

export default Dashboard;