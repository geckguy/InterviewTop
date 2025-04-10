
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import InterviewCard from "@/components/InterviewCard";
import CompanyFilter from "@/components/CompanyFilter";
import StatsSection from "@/components/StatsSection";
import { filterInterviewsByCompany, getFeaturedInterviews, getUniqueCompanies } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Filter, MessageSquare, ThumbsUp } from "lucide-react";

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [filteredInterviews, setFilteredInterviews] = useState(filterInterviewsByCompany(null));
  const [companies] = useState(getUniqueCompanies());
  const [featuredInterviews] = useState(getFeaturedInterviews());

  useEffect(() => {
    setFilteredInterviews(filterInterviewsByCompany(selectedCompany));
  }, [selectedCompany]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <StatsSection />
        
        {/* Featured Experiences */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Experiences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredInterviews.map((interview) => (
                <InterviewCard key={interview.id} {...interview} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Recent Experiences */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Experiences</h2>
              <Link to="/explore">
                <Button variant="ghost" className="text-brand-purple hover:text-brand-purple-dark">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filter Sidebar */}
              <div className="md:w-1/4 flex flex-col gap-4">
                <CompanyFilter 
                  companies={companies} 
                  selectedCompany={selectedCompany} 
                  onSelectCompany={setSelectedCompany}
                />
                
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-3">Filter by</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Software Engineer
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Product Manager
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Data Scientist
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Easy
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                          Medium
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs bg-red-50 border-red-200 text-red-700">
                          Hard
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Result</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Offer
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs bg-red-50 border-red-200 text-red-700">
                          Rejected
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                          Pending
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-brand-purple hover:bg-brand-purple-dark">
                    <Filter className="mr-2 h-4 w-4" /> Apply Filters
                  </Button>
                </div>
              </div>
              
              {/* Interview Cards Grid */}
              <div className="md:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInterviews
                    .slice(0, 6)
                    .map((interview) => (
                      <InterviewCard key={interview.id} {...interview} />
                    ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Link to="/explore">
                    <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple-light">
                      Load More Experiences
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-brand-purple to-brand-purple-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Share Your Interview Experience</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
              Help others in their interview journey by sharing your experience. Your insights could be the key to someone else's success.
            </p>
            <Link to="/share-experience">
              <Button size="lg" variant="secondary" className="bg-white text-brand-purple hover:bg-gray-100">
                Share Your Story
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
