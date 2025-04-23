import { Button } from "@/components/ui/button";
import {
  // LogIn, // No longer needed here if sign out button removed
  // LogOut, // LogOut button is in Navbar
  MessageSquare,
  Search,
  Loader2
} from "lucide-react";
// Import useNavigate
import { Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchVisitedPosts } from "@/api/interviews";
import { useAuth } from "@/hooks/useAuth";
import InterviewCard from '@/components/InterviewCard';
import { InterviewCardProps } from "@/components/InterviewCard";

const Dashboard = () => {
  // Renamed logout to callLogout for clarity, though using context `logout` is fine
  const { isAuthenticated, logout: callLogout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: visitedPosts, isLoading: isLoadingVisited, error: errorVisited } = useQuery<InterviewCardProps[], Error>({
    queryKey: ['visitedPosts', user?.id],
    queryFn: fetchVisitedPosts,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (!isAuthenticated && !user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Navbar /> {/* Navbar already contains the Sign Out button */}
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          {/* --- Adjusted Header: Removed Sign Out Button --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-center sm:text-left">Your Dashboard</h1>
            {/* Welcome message can stay or be removed, depending on preference */}
            {user && (
              <span className="text-lg text-gray-600 text-center sm:text-right">
                Welcome, {user.username || user.email}!
              </span>
            )}
            {/* The Sign Out button previously here is removed */}
          </div>
          {/* --- End Adjusted Header --- */}


          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recently Read Posts Section (Main Area) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <CardTitle>Recently Viewed Posts</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate('/search')}
                    >
                      Find More Experiences
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Loading State */}
                  {isLoadingVisited && (
                      <div className="text-center py-6 flex items-center justify-center text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                          Loading visited posts...
                      </div>
                  )}

                  {/* Error State */}
                  {errorVisited && <p className="text-red-600 text-center py-4">Error loading visited posts. Please try again later.</p>}

                  {/* Success State - Data Display */}
                  {!isLoadingVisited && !errorVisited && visitedPosts && visitedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visitedPosts.map((interviewProps) => (
                        interviewProps?.id && !interviewProps.id.startsWith('invalid-') ? ( // Added optional chaining
                           <InterviewCard key={interviewProps.id} {...interviewProps} />
                        ) : null
                      ))}
                    </div>
                  ) : null}

                  {/* No Posts Read Yet */}
                  {!isLoadingVisited && !errorVisited && (!visitedPosts || visitedPosts.length === 0) && (
                      <p className="text-gray-500 text-center py-6">
                          You haven't viewed any posts yet. Start
                          <Link to="/search" className="text-brand-purple hover:underline font-medium mx-1">
                              searching
                          </Link>
                           !
                      </p>
                  )}
                </CardContent>
              </Card>
            </div> {/* End Main Area Column */}

            {/* Sidebar Column */}
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
            </div> {/* End Sidebar Column */}

          </div> {/* End Main Grid Layout */}
        </div> {/* End Container */}
      </div> {/* End Page Wrapper */}
      {/* <Footer /> */}
    </>
  );
};

export default Dashboard;