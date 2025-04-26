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
      <main className="flex-grow bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Search Interview Experiences</h1>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-8 max-w-2xl mx-auto">
            <Input
              placeholder="Search by company, role, keywords..." // Updated placeholder
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-24 py-6 text-base rounded-full shadow-sm" // Rounded, larger text
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-purple rounded-full px-6"> {/* Rounded */}
              Search
            </Button>
          </form>

          {/* Filter toggle (mobile) */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex justify-center items-center gap-2" // Centered content
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

            {/* Results */}
            <section className="md:w-3/4 lg:w-4/5">
              {/* Initial Loading Placeholder */}
              {loading && results.length === 0 && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       {[...Array(6)].map((_, i) => ( // Skeleton loaders
                           <Card key={i} className="p-4 space-y-3 animate-pulse">
                               <div className="flex items-center space-x-3">
                                   <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                                   <div className="space-y-1.5">
                                       <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                       <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                   </div>
                               </div>
                               <div className="h-3 w-full bg-gray-200 rounded"></div>
                               <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                               <div className="flex justify-between pt-2">
                                   <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                   <div className="h-3 w-12 bg-gray-200 rounded"></div>
                               </div>
                           </Card>
                       ))}
                   </div>
               )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Use results directly, backend handles sorting */}
                  {results.map((i) => (
                    <InterviewCard key={i.id} {...i} />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!loading && hasMore && ( // Show only if not initial load and has more
                  <div className="mt-8 flex justify-center">
                      <Button
                          variant="outline"
                          disabled={loadingMore}
                          onClick={handleLoadMore}
                          className="min-w-[120px]" // Give button min width
                      >
                          {loadingMore ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              "Load more"
                          )}
                      </Button>
                  </div>
              )}


              {/* No Results Found */}
              {!loading && results.length === 0 && (
                <Card className="p-8 text-center mt-6 border-dashed">
                  <h3 className="font-semibold text-lg">No results found</h3>
                  <p className="text-gray-600 mt-1">Try adjusting your search query or filters.</p>
                </Card>
              )}

               {/* End of Results Message */}
              {!loadingMore && !hasMore && results.length > 0 && (
                  <p className="text-center text-gray-500 mt-8 text-sm">You've reached the end of the results.</p>
              )}
            </section>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Search;