import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn, 
  User, 
  Bell, 
  Calendar, 
  MessageSquare,
  Search
} from "lucide-react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { mockInterviews } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
const Dashboard = () => {
  const { isAuthenticated, logout } = useAuth();
  const recentlyRead = mockInterviews.slice(0, 4);

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            {user && <span className="text-lg text-gray-600 hidden sm:inline">Welcome, {user.username || user.email}!</span>}
            <Button variant="outline" onClick={logout}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - 2/3 width on large screens */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recently Read Posts */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Recently Read Posts</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/explore">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentlyRead.length > 0 ? (
                    <div className="space-y-4">
                      {recentlyRead.map((interview) => (
                        <Link key={interview.id}
                        to={`/interview/${interview.id}`}
                        className="block">
                          <div className="p-4 border rounded-lg hover:border-brand-purple hover:bg-gray-50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">{interview.company}</h3>
                                <p className="text-sm text-gray-600">{interview.role}</p>
                              </div>
                              <Badge variant="outline">{interview.result}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{interview.excerpt}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Read {formatDistanceToNow(interview.date, { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No posts read yet.</p>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar - 1/3 width on large screens */}
            <div className="space-y-6">


              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to="/share-experience">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Share Interview Experience
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Find Interviews
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;