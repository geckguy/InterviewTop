import { useEffect, useState } from "react";
// Import useNavigate, remove Link if no longer needed directly for this button
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import CompanyFilter from "@/components/CompanyFilter";
import InterviewCard from "@/components/InterviewCard";
import { fetchRecent, fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { Button } from "@/components/ui/button";
// import { Filter } from "lucide-react"; // Filter icon not used here

const Index = () => {
  /* ---------------------------- state ---------------------------- */
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  // Update to use array of companies instead of single company
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companies,           setCompanies]           = useState<string[]>([]);
  const [allAvailableCompanies, setAllAvailableCompanies] = useState<string[]>([]); // Store all available companies
  const [featuredInterviews,  setFeaturedInterviews]  = useState<any[]>([]); // Consider using InterviewCardProps[] type
  const [filteredInterviews,  setFilteredInterviews]  = useState<any[]>([]); // Consider using InterviewCardProps[] type
  const navigate = useNavigate(); // Initialize navigate

  /* ------------------------ fetch on mount and initial data load ----------------------- */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    
    // Initial data fetch - gets all companies and featured interviews
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch featured interviews on initial load
        const recentData = await fetchRecent(3);
        
        if (isMounted) {
          setFeaturedInterviews(recentData.map(toCard));
          
          // Also fetch all available companies on first load
          const allData = await fetchInterviews({ limit: 100 });
          const uniqueCompanies = Array.from(
            new Set(allData.experiences.map(e => e.company).filter(Boolean))
          ) as string[];
          
          setAllAvailableCompanies(uniqueCompanies);
          setCompanies(uniqueCompanies); // Initialize companies with all available companies
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load initial data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchInitialData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount
  
  /* ------------------------ fetch filtered data when filters change ----------------------- */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    
    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        // Fetch interviews based on selected companies
        const filteredData = await fetchInterviews({ 
          company: selectedCompanies.length > 0 ? selectedCompanies.join(',') : undefined, 
          limit: 12 
        });

        if (isMounted) {
          setFilteredInterviews(filteredData.experiences.map(toCard));
          // Important: We don't update the companies list here to preserve all filter options
        }
      } catch (err: any) {
        console.error("Error fetching filtered data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load filtered experiences.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFilteredData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedCompanies]); // Dependency array - only run when selected companies change

  // Handler for selecting a company
  const handleSelectCompany = (company: string) => {
    if (!selectedCompanies.includes(company)) {
      const newSelectedCompanies = [...selectedCompanies, company];
      setSelectedCompanies(newSelectedCompanies);
    }
  };

  // Handler for clearing a company
  const handleClearCompany = (company: string) => {
    const newSelectedCompanies = selectedCompanies.filter(c => c !== company);
    setSelectedCompanies(newSelectedCompanies);
  };

  // Handler for clearing all companies
  const handleClearAllCompanies = () => {
    setSelectedCompanies([]);
  };

  /* --------------------------- UI --------------------------- */
  // Improved Loading/Error states
  if (loading && filteredInterviews.length === 0 && featuredInterviews.length === 0) { // Show loading only initially
      return (
          <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow flex items-center justify-center">
                  <p>Loading experiences...</p>
              </main>
          </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow flex items-center justify-center text-center p-4">
                  <p className="text-red-600">Error: {error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                      Try Again
                  </Button>
              </main>
              
          </div>
      );
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <HeroSection />
        <StatsSection />

        {/* ---------- Featured ---------- */}
        {featuredInterviews.length > 0 && (
          <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 text-center md:text-left dark:text-gray-50">Featured Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredInterviews.map((i) => (
                  <InterviewCard key={i.id} {...i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Recent & filters ---------- */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold dark:text-gray-50">Recent Experiences</h2>
              {/* --- MODIFIED BUTTON: Points to /search --- */}
              <Button
                 variant="ghost"
                 className="text-brand-purple hover:bg-brand-purple-light dark:text-brand-purple-light dark:hover:bg-gray-700"
                 onClick={() => navigate('/search')} // Use navigate
              >
                View All
              </Button>
              {/* --- END MODIFIED BUTTON --- */}
            </div>

            <div className="flex flex-col md:flex-row gap-8"> {/* Increased gap */}
              {/* sidebar */}
              <aside className="md:w-1/4 lg:w-1/5"> {/* Adjusted width */}
                <CompanyFilter
                  companies={allAvailableCompanies} // Use ALL available companies from our state
                  selectedCompanies={selectedCompanies}
                  onSelectCompany={handleSelectCompany}
                  onClearCompany={handleClearCompany}
                  onClearAll={handleClearAllCompanies}
                />
              </aside>

              {/* cards */}
              <div className="md:w-3/4 lg:w-4/5"> {/* Adjusted width */}
                {/* Display loading indicator for filter changes */}
                {loading && <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Loading...</p>}

                {!loading && filteredInterviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map((i) => (
                      <InterviewCard key={i.id} {...i} />
                    ))}
                  </div>
                ) : (
                  // Show message only if not loading and no results
                  !loading && <p className="text-gray-600 dark:text-gray-400 text-center py-10">No interviews found{selectedCompanies.length > 0 ? ` for selected companies` : ''}.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
 
    </div>
  );
};

export default Index;