// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import CompanyFilter from "@/components/search/CompanyFilter";
import InterviewCard from "@/components/interview/InterviewCard";
import { fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { Button } from "@/components/ui/button";

// --- NEW: Import hardcoded data and type ---
import { hardcodedFeaturedPosts } from "@/data/featuredPosts";
import { InterviewCardProps } from "@/components/interview/InterviewCard";

const Index = () => {
  /* ---------------------------- state ---------------------------- */
  const [loading, setLoading] = useState(true); // For main list fetch
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [allAvailableCompanies, setAllAvailableCompanies] = useState<string[]>([]);
  // --- NEW: State for featured posts ---
  const [featuredInterviews, setFeaturedInterviews] = useState<InterviewCardProps[]>(
    hardcodedFeaturedPosts.map(toCard) // Use .map(toCard)
);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewCardProps[]>([]);
  const navigate = useNavigate();

  /* ------------------------ fetch initial non-featured data ----------------------- */
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      // No need to set loading=true here if featured are hardcoded
      // setLoading(true);
      setError(null);
      try {
        const initialData = await fetchInterviews({ limit: 12 });
        if (isMounted) {
          setFilteredInterviews(initialData.experiences.map(toCard));
          const uniqueCompanies = Array.from(
            new Set(initialData.experiences.map(e => e.company).filter(Boolean))
          ) as string[];
          setAllAvailableCompanies(uniqueCompanies);
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load initial data.");
        }
      } finally {
        // Stop loading only after initial fetch completes
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  /* ------------------------ fetch filtered data when filters change ----------------------- */
   useEffect(() => {
    // Only run if selectedCompanies change *after* the initial load is complete
    if (loading) return;

    let isMounted = true;
    const fetchFilteredData = async () => {
      setLoading(true); // Set loading for filter changes
      setError(null);
      try {
        const companyFilter = selectedCompanies.length > 0 ? selectedCompanies.join(',') : undefined;
        const filteredData = await fetchInterviews({ company: companyFilter, limit: 12 });
        if (isMounted) {
          setFilteredInterviews(filteredData.experiences.map(toCard));
        }
      } catch (err: any) {
        console.error("Error fetching filtered data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load filtered experiences.");
          setFilteredInterviews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchFilteredData();
    return () => { isMounted = false; };
  }, [selectedCompanies]); // Rerun only when selectedCompanies changes


  /* ------------------------ Handlers ----------------------- */
  const handleSelectCompany = (company: string) => { setSelectedCompanies(prev => prev.includes(company) ? prev : [...prev, company]); };
  const handleClearCompany = (company: string) => { setSelectedCompanies(prev => prev.filter(c => c !== company)); };
  const handleClearAllCompanies = () => { setSelectedCompanies([]); };

  /* --------------------------- UI --------------------------- */
  // Simplified Loading/Error: Show loading initially, show error if initial fetch failed
  if (loading && filteredInterviews.length === 0) {
      return (
          <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow flex items-center justify-center"><p>Loading experiences...</p></main>
          </div>
      );
  }
  if (error && filteredInterviews.length === 0) {
      return (
          <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow flex items-center justify-center text-center p-4">
                  <p className="text-red-600">Error: {error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
              </main>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />

        {/* ---------- Featured Section (Using Hardcoded Data) ---------- */}
        {featuredInterviews.length > 0 && (
          <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 text-center md:text-left dark:text-gray-50">Featured Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredInterviews.map((i) => (
                  // Pass isFeatured prop here
                  <InterviewCard key={i.id} {...i} isFeatured={true} />
                ))}
              </div>
            </div>
          </section>
        )}
        {/* ---------- END Featured Section ---------- */}


        {/* ---------- Main List & filters ---------- */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold dark:text-gray-50">All Experiences</h2> {/* Updated Title */}
              <Button
                 variant="ghost"
                 className="text-brand-purple hover:bg-brand-purple-light dark:text-brand-purple-light dark:hover:bg-gray-700"
                 onClick={() => navigate('/search')}
              >
                View All / Search
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <aside className="md:w-1/4 lg:w-1/5">
                <CompanyFilter
                  companies={allAvailableCompanies}
                  selectedCompanies={selectedCompanies}
                  onSelectCompany={handleSelectCompany}
                  onClearCompany={handleClearCompany}
                  onClearAll={handleClearAllCompanies}
                />
              </aside>
              <div className="md:w-3/4 lg:w-4/5">
                {/* Loading indicator for filter changes */}
                {loading && <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Loading...</p>}
                {!loading && filteredInterviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map((i) => (
                      // Regular cards are not featured
                      <InterviewCard key={i.id} {...i} />
                    ))}
                  </div>
                ) : (
                  !loading && <p className="text-gray-600 dark:text-gray-400 text-center py-10">No interviews found{selectedCompanies.length > 0 ? ` for selected companies` : ''}.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer removed as per user's existing code structure */}
    </div>
  );
};

export default Index;