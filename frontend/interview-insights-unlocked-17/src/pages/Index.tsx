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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies,           setCompanies]           = useState<string[]>([]);
  const [featuredInterviews,  setFeaturedInterviews]  = useState<any[]>([]); // Consider using InterviewCardProps[] type
  const [filteredInterviews,  setFilteredInterviews]  = useState<any[]>([]); // Consider using InterviewCardProps[] type
  const navigate = useNavigate(); // Initialize navigate

  /* ------------------------ fetch on mount ----------------------- */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch featured and filtered concurrently for potentially faster load
        const [recentData, pageData] = await Promise.all([
          fetchRecent(3),
          fetchInterviews({ company: selectedCompany ?? undefined, limit: 12 })
        ]);

        if (isMounted) {
          setFeaturedInterviews(recentData.map(toCard));
          setFilteredInterviews(pageData.experiences.map(toCard));
          setCompanies(
            Array.from(
              new Set(pageData.experiences.map(e => e.company).filter(Boolean))
            ) as string[]
          );
        }
      } catch (err: any) {
        console.error("Error fetching data for Index page:", err);
        if (isMounted) {
           setError(err.message || "Failed to load interview experiences.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [selectedCompany]); // Dependency array

  /* --------------------------- UI --------------------------- */
  // Improved Loading/Error states
  if (loading && filteredInterviews.length === 0) { // Show loading only initially
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
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Featured Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredInterviews.map((i) => (
                  <InterviewCard key={i.id} {...i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Recent & filters ---------- */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Recent Experiences</h2>
              {/* --- MODIFIED BUTTON: Points to /search --- */}
              <Button
                 variant="ghost"
                 className="text-brand-purple hover:bg-brand-purple-light"
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
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelectCompany={setSelectedCompany} // This triggers re-fetch via useEffect
                />
              </aside>

              {/* cards */}
              <div className="md:w-3/4 lg:w-4/5"> {/* Adjusted width */}
                {/* Display loading indicator for filter changes */}
                {loading && filteredInterviews.length > 0 && <p className="text-center text-gray-500 mb-4">Loading...</p>}

                {!loading && filteredInterviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map((i) => (
                      <InterviewCard key={i.id} {...i} />
                    ))}
                  </div>
                ) : (
                  // Show message only if not loading and no results
                  !loading && <p className="text-gray-600 text-center py-10">No interviews found{selectedCompany ? ` for ${selectedCompany}` : ''}.</p>
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