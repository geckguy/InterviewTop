
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InterviewCard from "@/components/InterviewCard";
import CompanyFilter from "@/components/CompanyFilter";
import { filterInterviewsByCompany, getUniqueCompanies, mockInterviews } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Filter, CalendarDays, ArrowUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Helper function to parse search params
function useSearchParams() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [filteredInterviews, setFilteredInterviews] = useState(mockInterviews);
  const [companies] = useState(getUniqueCompanies());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  
  // Filter state
  const [filters, setFilters] = useState({
    roles: {
      softwareEngineer: false,
      productManager: false,
      dataScientist: false,
      uxDesigner: false
    },
    results: {
      offer: false,
      rejected: false,
      pending: false
    },
    difficulty: {
      easy: false,
      medium: false,
      hard: false
    },
    dateRange: [0, 30]
  });

  // Handle updating URL when search changes
  useEffect(() => {
    if (searchQuery) {
      const newParams = new URLSearchParams();
      newParams.set("q", searchQuery);
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchQuery, navigate]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would trigger an API call
      toast({
        title: "Searching for",
        description: `"${searchQuery}"`,
      });
      
      // Simple filtering logic (would be handled server-side in a real app)
      const lowercaseQuery = searchQuery.toLowerCase();
      const results = mockInterviews.filter(
        interview => 
          interview.company.toLowerCase().includes(lowercaseQuery) ||
          interview.role.toLowerCase().includes(lowercaseQuery) ||
          interview.excerpt.toLowerCase().includes(lowercaseQuery)
      );
      
      setFilteredInterviews(results);
    } else {
      setFilteredInterviews(mockInterviews);
    }
  };

  // Handle company filter changes
  useEffect(() => {
    setFilteredInterviews(filterInterviewsByCompany(selectedCompany));
  }, [selectedCompany]);

  // Handle filter changes
  const handleFilterChange = (category: string, item: string, value: boolean) => {
    setFilters({
      ...filters,
      [category]: {
        ...filters[category as keyof typeof filters],
        [item]: value
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      roles: {
        softwareEngineer: false,
        productManager: false,
        dataScientist: false,
        uxDesigner: false
      },
      results: {
        offer: false,
        rejected: false,
        pending: false
      },
      difficulty: {
        easy: false,
        medium: false,
        hard: false
      },
      dateRange: [0, 30]
    });
    setSelectedCompany(null);
    setShowFilters(false);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCompany) count++;
    
    Object.values(filters.roles).forEach(val => { if (val) count++; });
    Object.values(filters.results).forEach(val => { if (val) count++; });
    Object.values(filters.difficulty).forEach(val => { if (val) count++; });
    
    // Only count date range if it's not default
    if (filters.dateRange[0] !== 0 || filters.dateRange[1] !== 30) count++;
    
    return count;
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    let sortedInterviews = [...filteredInterviews];
    
    if (value === "recent") {
      sortedInterviews.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else if (value === "popularity") {
      sortedInterviews.sort((a, b) => b.likes - a.likes);
    } else if (value === "comments") {
      sortedInterviews.sort((a, b) => b.comments - a.comments);
    }
    
    setFilteredInterviews(sortedInterviews);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Interview Experiences</h1>
            <p className="text-gray-600">
              Search through thousands of interview experiences shared by professionals
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search by company, role, or keywords..."
                className="w-full py-6 pl-12 pr-4 text-base rounded-lg shadow-sm border-gray-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-purple hover:bg-brand-purple-dark"
              >
                Search
              </Button>
            </form>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Panel (Mobile Toggle) */}
            <div className="md:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge className="ml-2 bg-brand-purple">{getActiveFilterCount()}</Badge>
                  )}
                </span>
                {showFilters ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Filters Panel */}
            <div className={`md:w-1/4 space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    {getActiveFilterCount() > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-brand-purple hover:text-brand-purple-dark"
                        onClick={resetFilters}
                      >
                        Reset all
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <CompanyFilter 
                      companies={companies} 
                      selectedCompany={selectedCompany} 
                      onSelectCompany={setSelectedCompany}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Role</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="role-swe" 
                          checked={filters.roles.softwareEngineer} 
                          onCheckedChange={(checked) => 
                            handleFilterChange('roles', 'softwareEngineer', checked as boolean)
                          }
                        />
                        <Label htmlFor="role-swe">Software Engineer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="role-pm" 
                          checked={filters.roles.productManager}
                          onCheckedChange={(checked) => 
                            handleFilterChange('roles', 'productManager', checked as boolean)
                          }
                        />
                        <Label htmlFor="role-pm">Product Manager</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="role-ds" 
                          checked={filters.roles.dataScientist}
                          onCheckedChange={(checked) => 
                            handleFilterChange('roles', 'dataScientist', checked as boolean)
                          }
                        />
                        <Label htmlFor="role-ds">Data Scientist</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="role-ux" 
                          checked={filters.roles.uxDesigner}
                          onCheckedChange={(checked) => 
                            handleFilterChange('roles', 'uxDesigner', checked as boolean)
                          }
                        />
                        <Label htmlFor="role-ux">UX Designer</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Result</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="result-offer" 
                          checked={filters.results.offer}
                          onCheckedChange={(checked) => 
                            handleFilterChange('results', 'offer', checked as boolean)
                          }
                        />
                        <Label htmlFor="result-offer" className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mr-1.5">Offer</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="result-rejected" 
                          checked={filters.results.rejected}
                          onCheckedChange={(checked) => 
                            handleFilterChange('results', 'rejected', checked as boolean)
                          }
                        />
                        <Label htmlFor="result-rejected" className="flex items-center">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 mr-1.5">Rejected</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="result-pending" 
                          checked={filters.results.pending}
                          onCheckedChange={(checked) => 
                            handleFilterChange('results', 'pending', checked as boolean)
                          }
                        />
                        <Label htmlFor="result-pending" className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mr-1.5">Pending</Badge>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Difficulty</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="difficulty-easy" 
                          checked={filters.difficulty.easy}
                          onCheckedChange={(checked) => 
                            handleFilterChange('difficulty', 'easy', checked as boolean)
                          }
                        />
                        <Label htmlFor="difficulty-easy" className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mr-1.5">Easy</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="difficulty-medium" 
                          checked={filters.difficulty.medium}
                          onCheckedChange={(checked) => 
                            handleFilterChange('difficulty', 'medium', checked as boolean)
                          }
                        />
                        <Label htmlFor="difficulty-medium" className="flex items-center">
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 mr-1.5">Medium</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="difficulty-hard" 
                          checked={filters.difficulty.hard}
                          onCheckedChange={(checked) => 
                            handleFilterChange('difficulty', 'hard', checked as boolean)
                          }
                        />
                        <Label htmlFor="difficulty-hard" className="flex items-center">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 mr-1.5">Hard</Badge>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Date Posted</h4>
                      <div className="text-sm text-gray-500 flex items-center">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        Last {filters.dateRange[1]} days
                      </div>
                    </div>
                    <Slider
                      defaultValue={[filters.dateRange[1]]}
                      max={90}
                      step={1}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          dateRange: [0, value[0]]
                        });
                      }}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Today</span>
                      <span>30 days</span>
                      <span>90 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Results */}
            <div className="md:w-3/4">
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <p className="text-gray-600 text-sm mb-2 md:mb-0">
                      {filteredInterviews.length} results {searchQuery ? `for "${searchQuery}"` : ''}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      <Tabs value={sortBy} onValueChange={handleSortChange} className="w-auto">
                        <TabsList className="h-8 bg-gray-100">
                          <TabsTrigger value="recent" className="text-xs h-6 px-2">
                            Most Recent
                          </TabsTrigger>
                          <TabsTrigger value="popularity" className="text-xs h-6 px-2">
                            Most Popular
                          </TabsTrigger>
                          <TabsTrigger value="comments" className="text-xs h-6 px-2">
                            Most Comments
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {filteredInterviews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredInterviews.map((interview) => (
                    <InterviewCard key={interview.id} {...interview} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria to find more interview experiences.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset all filters
                  </Button>
                </Card>
              )}
              
              {filteredInterviews.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple-light">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
