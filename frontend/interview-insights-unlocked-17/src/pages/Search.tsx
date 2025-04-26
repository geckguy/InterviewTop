// src/pages/Search.tsx
import { useState, useEffect } from "react"; // Removed useMemo
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import InterviewCard from "@/components/InterviewCard";
import CompanyFilter from "@/components/CompanyFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Filter, X, Loader2 } from "lucide-react"; // Import Loader2
// import { Badge } from "@/components/ui/badge"; // Removed if not used
import { Card, CardContent } from "@/components/ui/card"; // Keep Card, CardContent if used for "No results"
// --- REMOVE TABS IMPORTS ---
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// --- END REMOVE TABS IMPORTS ---
// import { Separator } from "@/components/ui/separator"; // Removed if not used
// import { useToast } from "@/components/ui/use-toast"; // Removed if not used

import { fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { InterviewCardProps } from "@/components/InterviewCard";

function useSearchParams() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const Search = () => {
  const navigate = useNavigate();
  // const { toast } = useToast(); // Remove if not used
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  // Change from single company to array of companies
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(() => {
    const companyParam = searchParams.get("companies");
    return companyParam ? companyParam.split(',') : [];
  });
  
  const [results, setResults] = useState<InterviewCardProps[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [allAvailableCompanies, setAllAvailableCompanies] = useState<string[]>([]); // Store all available companies
  // --- REMOVE sortBy STATE ---
  // const [sortBy, setSortBy] = useState("recent");
  // --- END REMOVE sortBy STATE ---
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Separate state for loading more
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // Store total count
  const [hasMore, setHasMore] = useState(true); // Track if more results exist
  const TAKE = 12; // Results per page

  // --- Initial data load for all companies ---
  useEffect(() => {
    let isMounted = true;
    
    const fetchAllCompanies = async () => {
      try {
        // Fetch a larger set to get all companies
        const { experiences } = await fetchInterviews({
          limit: 100 // Get a larger sample to capture more companies
        });
        
        if (isMounted) {
          const uniqueCompanies = Array.from(
            new Set(experiences.map(e => e.company).filter(Boolean))
          ) as string[];
          
          setAllAvailableCompanies(uniqueCompanies);
        }
      } catch (error) {
        console.error("Error fetching all available companies:", error);
      }
    };
    
    fetchAllCompanies();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Fetch Function ---
  const runSearch = async (currentPage: number, isNewSearch: boolean = false) => {
      if (isNewSearch) {
          setPage(0); // Reset page for new search
          setResults([]); // Clear previous results
          setHasMore(true); // Assume there are results initially
          setLoading(true); // Show main loading indicator
      } else {
          setLoadingMore(true); // Show loading more indicator
      }

      try {
          const { experiences, total_count } = await fetchInterviews({
            search_term: searchQuery || undefined,
            // Pass multiple companies as comma-separated string if any are selected
            company: selectedCompanies.length > 0 ? selectedCompanies.join(',') : undefined,
            sort_by: "date_desc", // Always sort by recent (backend default)
            skip: currentPage * TAKE,
            limit: TAKE,
          });

          const newCards = experiences.map(toCard);

          setResults(prev => isNewSearch ? newCards : [...prev, ...newCards]);
          setTotalCount(total_count); // Update total count

          // Update the filtered list of companies shown in results
          // But don't overwrite allAvailableCompanies
          if (currentPage === 0 && isNewSearch) {
              setCompanies(
                  Array.from(
                      new Set(experiences.map(e => e.company).filter(Boolean))
                  ) as string[]
              );
          }

          // Determine if there are more pages
          setHasMore((currentPage * TAKE) + newCards.length < total_count);

      } catch (error) {
          console.error("Error fetching search results:", error);
          // Handle error (e.g., show toast message)
          setHasMore(false); // Stop loading more on error
      } finally {
          setLoading(false);
          setLoadingMore(false);
      }
  };


  // --- Effect: Search on mount / param change ---
  useEffect(() => {
     // Run search on initial load or when query/company changes via URL/state
     runSearch(0, true); // Run as a new search
  }, [searchQuery, selectedCompanies]); // Dependencies trigger new search

  // --- Handler for form submission ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL params to reflect current state
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCompanies.length > 0) params.set("companies", selectedCompanies.join(','));
    navigate({ search: params.toString() }, { replace: true });
    // The useEffect will trigger the search because searchQuery/selectedCompanies state changes
    // or because the URL change causes a re-render (though state change is primary driver here)
    runSearch(0, true); // Explicitly trigger new search
  };

  // --- Handlers for company filters ---
  const handleSelectCompany = (company: string) => {
    if (!selectedCompanies.includes(company)) {
      const newSelectedCompanies = [...selectedCompanies, company];
      setSelectedCompanies(newSelectedCompanies);
      
      // Update URL params
      const params = new URLSearchParams(location.search);
      params.set("companies", newSelectedCompanies.join(','));
      navigate({ search: params.toString() }, { replace: true });
      
      // The useEffect will trigger the search
    }
  };

  const handleClearCompany = (company: string) => {
    const newSelectedCompanies = selectedCompanies.filter(c => c !== company);
    setSelectedCompanies(newSelectedCompanies);
    
    // Update URL params
    const params = new URLSearchParams(location.search);
    if (newSelectedCompanies.length > 0) {
      params.set("companies", newSelectedCompanies.join(','));
    } else {
      params.delete("companies");
    }
    navigate({ search: params.toString() }, { replace: true });
    
    // The useEffect will trigger the search
  };

  const handleClearAllCompanies = () => {
    setSelectedCompanies([]);
    
    // Update URL params
    const params = new URLSearchParams(location.search);
    params.delete("companies");
    navigate({ search: params.toString() }, { replace: true });
    
    // The useEffect will trigger the search
  };

  // --- Handler for loading more results ---
  const handleLoadMore = () => {
      if (!loadingMore && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          runSearch(nextPage, false); // Run as loading more
      }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center md:text-left dark:text-gray-50">Search Interview Experiences</h1>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-8 max-w-2xl mx-auto">
            <Input
              placeholder="Search by company, role, keywords..." // Updated placeholder
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-24 py-6 text-base rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400" // Rounded, larger text
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Button 
              type="submit" 
              size="lg" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-full px-6 dark:bg-[#7E69AB] dark:text-white dark:hover:bg-[#6d5a95]"
            > 
              Search
            </Button>
          </form>

          {/* Filter toggle (mobile) */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex justify-center items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800" // Centered content
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {/* Removed X icon for simplicity */}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className={`md:w-1/4 lg:w-1/5 space-y-4 ${showFilters ? "block mb-6 md:mb-0" : "hidden md:block"}`}> {/* Adjusted width */}
              <CompanyFilter
                companies={allAvailableCompanies.length > 0 ? allAvailableCompanies : companies}
                selectedCompanies={selectedCompanies}
                onSelectCompany={handleSelectCompany}
                onClearCompany={handleClearCompany}
                onClearAll={handleClearAllCompanies}
              />
              {/* Add other filters here if needed */}
            </aside>

            {/* Main content */}
            <div className="md:w-3/4 lg:w-4/5"> {/* Adjusted width */}
              {/* Results Count */}
              {!loading && (
                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                  <h2 className="text-lg font-medium dark:text-gray-300">
                    {totalCount > 0 ? (
                      <>Found <span className="font-bold text-brand-purple dark:text-brand-purple-light">{totalCount}</span> experience{totalCount !== 1 ? 's' : ''}</>
                    ) : (
                      <>No experiences found</>
                    )}
                  </h2>
                  {/*
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  */}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-brand-purple dark:text-brand-purple-light" />
                  <span className="text-gray-600 dark:text-gray-400">Searching experiences...</span>
                </div>
              )}

              {/* No Results */}
              {!loading && results.length === 0 && (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-medium mb-2 dark:text-gray-200">No experiences found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
                    {/* Reset filters button */}
                    {(selectedCompanies.length > 0 || searchQuery) && (
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('');
                        setSelectedCompanies([]);
                        navigate('/search', { replace: true });
                      }} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Reset All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Grid of cards */}
              {!loading && results.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {results.map((card) => (
                       card.id ? <InterviewCard key={card.id} {...card} /> : null
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button 
                        onClick={handleLoadMore} 
                        disabled={loadingMore}
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>Load More</>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* End of results message */}
                  {!hasMore && results.length > 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                      {results.length >= totalCount 
                        ? "You've reached the end of results." 
                        : "That's all we could find for now."}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;